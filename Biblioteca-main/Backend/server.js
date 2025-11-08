const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno PRIMERO
dotenv.config({ path: path.join(__dirname, '.env') });

// Verificar que las variables se cargaron
console.log('🔍 Verificando variables de entorno...');
console.log('PORT:', process.env.PORT || '8000 (por defecto)');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? ' Configurado' : ' NO configurado');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? ' Configurado' : ' NO configurado');

const app = express();
const PORT = process.env.PORT || 8000;

// URL de MongoDB con fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/biblioteca_bec';

// Middlewares
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static('uploads'));

// Conexión a MongoDB
console.log('\n🔌 Intentando conectar a MongoDB...');
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log(' Conectado a MongoDB exitosamente');
  console.log(' Base de datos:', MONGODB_URI.split('/').pop().split('?')[0]);
})
.catch(err => {
  console.error(' Error conectando a MongoDB:', err.message);
  console.error('\n💡 Soluciones posibles:');
  console.error('   1. Verifica que MongoDB esté corriendo: net start MongoDB');
  console.error('   2. Verifica tu archivo .env');
  console.error('   3. Verifica la URL de MongoDB');
  process.exit(1);
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: '¡Bienvenido a la API de Biblioteca BEC!',
    status: 'online',
    mongodb: mongoose.connection.readyState === 1 ? 'Conectado ' : 'Desconectado ',
    version: '1.0.0',
    endpoints: {
      test: 'GET /api/test',
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register',
      reservas: 'GET /api/reservas (requiere auth)',
      crearReserva: 'POST /api/reservas (requiere auth)',
      imagenes: 'GET /api/v1/imagenes'
    }
  });
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '¡API funcionando correctamente!',
    mongodb: mongoose.connection.readyState === 1 ? 'Conectado ' : 'Desconectado ',
    timestamp: new Date().toISOString()
  });
});

// Importar y usar rutas (con manejo de errores)
try {
  const authRoutes = require('./routes/auth');
  const reservasRoutes = require('./routes/reservas');
  const imagenesRoutes = require('./routes/imagenes');

  app.use('/api/auth', authRoutes);
  app.use('/api', reservasRoutes);
  app.use('/api/v1', imagenesRoutes);
  
  console.log(' Rutas cargadas correctamente');
} catch (error) {
  console.error(' Error cargando rutas:', error.message);
  console.error(' Asegúrate de que existen los archivos:');
  console.error('   - routes/auth.js');
  console.error('   - routes/reservas.js');
  console.error('   - routes/imagenes.js');
  process.exit(1);
}

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(' Error:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(' SERVIDOR EXPRESS INICIADO EXITOSAMENTE');
  console.log('='.repeat(60));
  console.log(` URL del servidor:     http://localhost:${PORT}`);
  console.log(` Frontend Angular:     http://localhost:4200`);
  console.log(`  MongoDB:              ${MONGODB_URI}`);
  console.log(` JWT Secret:           ${process.env.JWT_SECRET ? 'Configurado ✅' : 'NO configurado ❌'}`);
  console.log(` Entorno:              ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('\n Endpoints disponibles:');
  console.log('   GET  /                  - Información de la API');
  console.log('   GET  /api/test          - Test de conexión');
  console.log('   POST /api/auth/register - Registro de usuario');
  console.log('   POST /api/auth/login    - Login de usuario');
  console.log('   GET  /api/reservas      - Listar reservas (auth)');
  console.log('   POST /api/reservas      - Crear reserva (auth)');
  console.log('   GET  /api/v1/imagenes   - Listar imágenes');
  console.log('\n Presiona Ctrl+C para detener el servidor\n');
});