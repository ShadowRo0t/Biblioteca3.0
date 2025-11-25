class Notificacion {
  final String id;
  final String tipo; // 'vencida' o 'devolucion'
  final String libroTitulo;
  final DateTime? fechaDesde;
  final DateTime? fechaHasta;
  final DateTime? fechaDevolucion;
  final int? diasRetraso;
  final int multa;
  final int multaEconomica;
  final String mensaje;

  Notificacion({
    required this.id,
    required this.tipo,
    required this.libroTitulo,
    this.fechaDesde,
    this.fechaHasta,
    this.fechaDevolucion,
    this.diasRetraso,
    required this.multa,
    required this.multaEconomica,
    required this.mensaje,
  });

  factory Notificacion.fromJson(Map<String, dynamic> json) {
    return Notificacion(
      id: json['id'] ?? '',
      tipo: json['tipo'] ?? 'vencida',
      libroTitulo: json['libroTitulo'] ?? '',
      fechaDesde: json['fechaDesde'] != null
          ? DateTime.parse(json['fechaDesde'])
          : null,
      fechaHasta: json['fechaHasta'] != null
          ? DateTime.parse(json['fechaHasta'])
          : null,
      fechaDevolucion: json['fechaDevolucion'] != null
          ? DateTime.parse(json['fechaDevolucion'])
          : null,
      diasRetraso: json['diasRetraso'],
      multa: json['multa'] ?? 0,
      multaEconomica: json['multaEconomica'] ?? 0,
      mensaje: json['mensaje'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tipo': tipo,
      'libroTitulo': libroTitulo,
      'fechaDesde': fechaDesde?.toIso8601String(),
      'fechaHasta': fechaHasta?.toIso8601String(),
      'fechaDevolucion': fechaDevolucion?.toIso8601String(),
      'diasRetraso': diasRetraso,
      'multa': multa,
      'multaEconomica': multaEconomica,
      'mensaje': mensaje,
    };
  }
}
