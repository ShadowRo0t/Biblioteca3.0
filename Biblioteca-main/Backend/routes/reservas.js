const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Reserva = require('../models/Reserva');
const Libro = require('../models/Libro');
const authMiddleware = require('../middleware/auth');

router.get('/reservas', authMiddleware, async (req, res) => {
  try {
    // ✅ Log para depuración: ver qué usuario está solicitando sus reservas
    console.log('📋 Obteniendo reservas para usuario:', req.user.userId, 'Email:', req.user.email, 'Rol:', req.user.role);
    
    const reservas = await Reserva.find({ 
      user_id: req.user.userId, // ✅ Solo reservas del usuario autenticado
      estado: 'activa'
    })
    .sort({ createdAt: -1 })
    .populate('libro_id');

    console.log(`✅ Encontradas ${reservas.length} reservas para el usuario ${req.user.userId}`);

    const reservasConLibros = reservas.map(reserva => {
      const reservaObj = reserva.toObject();
      const libro = reservaObj.libro_id;

      return {
        ...reservaObj,
        libro_id: libro?._id || reservaObj.libro_id,
        libro: libro
          ? {
              _id: libro._id,
              titulo: libro.titulo,
              autor: libro.autor,
              genero: libro.genero,
              descripcion: libro.descripcion,
              imagen: libro.imagen,
              anio_edicion: libro.anio_edicion,
              disponibilidad: libro.disponibilidad,
              copias_totales: libro.copias_totales,
              copias_disponibles: libro.copias_disponibles,
            }
          : null
      };
    });

    res.json(reservasConLibros);
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
  }
});

router.post('/reservas', authMiddleware, async (req, res) => {
  try {
    const { libro_id, tipo, desde, hasta } = req.body;

    // ✅ Log para depuración: ver qué usuario está creando la reserva
    console.log('📝 Creando reserva para usuario:', req.user.userId, 'Email:', req.user.email, 'Rol:', req.user.role);

    if (!libro_id || !desde || !hasta) {
      return res.status(400).json({ 
        message: 'Faltan datos obligatorios: libro_id, desde, hasta' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(libro_id)) {
      return res.status(400).json({ message: 'ID de libro inválido' });
    }

    const libro = await Libro.findById(libro_id);

    if (!libro) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    if (libro.copias_disponibles <= 0) {
      return res.status(400).json({ message: 'Este libro no tiene copias disponibles en este momento' });
    }

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);
    
    if (fechaHasta <= fechaDesde) {
      return res.status(400).json({ 
        message: 'La fecha "hasta" debe ser posterior a la fecha "desde"' 
      });
    }

    // ✅ Asegurar que user_id viene del token (no del body, por seguridad)
    const nuevaReserva = new Reserva({
      user_id: req.user.userId, // ✅ Siempre del token autenticado
      libro_id,
      tipo: tipo || 'prestamo',
      desde: fechaDesde,
      hasta: fechaHasta,
      estado: 'activa'
    });

    try {
      libro.copias_disponibles = Math.max(libro.copias_disponibles - 1, 0);
      libro.actualizarDisponibilidad();
      await libro.save();

      await nuevaReserva.save();
      console.log('✅ Reserva guardada con user_id:', nuevaReserva.user_id);

      res.status(201).json({
        message: 'Reserva creada exitosamente',
        reserva: {
          ...nuevaReserva.toObject(),
          libro: {
            _id: libro._id,
            titulo: libro.titulo,
            autor: libro.autor,
            genero: libro.genero,
            descripcion: libro.descripcion,
            imagen: libro.imagen,
            anio_edicion: libro.anio_edicion,
            disponibilidad: libro.disponibilidad,
            copias_totales: libro.copias_totales,
            copias_disponibles: libro.copias_disponibles,
          }
        }
      });
    } catch (error) {
      libro.copias_disponibles += 1;
      libro.actualizarDisponibilidad();
      await libro.save();
      throw error;
    }
  } catch (error) {
    console.error('Error creando reserva:', error);
    res.status(500).json({ message: 'Error al crear reserva', error: error.message });
  }
});

router.delete('/reservas/:id', authMiddleware, async (req, res) => {
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

    if (mongoose.Types.ObjectId.isValid(reserva.libro_id)) {
      const libro = await Libro.findById(reserva.libro_id);
      if (libro) {
        libro.copias_disponibles += 1;
        if (libro.copias_disponibles > libro.copias_totales) {
          libro.copias_disponibles = libro.copias_totales;
        }
        libro.actualizarDisponibilidad();
        await libro.save();
      }
    }

    res.json({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error('Error eliminando reserva:', error);
    res.status(500).json({ message: 'Error al eliminar reserva', error: error.message });
  }
});

module.exports = router;
