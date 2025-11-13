import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../data/libros_data.dart';
import '../models/libro.dart';
import '../services/reserva_service.dart';
import 'package:intl/intl.dart';

class CatalogoScreen extends StatefulWidget {
  const CatalogoScreen({super.key});

  @override
  State<CatalogoScreen> createState() => _CatalogoScreenState();
}

class _CatalogoScreenState extends State<CatalogoScreen> {
  final _searchController = TextEditingController();
  final _reservaService = ReservaService();
  List<Libro> _libros = [];
  List<Libro> _filteredLibros = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadLibros();
    _searchController.addListener(_filterLibros);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadLibros() {
    setState(() {
      _libros = LibrosData.getLibros();
      _filteredLibros = _libros;
    });
  }

  void _filterLibros() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredLibros = _libros;
      } else {
        _filteredLibros = _libros.where((libro) {
          return libro.titulo.toLowerCase().contains(query) ||
              libro.autor.toLowerCase().contains(query) ||
              libro.genero.toLowerCase().contains(query);
        }).toList();
      }
    });
  }

  Future<void> _crearReserva(Libro libro) async {
    if (!libro.estaDisponible) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Este libro no está disponible'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final hoy = DateTime.now();
    final hasta = hoy.add(const Duration(days: 7));

    setState(() => _isLoading = true);

    final errorMessage = await _reservaService.getCrearReservaError(
      libroId: libro.id,
      desde: hoy,
      hasta: hasta,
    );

    if (!mounted) return;

    setState(() => _isLoading = false);

    if (errorMessage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ Reserva creada para "${libro.titulo}" (7 días)'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Catálogo de Libros'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Buscar libros...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredLibros.isEmpty
                    ? const Center(
                        child: Text('No se encontraron libros'),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16.0),
                        itemCount: _filteredLibros.length,
                        itemBuilder: (context, index) {
                          final libro = _filteredLibros[index];
                          return _LibroCard(
                            libro: libro,
                            onReservar: () => _crearReserva(libro),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

class _LibroCard extends StatelessWidget {
  final Libro libro;
  final VoidCallback onReservar;

  const _LibroCard({
    required this.libro,
    required this.onReservar,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (libro.imagen != null)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(12),
              ),
              child: Image.network(
                libro.imagen!,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    height: 200,
                    color: Colors.grey[300],
                    child: const Icon(Icons.book, size: 64),
                  );
                },
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  libro.titulo,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Autor: ${libro.autor}',
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Género: ${libro.genero}',
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: libro.estaDisponible
                            ? Colors.green[100]
                            : Colors.red[100],
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        libro.disponibilidad,
                        style: TextStyle(
                          color: libro.estaDisponible
                              ? Colors.green[800]
                              : Colors.red[800],
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: libro.estaDisponible ? onReservar : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF28a745),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('Reservar'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

