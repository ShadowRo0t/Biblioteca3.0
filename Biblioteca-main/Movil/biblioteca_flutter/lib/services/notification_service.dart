import 'dart:async';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';
import 'auth_service.dart';
import '../models/notificacion.dart';
import 'package:intl/intl.dart';

class NotificationService {
  final AuthService _authService = AuthService();

  static const int POLLING_INTERVAL = 30; // segundos
  static const int MULTA_POR_DIA = 1000; // $1000 por día

  Timer? _pollingTimer;
  final _notificacionesController =
      StreamController<List<Notificacion>>.broadcast();

  Stream<List<Notificacion>> get notificaciones$ =>
      _notificacionesController.stream;

  Set<String> _notificacionesVistas = {};
  List<Notificacion> _notificacionesDevolucion = [];

  NotificationService() {
    _cargarDesdePreferencias();
  }

  // Cargar notificaciones vistas y de devolución desde SharedPreferences
  Future<void> _cargarDesdePreferencias() async {
    final prefs = await SharedPreferences.getInstance();

    // Cargar vistas
    final vistasJson = prefs.getString('notificaciones_vistas');
    if (vistasJson != null) {
      final List<dynamic> vistas = jsonDecode(vistasJson);
      _notificacionesVistas = vistas.map((e) => e.toString()).toSet();
    }

    // Cargar devoluciones
    final devolucionJson = prefs.getString('notificaciones_devolucion');
    if (devolucionJson != null) {
      final List<dynamic> devolucion = jsonDecode(devolucionJson);
      _notificacionesDevolucion = devolucion
          .map((json) => Notificacion.fromJson(json as Map<String, dynamic>))
          .toList();
    }
  }

  // Calcular días de retraso
  int _calcularDiasRetraso(DateTime fechaHasta) {
    final ahora = DateTime.now();
    final diferencia = ahora.difference(fechaHasta).inDays;
    return diferencia > 0 ? diferencia : 0;
  }

  // Formatear fecha
  String _formatearFecha(DateTime fecha) {
    final formato = DateFormat('dd/MM/yyyy HH:mm');
    return formato.format(fecha);
  }

  // Crear mensaje para vencida
  String _crearMensajeVencida(Notificacion notif) {
    final fechaDesdeStr = _formatearFecha(notif.fechaDesde!);
    final fechaHastaStr = _formatearFecha(notif.fechaHasta!);

    return 'Buenos días, estimado/a usuario/a, le queremos comentar que su reserva del libro "${notif.libroTitulo}" necesita ser devuelto, según los datos de fecha "$fechaDesdeStr - $fechaHastaStr", por estos inconvenientes, se le aplicará una multa de ${notif.diasRetraso} día(s) equivalente a \$${notif.multaEconomica}';
  }

  // Crear mensaje para devolución
  String _crearMensajeDevolucion(Notificacion notif) {
    final fechaStr = _formatearFecha(notif.fechaDevolucion!);
    return 'Libro "${notif.libroTitulo}" devuelto con éxito y pagado el $fechaStr con multa de \$${notif.multaEconomica}';
  }

  // Obtener notificaciones (vencidas + devoluciones)
  Future<List<Notificacion>> fetchNotificaciones() async {
    final token = await _authService.getToken();
    if (token == null) return [..._notificacionesDevolucion];

    try {
      final response = await ApiService.get('/reservas/vencidas', token: token);

      if (response['success'] == true) {
        final data = response['data'];

        // Notificaciones vencidas (filtrar las vistas)
        List<Notificacion> notifVencidas = [];
        if (data is List) {
          notifVencidas = data
              .where(
                  (reserva) => !_notificacionesVistas.contains(reserva['_id']))
              .map((reserva) {
            final diasRetraso =
                _calcularDiasRetraso(DateTime.parse(reserva['hasta']));
            final notif = Notificacion(
              id: reserva['_id'] ?? '',
              tipo: 'vencida',
              libroTitulo:
                  reserva['libro_id']?['titulo'] ?? 'Libro desconocido',
              fechaDesde: DateTime.parse(reserva['desde']),
              fechaHasta: DateTime.parse(reserva['hasta']),
              diasRetraso: diasRetraso,
              multa: diasRetraso,
              multaEconomica: diasRetraso * MULTA_POR_DIA,
              mensaje: '',
            );

            return Notificacion(
              id: notif.id,
              tipo: notif.tipo,
              libroTitulo: notif.libroTitulo,
              fechaDesde: notif.fechaDesde,
              fechaHasta: notif.fechaHasta,
              diasRetraso: notif.diasRetraso,
              multa: notif.multa,
              multaEconomica: notif.multaEconomica,
              mensaje: _crearMensajeVencida(notif),
            );
          }).toList();
        }

        // Combinar con notificaciones de devolución
        final todasNotificaciones = [
          ...notifVencidas,
          ..._notificacionesDevolucion
        ];
        _notificacionesController.add(todasNotificaciones);
        return todasNotificaciones;
      }
    } catch (e) {
      print('Error obteniendo notificaciones: $e');
    }

    // En caso de error, retornar solo las de devolución
    _notificacionesController.add([..._notificacionesDevolucion]);
    return [..._notificacionesDevolucion];
  }

  // Marcar como vista
  Future<void> marcarComoVista(String id) async {
    if (id.startsWith('dev_')) {
      // Notificación de devolución: eliminar
      _notificacionesDevolucion.removeWhere((n) => n.id == id);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
          'notificaciones_devolucion',
          jsonEncode(
              _notificacionesDevolucion.map((n) => n.toJson()).toList()));
    } else {
      // Notificación vencida: marcar como vista
      _notificacionesVistas.add(id);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
          'notificaciones_vistas', jsonEncode(_notificacionesVistas.toList()));
    }

    await fetchNotificaciones();
  }

  // Crear notificación de devolución
  Future<void> crearNotificacionDevolucion(
    String libroTitulo,
    int multa,
    int multaEconomica,
  ) async {
    final notif = Notificacion(
      id: 'dev_${DateTime.now().millisecondsSinceEpoch}',
      tipo: 'devolucion',
      libroTitulo: libroTitulo,
      fechaDevolucion: DateTime.now(),
      multa: multa,
      multaEconomica: multaEconomica,
      mensaje: '',
    );

    final notifConMensaje = Notificacion(
      id: notif.id,
      tipo: notif.tipo,
      libroTitulo: notif.libroTitulo,
      fechaDevolucion: notif.fechaDevolucion,
      multa: notif.multa,
      multaEconomica: notif.multaEconomica,
      mensaje: _crearMensajeDevolucion(notif),
    );

    _notificacionesDevolucion.add(notifConMensaje);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('notificaciones_devolucion',
        jsonEncode(_notificacionesDevolucion.map((n) => n.toJson()).toList()));

    await fetchNotificaciones();
  }

  // Iniciar polling
  void iniciarPolling() {
    if (_pollingTimer != null) return;

    // Primera carga inmediata
    fetchNotificaciones();

    // Polling periódico
    _pollingTimer = Timer.periodic(
      Duration(seconds: POLLING_INTERVAL),
      (_) => fetchNotificaciones(),
    );
  }

  // Detener polling
  void detenerPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  // Limpiar datos al cerrar sesión
  Future<void> limpiarDatos() async {
    _notificacionesVistas.clear();
    _notificacionesDevolucion.clear();

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('notificaciones_vistas');
    await prefs.remove('notificaciones_devolucion');

    _notificacionesController.add([]);
  }

  void dispose() {
    detenerPolling();
    _notificacionesController.close();
  }
}
