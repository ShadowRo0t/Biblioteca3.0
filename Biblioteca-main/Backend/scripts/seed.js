const mongoose = require('mongoose');
const User = require('../models/User');
const Libro = require('../models/Libro');
require('dotenv').config();

const librosIniciales = [
  {
    id: 1,
    titulo: 'Cien años de soledad',
    disponibilidad: 'Disponible',
    autor: 'Gabriel García Márquez',
    genero: 'novela realista magico',
    descripcion: 'Una de las obras más importantes de la literatura hispanoamericana.',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT40DdhptlKmZrqWs42vaYh5q8dDTYqSjac2g&s',
    anio_edicion: '1967',
    copias_totales: 3,
    copias_disponibles: 3
  },
  {
    id: 2,
    titulo: 'Don Quijote de la Mancha',
    disponibilidad: 'Agotado',
    autor: 'Miguel de Cervantes',
    genero: 'narrativo',
    descripcion: 'La historia del caballero andante y su escudero Sancho Panza.',
    imagen: 'https://www.elejandria.com/covers/Don_Quijote_de_la_Mancha-Cervantes_Miguel-lg.png',
    anio_edicion: '1605',
    copias_totales: 2,
    copias_disponibles: 0
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/biblioteca_bec');
    console.log('✅ Conectado a MongoDB');

    await User.deleteMany({});
    await Libro.deleteMany({});
    console.log('🧹 Colecciones limpiadas');

    const admin = new User({
      name: 'Administrador',
      email: 'admin@biblioteca.com',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();
    console.log('👤 Usuario administrador creado: admin@biblioteca.com / admin123');

    const user = new User({
      name: 'Usuario Prueba',
      email: 'usuario@test.com',
      password: 'usuario123',
      role: 'user'
    });
    await user.save();
    console.log('👤 Usuario de prueba creado: usuario@test.com / usuario123');

    await Libro.insertMany(librosIniciales);
    console.log(`📚 ${librosIniciales.length} libros creados`);

    console.log('✅ Base de datos poblada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    process.exit(1);
  }
}

seedDatabase();
