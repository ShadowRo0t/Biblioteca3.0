import 'api_service.dart';
import '../models/libro.dart';
import 'auth_service.dart';

class LibroService {
  final AuthService _authService = AuthService();

  Future<List<Libro>> obtenerLibros() async {
    final response = await ApiService.get('/libros');

    if (response['success'] == true) {
      final data = response['data'];
      if (data is List) {
        return data.map((item) => Libro.fromJson(item)).toList();
      }
    }

    return [];
  }

  Future<String?> crearLibro(Map<String, dynamic> payload) async {
    final token = await _authService.getToken();
    if (token == null) return 'No estás autenticado';

    final response = await ApiService.post('/libros', payload, token: token);
    if (response['success'] == true) {
      return null;
    }
    return response['message'] ?? 'Error al crear el libro';
  }

  Future<String?> agregarStock(String libroId, int cantidad) async {
    final token = await _authService.getToken();
    if (token == null) return 'No estás autenticado';

    final response = await ApiService.patch(
      '/libros/$libroId/stock',
      {'cantidad': cantidad},
      token: token,
    );

    if (response['success'] == true) {
      return null;
    }
    return response['message'] ?? 'Error al actualizar stock';
  }

  Future<String?> eliminarLibro(String libroId) async {
    final token = await _authService.getToken();
    if (token == null) return 'No estás autenticado';

    final response = await ApiService.delete('/libros/$libroId', token: token);
    if (response['success'] == true) {
      return null;
    }
    return response['message'] ?? 'Error al eliminar el libro';
  }
}


