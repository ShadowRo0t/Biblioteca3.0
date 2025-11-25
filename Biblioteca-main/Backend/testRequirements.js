const mongoose = require('mongoose');
const User = require('./models/User');
const Libro = require('./models/Libro');
const Reserva = require('./models/Reserva');
require('dotenv').config();

async function testRequirements() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/biblioteca_bec');
        console.log(' Conectado a MongoDB');

        // 1. Crear Usuario con nuevos campos
        const email = `test_${Date.now()}@example.com`;
        const user = new User({
            name: 'Test User',
            email,
            password: 'password123',
            rut: '12.345.678-9',
            address: 'Calle Falsa 123',
            phone: '+56912345678',
            isActive: true // Manually active for test
        });
        await user.save();
        console.log(' Usuario creado:', user.email);

        // 2. Crear Libro con nuevos campos
        const libro = new Libro({
            titulo: 'Libro Test',
            autor: 'Autor Test',
            genero: 'Test',
            descripcion: 'Desc',
            anio_edicion: '2023',
            tipo: 'libro',
            editorial: 'Editorial Test',
            ubicacion: 'Estante A1',
            copias_totales: 5,
            copias_disponibles: 5
        });
        await libro.save();
        console.log(' Libro creado:', libro.titulo);

        // 3. Crear Préstamo Sala
        const reservaSala = new Reserva({
            user_id: user._id,
            libro_id: libro._id,
            tipo: 'sala',
            desde: new Date(),
            hasta: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 hours
            estado: 'activa',
            comprobante_id: 'SALA123'
        });
        await reservaSala.save();
        console.log(' Préstamo Sala creado');

        // 4. Crear Préstamo Domicilio (Vencido para probar multa)
        const reservaVencida = new Reserva({
            user_id: user._id,
            libro_id: libro._id,
            tipo: 'domicilio',
            desde: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // -5 days
            hasta: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // -2 days (Vencida por 2 días)
            estado: 'activa',
            comprobante_id: 'DOM123'
        });
        await reservaVencida.save();
        console.log(' Préstamo Vencido creado (hace 2 días)');

        // 5. Probar Devolución y Multa
        const now = new Date();
        const diffTime = Math.abs(now - reservaVencida.hasta);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        reservaVencida.estado = 'finalizada';
        reservaVencida.fecha_devolucion_real = now;
        reservaVencida.multa = diffDays;
        await reservaVencida.save();

        console.log(` Devolución procesada. Multa calculada: ${reservaVencida.multa} días (Esperado: ~2)`);

        // Limpieza
        await User.deleteOne({ _id: user._id });
        await Libro.deleteOne({ _id: libro._id });
        await Reserva.deleteOne({ _id: reservaSala._id });
        await Reserva.deleteOne({ _id: reservaVencida._id });
        console.log(' Limpieza completada');

        mongoose.disconnect();
    } catch (error) {
        console.error(' Error:', error);
    }
}

testRequirements();
