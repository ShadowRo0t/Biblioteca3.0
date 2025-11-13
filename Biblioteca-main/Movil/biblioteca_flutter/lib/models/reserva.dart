import 'libro.dart';

class Reserva {
  final String id;
  final String userId;
  final String libroId;
  final String tipo;
  final DateTime desde;
  final DateTime hasta;
  final String estado;
  final Libro? libro;

  Reserva({
    required this.id,
    required this.userId,
    required this.libroId,
    required this.tipo,
    required this.desde,
    required this.hasta,
    required this.estado,
    this.libro,
  });

  factory Reserva.fromJson(Map<String, dynamic> json) {
    return Reserva(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      libroId: json['libro_id']?.toString() ?? '',
      tipo: json['tipo'] ?? 'prestamo',
      desde: json['desde'] != null
          ? DateTime.parse(json['desde'])
          : DateTime.now(),
      hasta: json['hasta'] != null
          ? DateTime.parse(json['hasta'])
          : DateTime.now(),
      estado: json['estado'] ?? 'activa',
      libro: json['libro'] != null
          ? Libro.fromJson(json['libro'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'libro_id': libroId,
      'tipo': tipo,
      'desde': desde.toIso8601String().split('T')[0],
      'hasta': hasta.toIso8601String().split('T')[0],
    };
  }
}
