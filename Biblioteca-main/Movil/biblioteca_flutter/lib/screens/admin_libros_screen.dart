import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/libro.dart';
import '../services/libro_service.dart';
import '../services/auth_service.dart';

class AdminLibrosScreen extends StatefulWidget {
  const AdminLibrosScreen({super.key});

  @override
  State<AdminLibrosScreen> createState() => _AdminLibrosScreenState();
}

class _AdminLibrosScreenState extends State<AdminLibrosScreen> {
  final _libroService = LibroService();
  final _authService = AuthService();

  final _formCrearKey = GlobalKey<FormState>();
  final _formStockKey = GlobalKey<FormState>();

  final _tituloController = TextEditingController();
  final _autorController = TextEditingController();
  final _generoController = TextEditingController();
  final _descripcionController = TextEditingController();
  final _anioController = TextEditingController();
  final _imagenController = TextEditingController();
  final _copiasController = TextEditingController(text: '1');

  final _stockCantidadController = TextEditingController(text: '1');

  List<Libro> _libros = [];
  String? _libroSeleccionadoStock;

  bool _cargando = false;
  bool _cargandoLista = false;

  @override
  void initState() {
    super.initState();
    _verificarAdminYcargar();
  }

  @override
  void dispose() {
    _tituloController.dispose();
    _autorController.dispose();
    _generoController.dispose();
    _descripcionController.dispose();
    _anioController.dispose();
    _imagenController.dispose();
    _copiasController.dispose();
    _stockCantidadController.dispose();
    super.dispose();
  }

