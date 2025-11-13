import 'api_service.dart';
import '../models/reserva.dart';
import 'auth_service.dart';

class ReservaService {
  final AuthService _authService = AuthService();

  Future<List<Reserva>> getReservas() async {
    final token = await _authService.getToken();
    if (token == null) return [];

    final response = await ApiService.get('/reservas', token: token);

    if (response['success'] == true) {
      final data = response['data'];
      if (data is List) {
        return data.map((json) => Reserva.fromJson(json)).toList();
      }
    }

    return [];
  }

  Future<bool> crearReserva({
    required int libroId,
    required DateTime desde,
    required DateTime hasta,
    String tipo = 'prestamo',
  }) async {
    final token = await _authService.getToken();
    if (token == null) return false;

    final response = await ApiService.post(
      '/reservas',
      {
        'libro_id': libroId,
        'tipo': tipo,
        'desde': desde.toIso8601String().split('T')[0],
        'hasta': hasta.toIso8601String().split('T')[0],
      },
      token: token,
    );

    return response['success'] == true;
  }

  Future<String?> getCrearReservaError({
    required int libroId,
    required DateTime desde,
    required DateTime hasta,
    String tipo = 'prestamo',
  }) async {
    final token = await _authService.getToken();
    if (token == null) return 'No estás autenticado';

    final response = await ApiService.post(
      '/reservas',
      {
        'libro_id': libroId,
        'tipo': tipo,
        'desde': desde.toIso8601String().split('T')[0],
        'hasta': hasta.toIso8601String().split('T')[0],
      },
      token: token,
    );

    if (response['success'] == true) {
      return null;
    }

    return response['message'] ?? 'Error al crear la reserva';
  }

  Future<bool> eliminarReserva(String reservaId) async {
    final token = await _authService.getToken();
    if (token == null) return false;

    final response = await ApiService.delete(
      '/reservas/$reservaId',
      token: token,
    );

    return response['success'] == true;
  }

  Future<String?> getEliminarReservaError(String reservaId) async {
    final token = await _authService.getToken();
    if (token == null) return 'No estás autenticado';

    final response = await ApiService.delete(
      '/reservas/$reservaId',
      token: token,
    );

    if (response['success'] == true) {
      return null;
    }

    return response['message'] ?? 'Error al eliminar la reserva';
  }
}

