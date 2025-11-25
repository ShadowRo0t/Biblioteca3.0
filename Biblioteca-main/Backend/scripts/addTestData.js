const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/biblioteca', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Reserva = require('../models/Reserva');
const Libro = require('../models/Libro');
const User = require('../models/User');

async function createTestData() {
    try {
        console.log(' Creando datos de prueba para préstamos vencidos...');

        // Buscar cualquier usuario
        const usuario = await User.findOne();
        if (!usuario) {
            console.error(' No se encontró ningún usuario en la base de datos');
            return;
        }

        const libros = await Libro.find({ copias_disponibles: { $gt: 0 } }).limit(3);
        if (libros.length < 2) {
            console.error(' No hay suficientes libros disponibles');
            return;
        }

        console.log(` Usuario encontrado: ${usuario.name} (${usuario.role})`);
        console.log(` Libros encontrados: ${libros.length}`);

        // Crear 2 préstamos vencidos con 2-4 días de retraso
        const ahora = new Date();

        // Préstamo 1: Vencido hace 2 días
        const desde1 = new Date(ahora);
        desde1.setDate(desde1.getDate() - 7); // Prestado hace 7 días
        const hasta1 = new Date(ahora);
        hasta1.setDate(hasta1.getDate() - 2); // Vencido hace 2 días

        const reserva1 = new Reserva({
            user_id: usuario._id,
            libro_id: libros[0]._id,
            tipo: 'domicilio',
            desde: desde1,
            hasta: hasta1,
            estado: 'activa',
            comprobante_id: 'TEST-' + Math.random().toString(36).substring(7).toUpperCase()
        });

        // Préstamo 2: Vencido hace 4 días
        const desde2 = new Date(ahora);
        desde2.setDate(desde2.getDate() - 9); // Prestado hace 9 días
        const hasta2 = new Date(ahora);
        hasta2.setDate(hasta2.getDate() - 4); // Vencido hace 4 días

        const reserva2 = new Reserva({
            user_id: usuario._id,
            libro_id: libros[1]._id,
            tipo: 'domicilio',
            desde: desde2,
            hasta: hasta2,
            estado: 'activa',
            comprobante_id: 'TEST-' + Math.random().toString(36).substring(7).toUpperCase()
        });

        // Préstamo 3: Activo (no vencido) para pruebas de devolución
        const desde3 = new Date(ahora);
        const hasta3 = new Date(ahora);
        hasta3.setDate(hasta3.getDate() + 2); // Vence en 2 días

        const reserva3 = new Reserva({
            user_id: usuario._id,
            libro_id: libros[2]._id,
            tipo: 'domicilio',
            desde: desde3,
            hasta: hasta3,
            estado: 'activa',
            comprobante_id: 'TEST-' + Math.random().toString(36).substring(7).toUpperCase()
        });

        await reserva1.save();
        await reserva2.save();
        await reserva3.save();

        console.log(' Préstamos de prueba creados:');
        console.log(`   1. ${libros[0].titulo} - Vencido hace 2 días`);
        console.log(`   2. ${libros[1].titulo} - Vencido hace 4 días`);
        console.log(`   3. ${libros[2].titulo} - Activo (vence en 2 días)`);
        console.log(`   Para usuario: ${usuario.name} (${usuario.email})`);
        console.log('\\n IDs de los libros para devoluciones:');
        console.log(`   Libro 1 ID: ${libros[0]._id}`);
        console.log(`   Libro 2 ID: ${libros[1]._id}`);
        console.log(`   Libro 3 ID: ${libros[2]._id}`);

    } catch (error) {
        console.error(' Error creando datos de prueba:', error);
    } finally {
        mongoose.connection.close();
    }
}

createTestData();
