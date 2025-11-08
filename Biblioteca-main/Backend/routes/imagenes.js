const express = require('express');
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
      ruta: `http://localhost:8000/uploads/${path.basename(img.ruta)}`,
      miniatura: img.miniatura ? `http://localhost:8000/uploads/${path.basename(img.miniatura)}` : null
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
        ruta: `http://localhost:8000/uploads/${req.file.filename}`
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
