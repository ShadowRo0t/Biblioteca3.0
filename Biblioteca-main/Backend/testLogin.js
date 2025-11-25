const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/biblioteca_bec');
    console.log(' Conectado a MongoDB\n');

    // Ver todos los usuarios
    const users = await User.find({});
    console.log(' Usuarios en la BD:', users.length);
    users.forEach(user => {
      console.log(`  - Email: ${user.email}, Role: ${user.role}`);
    });

    // Intentar login manual
    console.log('\n Probando login con admin@biblioteca.com / admin123:');
    const user = await User.findOne({ email: 'admin@biblioteca.com' });
    
    if (!user) {
      console.log(' Usuario NO encontrado en la BD');
    } else {
      console.log(' Usuario encontrado');
      const isMatch = await user.comparePassword('admin123');
      console.log(` Contraseña correcta: ${isMatch}`);
      
      if (!isMatch) {
        console.log(' Contraseña INCORRECTA');
        console.log('   Probando con otras contraseñas comunes...');
        
        const passwords = ['admin', 'admin123', 'test123', 'password123'];
        for (const pwd of passwords) {
          const result = await user.comparePassword(pwd);
          if (result) {
            console.log(` ¡ENCONTRADA! La contraseña correcta es: ${pwd}`);
            break;
          }
        }
      }
    }

    mongoose.disconnect();
  } catch (error) {
    console.error(' Error:', error.message);
  }
}

testLogin();