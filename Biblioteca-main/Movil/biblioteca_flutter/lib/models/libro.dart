class Libro {
  final int id;
  final String titulo;
  final String autor;
  final String genero;
  final String disponibilidad;
  final String? imagen;
  final String? descripcion;
  final String? anioEdicion;

  Libro({
    required this.id,
    required this.titulo,
    required this.autor,
    required this.genero,
    required this.disponibilidad,
    this.imagen,
    this.descripcion,
    this.anioEdicion,
  });

  bool get estaDisponible => 
      disponibilidad.toLowerCase().contains('disponible');

  factory Libro.fromJson(Map<String, dynamic> json) {
    return Libro(
      id: json['id'] ?? 0,
      titulo: json['titulo'] ?? '',
      autor: json['autor'] ?? '',
      genero: json['genero'] ?? '',
      disponibilidad: json['disponibilidad'] ?? 'Desconocido',
      imagen: json['imagen'],
      descripcion: json['descripcion'],
      anioEdicion: json['anio_edicion'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'titulo': titulo,
      'autor': autor,
      'genero': genero,
      'disponibilidad': disponibilidad,
      'imagen': imagen,
      'descripcion': descripcion,
      'anio_edicion': anioEdicion,
    };
  }
}

