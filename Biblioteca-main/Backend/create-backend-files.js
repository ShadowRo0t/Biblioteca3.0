const fs = require('fs');
const path = require('path');

console.log(' Creando archivos del backend...\n');

// Crear carpetas si no existen
const carpetas = ['models', 'routes', 'middleware', 'scripts', 'uploads'];
carpetas.forEach(carpeta => {
  if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true });
    console.log(` Carpeta creada: ${carpeta}/`);
  }
});

// ====================
// MODELOS
// ====================

// models/User.js
const userModel = `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
`;

// models/Libro.js
const libroModel = `const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true
  },
  autor: {
    type: String,
    required: [true, 'El autor es obligatorio'],
    trim: true
  },
  genero: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true
  },
  anio_edicion: {
    type: String,
    required: true
  },
  imagen: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  disponibilidad: {
    type: String,
    enum: ['Disponible', 'Agotado', 'Prestado'],
    default: 'Disponible'
  },
  copias_totales: {
    type: Number,
    default: 1,
    min: 0
  },
  copias_disponibles: {
    type: Number,
    default: 1,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Libro', libroSchema);
`;

// models/Reserva.js
const reservaModel = `const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  libro_id: {
    type: Number,
    required: [true, 'El ID del libro es obligatorio']
  },
  libro: {
    type: Object,
    required: false
  },
  tipo: {
    type: String,
    enum: ['prestamo', 'sala', 'domicilio'],
    default: 'prestamo'
  },
  desde: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria']
  },
  hasta: {
    type: Date,
    required: [true, 'La fecha de fin es obligatoria']
  },
  estado: {
    type: String,
    enum: ['activa', 'finalizada', 'cancelada'],
    default: 'activa'
  }
}, {
  timestamps: true
});

reservaSchema.pre('save', function(next) {
  if (this.hasta <= this.desde) {
    next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
  }
  next();
});

module.exports = mongoose.model('Reserva', reservaSchema);
`;

// models/Imagen.js
const imagenModel = `const mongoose = require('mongoose');

const imagenSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: 100
  },
  ruta: {
    type: String,
    required: true
  },
  miniatura: {
    type: String,
    default: null
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Imagen', imagenSchema);
`;

// ====================
// MIDDLEWARE
// ====================

const authMiddleware = `const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
};
`;

// ====================
// RUTAS
// ====================

const authRoutes = `const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

router.post('/register', [
  body('name').trim().isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'tu_clave_secreta',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});

module.exports = router;
`;

const reservasRoutes = `const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

const librosData = {
  1: { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez' },
  2: { id: 2, titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes' },
  3: { id: 3, titulo: 'El Principito', autor: 'Antoine de Saint-Exupéry' },
  4: { id: 4, titulo: 'Crepúsculo', autor: 'Stephenie Meyer' },
  5: { id: 5, titulo: 'La Odisea', autor: 'Homero' },
  6: { id: 6, titulo: 'Harry Potter y la piedra filosofal', autor: 'J. K. Rowling' },
  7: { id: 7, titulo: 'Papelucho detective', autor: 'Marcela Paz' },
  8: { id: 8, titulo: 'Diario de Ana Frank', autor: 'Ana Frank' }
};

router.get('/reservas', async (req, res) => {
  try {
    const reservas = await Reserva.find({ 
      user_id: req.user.userId,
      estado: 'activa'
    }).sort({ createdAt: -1 });

    const reservasConLibros = reservas.map(reserva => {
      const libro = librosData[reserva.libro_id];
      return {
        ...reserva.toObject(),
        libro: libro || { titulo: 'Libro no encontrado' }
      };
    });

    res.json(reservasConLibros);
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
  }
});

router.post('/reservas', async (req, res) => {
  try {
    const { libro_id, tipo, desde, hasta } = req.body;

    if (!libro_id || !desde || !hasta) {
      return res.status(400).json({ 
        message: 'Faltan datos obligatorios: libro_id, desde, hasta' 
      });
    }

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);
    
    if (fechaHasta <= fechaDesde) {
      return res.status(400).json({ 
        message: 'La fecha "hasta" debe ser posterior a la fecha "desde"' 
      });
    }

    const nuevaReserva = new Reserva({
      user_id: req.user.userId,
      libro_id,
      tipo: tipo || 'prestamo',
      desde: fechaDesde,
      hasta: fechaHasta,
      estado: 'activa'
    });

    await nuevaReserva.save();

    const libro = librosData[libro_id];
    const reservaConLibro = {
      ...nuevaReserva.toObject(),
      libro: libro || { titulo: 'Libro no encontrado' }
    };

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reserva: reservaConLibro
    });
  } catch (error) {
    console.error('Error creando reserva:', error);
    res.status(500).json({ message: 'Error al crear reserva', error: error.message });
  }
});

router.delete('/reservas/:id', async (req, res) => {
  try {
    const reserva = await Reserva.findOne({
      _id: req.params.id,
      user_id: req.user.userId
    });

    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    reserva.estado = 'cancelada';
    await reserva.save();

    res.json({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error('Error eliminando reserva:', error);
    res.status(500).json({ message: 'Error al eliminar reserva', error: error.message });
  }
});

module.exports = router;
`;

