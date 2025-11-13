class Libro {
  final String id;
  final String titulo;
  final String autor;
  final String genero;
  final String disponibilidad;
  final int copiasTotales;
  final int copiasDisponibles;
  final String? imagen;
  final String? descripcion;
  final String? anioEdicion;

  Libro({
    required this.id,
    required this.titulo,
    required this.autor,
    required this.genero,
    required this.disponibilidad,
    required this.copiasTotales,
    required this.copiasDisponibles,
    this.imagen,
    this.descripcion,
    this.anioEdicion,
  });

  bool get estaDisponible =>
      disponibilidad.toLowerCase().contains('disponible') && copiasDisponibles > 0;

  factory Libro.fromJson(Map<String, dynamic> json) {
    return Libro(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      titulo: json['titulo'] ?? '',
      autor: json['autor'] ?? '',
      genero: json['genero'] ?? '',
      disponibilidad: json['disponibilidad'] ?? 'Desconocido',
      copiasTotales: json['copias_totales'] is int
          ? json['copias_totales']
          : int.tryParse('${json['copias_totales'] ?? 0}') ?? 0,
      copiasDisponibles: json['copias_disponibles'] is int
          ? json['copias_disponibles']
          : int.tryParse('${json['copias_disponibles'] ?? 0}') ?? 0,
      imagen: json['imagen'],
      descripcion: json['descripcion'],
      anioEdicion: json['anio_edicion'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'titulo': titulo,
      'autor': autor,
      'genero': genero,
      'disponibilidad': disponibilidad,
      'copias_totales': copiasTotales,
      'copias_disponibles': copiasDisponibles,
      'imagen': imagen,
      'descripcion': descripcion,
      'anio_edicion': anioEdicion,
    };
  }
}
