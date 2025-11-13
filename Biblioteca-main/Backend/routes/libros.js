const express = require('express');
const { body, param, validationResult } = require('express-validator');

const Libro = require('../models/Libro');
const Reserva = require('../models/Reserva');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol administrador' });
  }
  next();
};

const validarLibroBase = [
  body('titulo').trim().notEmpty().withMessage('El título es obligatorio'),
  body('autor').trim().notEmpty().withMessage('El autor es obligatorio'),
  body('genero').trim().notEmpty().withMessage('El género es obligatorio'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria'),
  body('anio_edicion').trim().notEmpty().withMessage('El año de edición es obligatorio'),
  body('imagen').optional().isString().withMessage('La imagen debe ser una URL válida'),
  body('copias_totales')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Las copias totales deben ser un número entero positivo'),
  body('copias_disponibles')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Las copias disponibles deben ser un número entero positivo'),
  body('disponibilidad')
    .optional()
    .isIn(['Disponible', 'Agotado', 'Prestado'])
    .withMessage('Disponibilidad inválida'),
];

router.get('/libros', async (_req, res) => {
  try {
    const libros = await Libro.find().sort({ createdAt: -1 });
    res.json(libros);
  } catch (error) {
    console.error('Error obteniendo libros:', error);
    res.status(500).json({ message: 'Error al obtener libros', error: error.message });
  }
});

router.post(
  '/libros',
  authMiddleware,
  requireAdmin,
  validarLibroBase,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        titulo,
        autor,
        genero,
        descripcion,
        anio_edicion,
        imagen,
        disponibilidad,
        copias_totales = 1,
        copias_disponibles,
      } = req.body;

      const libro = new Libro({
        titulo,
        autor,
        genero,
        descripcion,
        anio_edicion,
        imagen,
        disponibilidad: disponibilidad || 'Disponible',
        copias_totales,
        copias_disponibles: typeof copias_disponibles === 'number' ? copias_disponibles : copias_totales,
      });

      libro.actualizarDisponibilidad();

      const nuevoLibro = await libro.save();

      res.status(201).json({
        message: 'Libro creado exitosamente',
        libro: nuevoLibro,
      });
    } catch (error) {
      console.error('Error creando libro:', error);
      res.status(500).json({ message: 'Error al crear libro', error: error.message });
    }
  }
);

router.patch(
  '/libros/:id',
  authMiddleware,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('ID de libro inválido'),
    ...validarLibroBase.map((validator) => validator.optional({ checkFalsy: true })),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updateData = { ...req.body };

      if (
        typeof updateData.copias_totales === 'number' &&
        typeof updateData.copias_disponibles === 'number' &&
        updateData.copias_disponibles > updateData.copias_totales
      ) {
        updateData.copias_disponibles = updateData.copias_totales;
      }

      const libro = await Libro.findById(req.params.id);
      if (!libro) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }

      Object.assign(libro, updateData);
      libro.actualizarDisponibilidad();

      const libroActualizado = await libro.save();

      res.json({
        message: 'Libro actualizado exitosamente',
        libro: libroActualizado,
      });
    } catch (error) {
      console.error('Error actualizando libro:', error);
      res.status(500).json({ message: 'Error al actualizar libro', error: error.message });
    }
  }
);

router.delete(
  '/libros/:id',
  authMiddleware,
  requireAdmin,
  [param('id').isMongoId().withMessage('ID de libro inválido')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const libro = await Libro.findById(req.params.id);
      if (!libro) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }

      const reservasActivas = await Reserva.exists({
        libro_id: libro._id,
        estado: 'activa',
      });

      if (reservasActivas) {
        return res.status(409).json({
          message: 'No se puede eliminar el libro porque tiene reservas activas',
        });
      }

      await libro.deleteOne();

      res.json({
        message: `Libro "${libro.titulo}" eliminado correctamente`,
        libro,
      });
    } catch (error) {
      console.error('Error eliminando libro:', error);
      res.status(500).json({ message: 'Error al eliminar libro', error: error.message });
    }
  }
);

router.patch(
  '/libros/:id/stock',
  authMiddleware,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('ID de libro inválido'),
    body('cantidad')
      .isInt({ min: 1 })
      .withMessage('La cantidad a agregar debe ser un número entero positivo'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { cantidad } = req.body;
      const libro = await Libro.findById(req.params.id);

      if (!libro) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }

      libro.copias_totales += cantidad;
      libro.copias_disponibles += cantidad;
      libro.actualizarDisponibilidad();

      await libro.save();

      res.json({
        message: `Se añadieron ${cantidad} copias a "${libro.titulo}"`,
        libro,
      });
    } catch (error) {
      console.error('Error actualizando stock del libro:', error);
      res.status(500).json({ message: 'Error al actualizar stock del libro', error: error.message });
    }
  }
);

module.exports = router;