const imagenesRoutes = `const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Imagen = require('../models/Imagen');
const authMiddleware = require('../middleware/auth');

const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter
});

router.get('/imagenes', async (req, res) => {
  try {
    const imagenes = await Imagen.find().sort({ createdAt: -1 });
    const imagenesConURL = imagenes.map(img => ({
      ...img.toObject(),
      ruta: \`http://localhost:8000/uploads/\${path.basename(img.ruta)}\`,
      miniatura: img.miniatura ? \`http://localhost:8000/uploads/\${path.basename(img.miniatura)}\` : null
    }));
    res.json(imagenesConURL);
  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    res.status(500).json({ message: 'Error al obtener imágenes', error: error.message });
  }
});

router.post('/imagenes', authMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
    }

    const { titulo } = req.body;
    if (!titulo) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    const nuevaImagen = new Imagen({
      titulo,
      ruta: req.file.filename,
      user_id: req.user.userId,
      miniatura: null
    });

    await nuevaImagen.save();

    res.status(201).json({
      message: 'Imagen subida exitosamente',
      imagen: {
        ...nuevaImagen.toObject(),
        ruta: \`http://localhost:8000/uploads/\${req.file.filename}\`
      }
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error al subir imagen', error: error.message });
  }
});

module.exports = router;
`;

// ====================
// SCRIPTS
// ====================

const seedScript = `const mongoose = require('mongoose');
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
    console.log(\` \${librosIniciales.length} libros creados\`);

    console.log(' Base de datos poblada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error(' Error poblando la base de datos:', error);
    process.exit(1);
  }
}

seedDatabase();
`;

// ====================
// ESCRIBIR ARCHIVOS
// ====================

const archivos = [
  { ruta: 'models/User.js', contenido: userModel },
  { ruta: 'models/Libro.js', contenido: libroModel },
  { ruta: 'models/Reserva.js', contenido: reservaModel },
  { ruta: 'models/Imagen.js', contenido: imagenModel },
  { ruta: 'middleware/auth.js', contenido: authMiddleware },
  { ruta: 'routes/auth.js', contenido: authRoutes },
  { ruta: 'routes/reservas.js', contenido: reservasRoutes },
  { ruta: 'routes/imagenes.js', contenido: imagenesRoutes },
  { ruta: 'scripts/seed.js', contenido: seedScript }
];

console.log('\\n Creando archivos...\\n');

archivos.forEach(({ ruta, contenido }) => {
  fs.writeFileSync(ruta, contenido);
  console.log(` ${ruta}`);
});

console.log('\\n ¡Todos los archivos creados exitosamente!\\n');
console.log(' Próximos pasos:');
console.log('   1. Verifica que MongoDB esté corriendo');
console.log('   2. Ejecuta: npm run seed');
console.log('   3. Ejecuta: npm run dev');
console.log('   4. Abre: http://localhost:8000\\n')