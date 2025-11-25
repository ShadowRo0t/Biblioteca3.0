import 'package:flutter/material.dart';
import '../services/reserva_service.dart';
import '../services/notification_service.dart';
import '../models/reserva.dart';
import 'package:intl/intl.dart';
import '../widgets/custom_drawer.dart';

class AdminPrestamosScreen extends StatefulWidget {
  const AdminPrestamosScreen({super.key});

  @override
  State<AdminPrestamosScreen> createState() => _AdminPrestamosScreenState();
}

class _AdminPrestamosScreenState extends State<AdminPrestamosScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _reservaService = ReservaService();
  final _notificationService = NotificationService();

  List<Reserva> _solicitudes = [];
  List<Reserva> _vencidos = [];
  bool _isLoading = false;

  final _libroIdController = TextEditingController();
  String? _mensajeDevolucion;
  String? _errorDevolucion;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        setState(() {
          _mensajeDevolucion = null;
          _errorDevolucion = null;
        });
        if (_tabController.index == 0) {
          _cargarSolicitudes();
        } else if (_tabController.index == 1) {
          _cargarVencidos();
        }
      }
    });
    _cargarSolicitudes();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _libroIdController.dispose();
    super.dispose();
  }

  Future<void> _cargarSolicitudes() async {
    setState(() => _isLoading = true);
    final reservas = await _reservaService.getReservas();
    setState(() {
      _solicitudes = reservas.where((r) => r.estado == 'activa').toList();
      _isLoading = false;
    });
  }

  Future<void> _cargarVencidos() async {
    setState(() => _isLoading = true);
    final vencidos = await _reservaService.getVencidas();
    setState(() {
      _vencidos = vencidos;
      _isLoading = false;
    });
  }

  Future<void> _procesarDevolucion() async {
    if (_libroIdController.text.isEmpty) return;

    setState(() {
      _mensajeDevolucion = null;
      _errorDevolucion = null;
      _isLoading = true;
    });

    final resultado =
        await _reservaService.devolverLibro(_libroIdController.text);

    setState(() => _isLoading = false);

    if (resultado != null) {
      // Crear notificación de devolución
      if (resultado['libro'] != null && resultado['multa_economica'] != null) {
        await _notificationService.crearNotificacionDevolucion(
          resultado['libro'],
          resultado['multa_dias'] ?? 0,
          resultado['multa_economica'],
        );
      }

      setState(() {
        final usuario = resultado['usuario'] ?? '';
        final libro = resultado['libro'] ?? '';
        final multaEcon = resultado['multa_economica'] ?? 0;
        _mensajeDevolucion =
            'Devolución exitosa. Usuario: $usuario. Libro: $libro. Multa: \$$multaEcon';
        _libroIdController.clear();
      });
      _cargarSolicitudes();
      _cargarVencidos();
    } else {
      setState(() => _errorDevolucion = 'Error al procesar devolución');
    }
  }

  Future<void> _eliminarPrestamo(String id, String tipo) async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar eliminación'),
        content: const Text(
            '¿Está seguro de eliminar este préstamo? Esta acción no se puede deshacer.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmar != true) return;

    final exito = await _reservaService.eliminarReserva(id);

    if (exito) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Préstamo eliminado exitosamente')),
        );
      }
      if (tipo == 'activo') {
        _cargarSolicitudes();
      } else {
        _cargarVencidos();
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error al eliminar el préstamo')),
        );
      }
    }
  }

  int _calcularDiasAtraso(DateTime fechaVencimiento) {
    final ahora = DateTime.now();
    final diferencia = ahora.difference(fechaVencimiento).inDays;
    return diferencia > 0 ? diferencia : 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Préstamos'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Préstamos Activos'),
            Tab(text: 'Vencidos / Mora'),
            Tab(text: 'Devolución'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              if (_tabController.index == 0) {
                _cargarSolicitudes();
              } else if (_tabController.index == 1) {
                _cargarVencidos();
              }
            },
          ),
          Builder(
            builder: (context) => IconButton(
              icon: const Icon(Icons.menu),
              onPressed: () => Scaffold.of(context).openEndDrawer(),
            ),
          ),
        ],
      ),
      endDrawer: const CustomDrawer(),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPrestamosActivos(),
          _buildVencidos(),
          _buildDevolucion(),
        ],
      ),
    );
  }

  Widget _buildPrestamosActivos() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_solicitudes.isEmpty) {
      return const Center(
        child: Text('No hay préstamos activos'),
      );
    }

    return RefreshIndicator(
      onRefresh: _cargarSolicitudes,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _solicitudes.length,
        itemBuilder: (context, index) {
          final reserva = _solicitudes[index];
          return _buildPrestamoCard(reserva);
        },
      ),
    );
  }

  Widget _buildVencidos() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_vencidos.isEmpty) {
      return const Center(
        child: Text('No hay préstamos vencidos'),
      );
    }

    return RefreshIndicator(
      onRefresh: _cargarVencidos,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _vencidos.length,
        itemBuilder: (context, index) {
          final reserva = _vencidos[index];
          final diasAtraso = _calcularDiasAtraso(reserva.hasta);
          return _buildVencidoCard(reserva, diasAtraso);
        },
      ),
    );
  }

  Widget _buildDevolucion() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Procesar Devolución',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _libroIdController,
            decoration: const InputDecoration(
              labelText: 'ID del Libro',
              hintText: 'Ingrese o escanee el ID del libro',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _isLoading ? null : _procesarDevolucion,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.all(16),
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
            ),
            child: _isLoading
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text('Registrar Devolución'),
          ),
          if (_mensajeDevolucion != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                _mensajeDevolucion!,
                style: TextStyle(color: Colors.green[800]),
              ),
            ),
          ],
          if (_errorDevolucion != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                _errorDevolucion!,
                style: TextStyle(color: Colors.red[800]),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPrestamoCard(Reserva reserva) {
    final dateFormat = DateFormat('dd/MM/yyyy');

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.person, size: 16, color: Colors.grey),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    reserva.user?.name ?? 'Usuario no disponible',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: reserva.tipo == 'sala'
                        ? Colors.blue[100]
                        : Colors.purple[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    reserva.tipo.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: reserva.tipo == 'sala'
                          ? Colors.blue[800]
                          : Colors.purple[800],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              reserva.libro?.titulo ?? 'Libro no disponible',
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            // ID del Libro
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'ID: ${reserva.libroId}',
                style: const TextStyle(
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: Colors.black87,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                const SizedBox(width: 4),
                Text(
                  'Desde: ${dateFormat.format(reserva.desde)}',
                  style: const TextStyle(fontSize: 12),
                ),
                const SizedBox(width: 16),
                const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                const SizedBox(width: 4),
                Text(
                  'Hasta: ${dateFormat.format(reserva.hasta)}',
                  style: const TextStyle(fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Botón Eliminar
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton.icon(
                onPressed: () => _eliminarPrestamo(reserva.id, 'activo'),
                icon: const Icon(Icons.delete, size: 16),
                label: const Text('Eliminar'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVencidoCard(Reserva reserva, int diasAtraso) {
    final dateFormat = DateFormat('dd/MM/yyyy');
    final multaEconomica = diasAtraso * 1000; // $1000 por día

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      color: Colors.red[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    reserva.user?.name ?? 'Usuario no disponible',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$diasAtraso días',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              reserva.libro?.titulo ?? 'Libro no disponible',
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.warning, size: 14, color: Colors.orange),
                const SizedBox(width: 4),
                Text(
                  'Vencimiento: ${dateFormat.format(reserva.hasta)}',
                  style: const TextStyle(fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Multa económica
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red[100],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red),
              ),
              child: Row(
                children: [
                  const Icon(Icons.attach_money, size: 16, color: Colors.red),
                  const SizedBox(width: 4),
                  Text(
                    'Multa: \$$multaEconomica',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.red,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            // Botón Eliminar
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton.icon(
                onPressed: () => _eliminarPrestamo(reserva.id, 'vencido'),
                icon: const Icon(Icons.delete, size: 16),
                label: const Text('Eliminar'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
