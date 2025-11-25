import '../models/libro.dart';

class LibrosData {
  static List<Libro> getLibros() {
    return [
      Libro(
        id: '1',
        titulo: 'Cien años de soledad',
        autor: 'Gabriel García Márquez',
        genero: 'Novela',
        disponibilidad: 'Disponible',
        copiasTotales: 10,
        copiasDisponibles: 5,
        imagen:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT40DdhptlKmZrqWs42vaYh5q8dDTYqSjac2g&s',
        descripcion:
            'Una de las obras más importantes de la literatura hispanoamericana.',
        anioEdicion: '1967',
      ),
      Libro(
        id: '2',
        titulo: 'Don Quijote de la Mancha',
        autor: 'Miguel de Cervantes',
        genero: 'Narrativo',
        disponibilidad: 'Agotado',
        copiasTotales: 5,
        copiasDisponibles: 0,
        imagen:
            'https://www.elejandria.com/covers/Don_Quijote_de_la_Mancha-Cervantes_Miguel-lg.png',
        descripcion:
            'La historia del caballero andante y su escudero Sancho Panza.',
        anioEdicion: '1605',
      ),
      Libro(
        id: '3',
        titulo: 'El Principito',
        autor: 'Antoine de Saint-Exupéry',
        genero: 'Infantil',
        disponibilidad: 'Disponible',
        copiasTotales: 15,
        copiasDisponibles: 8,
        imagen:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGS4EXMwDImmp1Hi_uCZebMn8bCVnF6JPyww&s',
        descripcion:
            'Un clásico que explora la infancia, la imaginación y la amistad.',
        anioEdicion: '1943',
      ),
      Libro(
        id: '4',
        titulo: 'Crepúsculo',
        autor: 'Stephenie Meyer',
        genero: 'Fantasía',
        disponibilidad: 'Disponible',
        copiasTotales: 12,
        copiasDisponibles: 4,
        imagen:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp80W-_ySBHlkvUtqDeOpwfYok3oSG9uY7qw&s',
        descripcion: 'Un clásico que explora el amor sobrenatural.',
        anioEdicion: '2005',
      ),
      Libro(
        id: '5',
        titulo: 'La Odisea',
        autor: 'Homero',
        genero: 'Épico',
        disponibilidad: 'Disponible',
        copiasTotales: 8,
        copiasDisponibles: 3,
        imagen:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-do1cARnM5ZjqdKeSUiaUpqTzrkRVOWEfpg&s',
        descripcion: 'Historia del héroe griego Ulises.',
        anioEdicion: 'Siglo VIII a. C.',
      ),
      Libro(
        id: '6',
        titulo: 'Harry Potter y la piedra filosofal',
        autor: 'J. K. Rowling',
        genero: 'Fantasía',
        disponibilidad: 'Agotado',
        copiasTotales: 20,
        copiasDisponibles: 0,
        imagen:
            'https://imgv2-1-f.scribdassets.com/img/word_document/636301739/original/216x287/f40ab5f3e7/1752077214?v=1',
        descripcion: 'Historia de un niño que descubre que es mago.',
        anioEdicion: '1997',
      ),
      Libro(
        id: '7',
        titulo: 'Papelucho detective',
        autor: 'Marcela Paz',
        genero: 'Ficción',
        disponibilidad: 'Disponible',
        copiasTotales: 10,
        copiasDisponibles: 6,
        imagen:
            'https://dojiw2m9tvv09.cloudfront.net/82626/product/asdsdsfasdasd3465.png',
        descripcion: 'Un niño ingenioso se convierte en detective amateur.',
        anioEdicion: '1956',
      ),
      Libro(
        id: '8',
        titulo: 'Diario de Ana Frank',
        autor: 'Ana Frank',
        genero: 'Biografía',
        disponibilidad: 'Disponible',
        copiasTotales: 10,
        copiasDisponibles: 2,
        imagen:
            'https://www.antartica.cl/media/catalog/product/9/7/9789878354194_1.png',
        descripcion:
            'Relato íntimo durante el escondite en el anexo secreto de Ámsterdam.',
        anioEdicion: '1947',
      ),
    ];
  }
}
