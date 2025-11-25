const mongoose = require('mongoose');
const User = require('../models/User');
const Libro = require('../models/Libro');
require('dotenv').config();

const librosIniciales = [
  {
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    genero: 'Novela realista, realismo mágico',
    descripcion: 'Una de las obras más importantes de la literatura hispanoamericana.',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT40DdhptlKmZrqWs42vaYh5q8dDTYqSjac2g&s',
    anio_edicion: '1967',
    copias_totales: 5,
    copias_disponibles: 5
  },
  {
    titulo: 'Don Quijote de la Mancha',
    autor: 'Miguel de Cervantes',
    genero: 'Narrativa, novela de aventuras',
    descripcion: 'La historia del caballero andante y su escudero Sancho Panza.',
    imagen: 'https://www.elejandria.com/covers/Don_Quijote_de_la_Mancha-Cervantes_Miguel-lg.png',
    anio_edicion: '1605',
    copias_totales: 3,
    copias_disponibles: 0
  },
  {
    titulo: 'El Principito',
    autor: 'Antoine de Saint-Exupéry',
    genero: 'Novela corta, literatura infantil',
    descripcion: 'Un clásico que explora la infancia, la imaginación y la amistad.',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGS4EXMwDImmp1Hi_uCZebMn8bCVnF6JPyww&s',
    anio_edicion: '1943',
    copias_totales: 4,
    copias_disponibles: 4
  },
  {
    titulo: 'Crepúsculo',
    autor: 'Stephenie Meyer',
    genero: 'Novela fantástica, romance',
    descripcion: 'Un clásico contemporáneo sobre el amor sobrenatural.',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp80W-_ySBHlkvUtqDeOpwfYok3oSG9uY7qw&s',
    anio_edicion: '2005',
    copias_totales: 3,
    copias_disponibles: 3
  },
  {
    titulo: 'La Odisea',
    autor: 'Homero',
    genero: 'Poesía épica',
    descripcion: 'La historia del héroe griego Ulises.',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-do1cARnM5ZjqdKeSUiaUpqTzrkRVOWEfpg&s',
    anio_edicion: 'Siglo VIII a. C.',
    copias_totales: 2,
    copias_disponibles: 2
  },
  {
    titulo: 'Harry Potter y la piedra filosofal',
    autor: 'J. K. Rowling',
    genero: 'Novela fantástica',
    descripcion: 'Historia de un niño que descubre que es mago.',
    imagen: 'https://imgv2-1-f.scribdassets.com/img/word_document/636301739/original/216x287/f40ab5f3e7/1752077214?v=1',
    anio_edicion: '1997',
    copias_totales: 4,
    copias_disponibles: 1
  },
  {
    titulo: 'Papelucho detective',
    autor: 'Marcela Paz',
    genero: 'Ficción infantil',
    descripcion: 'Un niño ingenioso se convierte en detective amateur tras un viaje con su amigo.',
    imagen: 'https://dojiw2m9tvv09.cloudfront.net/82626/product/asdsdsfasdasd3465.png',
    anio_edicion: '1956',
    copias_totales: 2,
    copias_disponibles: 2
  },
  {
    titulo: 'Diario de Ana Frank',
    autor: 'Ana Frank',
    genero: 'Biografía, autobiografía',
    descripcion: 'Relato íntimo durante el escondite en el anexo secreto de Ámsterdam.',
    imagen: 'https://www.antartica.cl/media/catalog/product/9/7/9789878354194_1.png?quality=80&bg-color=255,255,255&fit=bounds&height=700&width=700&canvas=700:700&format=jpeg',
    anio_edicion: '1947',
    copias_totales: 3,
    copias_disponibles: 3
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/biblioteca_bec');
    console.log(' Conectado a MongoDB');

    await User.deleteMany({});
    await Libro.deleteMany({});
    console.log(' Colecciones limpiadas');

    const admin = new User({
      name: 'Administrador',
      email: 'admin@biblioteca.com',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();
    console.log(' Usuario administrador creado: admin@biblioteca.com / admin123');

    const user = new User({
      name: 'Usuario Prueba',
      email: 'usuario@test.com',
      password: 'usuario123',
      role: 'user'
    });
    await user.save();
    console.log(' Usuario de prueba creado: usuario@test.com / usuario123');

    await Libro.insertMany(librosIniciales);
    console.log(` ${librosIniciales.length} libros creados`);

    console.log(' Base de datos poblada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error(' Error poblando la base de datos:', error);
    process.exit(1);
  }
}

seedDatabase();