  Future<void> _verificarAdminYcargar() async {
    final user = await _authService.getUser();
    if (user?.role != 'admin') {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Necesitas privilegios de administrador para acceder.'),
          backgroundColor: Colors.red,
        ),
      );
      if (mounted) Navigator.of(context).pop();
      return;
    }
    await _cargarLibros();
  }

  Future<void> _cargarLibros() async {
    setState(() => _cargandoLista = true);
    final libros = await _libroService.obtenerLibros();
    if (!mounted) return;
    setState(() {
      _libros = libros;
      if (_libros.isNotEmpty) {
        _libroSeleccionadoStock ??= _libros.first.id;
      } else {
        _libroSeleccionadoStock = null;
      }
      _cargandoLista = false;
    });
  }

  Future<void> _crearLibro() async {
    if (!_formCrearKey.currentState!.validate()) return;

    setState(() => _cargando = true);

    final payload = {
      'titulo': _tituloController.text.trim(),
      'autor': _autorController.text.trim(),
      'genero': _generoController.text.trim(),
      'descripcion': _descripcionController.text.trim(),
      'anio_edicion': _anioController.text.trim(),
      'imagen': _imagenController.text.trim().isEmpty ? null : _imagenController.text.trim(),
      'copias_totales': int.tryParse(_copiasController.text) ?? 1,
      'copias_disponibles': int.tryParse(_copiasController.text) ?? 1,
    };

    final error = await _libroService.crearLibro(payload);

    if (!mounted) return;

    if (error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Libro creado correctamente.'),
          backgroundColor: Colors.green,
        ),
      );
      _tituloController.clear();
      _autorController.clear();
      _generoController.clear();
      _descripcionController.clear();
      _anioController.clear();
      _imagenController.clear();
      _copiasController.text = '1';
      await _cargarLibros();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: Colors.red,
        ),
      );
    }

    if (mounted) setState(() => _cargando = false);
  }

  Future<void> _agregarStock() async {
    if (_libroSeleccionadoStock == null) return;
    if (!_formStockKey.currentState!.validate()) return;

    setState(() => _cargando = true);

    final cantidad = int.tryParse(_stockCantidadController.text) ?? 1;
    final error = await _libroService.agregarStock(_libroSeleccionadoStock!, cantidad);

    if (!mounted) return;

    if (error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Se añadieron $cantidad copias al libro seleccionado.'),
          backgroundColor: Colors.green,
        ),
      );
      await _cargarLibros();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: Colors.red,
        ),
      );
    }

    if (mounted) setState(() => _cargando = false);
  }

  Future<void> _eliminarLibro(Libro libro) async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar libro'),
        content: Text('¿Eliminar definitivamente "${libro.titulo}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmar != true) return;

    setState(() => _cargando = true);
    final error = await _libroService.eliminarLibro(libro.id);

    if (!mounted) return;

    if (error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Libro "${libro.titulo}" eliminado.'),
          backgroundColor: Colors.green,
        ),
      );
      await _cargarLibros();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: Colors.red,
        ),
      );
    }

    if (mounted) setState(() => _cargando = false);
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.decimalPattern();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Administrar libros'),
        actions: [
          IconButton(
            onPressed: _cargandoLista ? null : _cargarLibros,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              elevation: 3,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  key: _formCrearKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Registrar nuevo libro',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _tituloController,
                        decoration: const InputDecoration(labelText: 'Título'),
                        validator: (value) =>
                            value == null || value.trim().isEmpty ? 'El título es obligatorio' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _autorController,
                        decoration: const InputDecoration(labelText: 'Autor'),
                        validator: (value) =>
                            value == null || value.trim().isEmpty ? 'El autor es obligatorio' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _generoController,
                        decoration: const InputDecoration(labelText: 'Género'),
                        validator: (value) =>
                            value == null || value.trim().isEmpty ? 'El género es obligatorio' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _anioController,
                        decoration: const InputDecoration(labelText: 'Año de edición'),
                        validator: (value) =>
                            value == null || value.trim().isEmpty ? 'El año es obligatorio' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _descripcionController,
                        decoration: const InputDecoration(labelText: 'Descripción'),
                        maxLines: 3,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _imagenController,
                        decoration: const InputDecoration(labelText: 'URL de la imagen (opcional)'),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _copiasController,
                        decoration: const InputDecoration(labelText: 'Copias totales'),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          final numero = int.tryParse(value ?? '');
                          if (numero == null || numero < 0) {
                            return 'Ingresa un número válido de copias';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _cargando ? null : _crearLibro,
                          icon: const Icon(Icons.save),
                          label: const Text('Guardar libro'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Card(
              elevation: 3,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  key: _formStockKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Añadir existencias',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _libroSeleccionadoStock,
                        decoration: const InputDecoration(labelText: 'Selecciona un libro'),
                        items: _libros
                            .map(
                              (libro) => DropdownMenuItem(
                                value: libro.id,
                                child: Text(libro.titulo),
                              ),
                            )
                            .toList(),
                        onChanged: (value) => setState(() => _libroSeleccionadoStock = value),
                        validator: (value) =>
                            value == null ? 'Selecciona un libro antes de añadir stock' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _stockCantidadController,
                        decoration: const InputDecoration(labelText: 'Cantidad a añadir'),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          final numero = int.tryParse(value ?? '');
                          if (numero == null || numero <= 0) {
                            return 'Ingresa un número mayor a cero';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _cargando ? null : _agregarStock,
                          icon: const Icon(Icons.add),
                          label: const Text('Añadir copias'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Libros registrados',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            if (_cargandoLista)
              const Center(child: Padding(
                padding: EdgeInsets.all(24.0),
                child: CircularProgressIndicator(),
              ))
            else if (_libros.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(child: Text('No hay libros registrados.')),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _libros.length,
                itemBuilder: (context, index) {
                  final libro = _libros[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.green[100],
                        child: Text(
                          libro.titulo.isNotEmpty ? libro.titulo[0].toUpperCase() : '?',
                          style: const TextStyle(color: Colors.green),
                        ),
                      ),
                      title: Text(libro.titulo),
                      subtitle: Text(
                        '${libro.autor}\nDisponibles: ${formatter.format(libro.copiasDisponibles)} / ${formatter.format(libro.copiasTotales)}',
                      ),
                      isThreeLine: true,
                      trailing: IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: _cargando ? null : () => _eliminarLibro(libro),
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}


