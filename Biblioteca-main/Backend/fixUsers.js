const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/biblioteca_bec');
        console.log(' Conectado a MongoDB');

        // 1. Activar todos los usuarios existentes
        const result = await User.updateMany(
            { isActive: { $ne: true } },
            { $set: { isActive: true } }
        );
        console.log(` Usuarios activados: ${result.modifiedCount}`);

        // 2. Verificar usuario admin
        const admin = await User.findOne({ email: 'admin@biblioteca.com' });
        if (admin) {
            console.log(' Admin encontrado:', admin.email);
            console.log('   Rol:', admin.role);
            console.log('   Activo:', admin.isActive);

            // Verificar password si es necesario (opcional, solo para debug)
            // const isMatch = await admin.comparePassword('admin123');
            // console.log('   Password admin123 correcto:', isMatch);
        } else {
            console.log(' Usuario admin@biblioteca.com NO encontrado');

            // Crear admin si no existe
            const newAdmin = new User({
                name: 'Administrador',
                email: 'admin@biblioteca.com',
                password: 'admin123',
                role: 'admin',
                isActive: true,
                rut: '11.111.111-1'
            });
            await newAdmin.save();
            console.log(' Usuario admin creado por defecto (pass: admin123)');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error(' Error:', error);
    }
}

fixUsers();
