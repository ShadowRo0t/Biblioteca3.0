const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Reserva = require('../models/Reserva');
const Libro = require('../models/Libro');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { sendLoanReminder } = require('../services/emailService');

// Helper to calculate penalty
const calculatePenalty = (fechaDevolucionReal, fechaHasta) => {
  const diffTime = Math.abs(fechaDevolucionReal - fechaHasta);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return fechaDevolucionReal > fechaHasta ? diffDays : 0;
};

// GET /reservas - Listar reservas del usuario autenticado
router.get('/reservas', authMiddleware, async (req, res) => {
  try {
    // Todos los usuarios (incluyendo admin) solo ven sus propias reservas
    const query = {
      user_id: req.user.userId,
      estado: { $in: ['activa', 'vencida'] }
    };

    const reservas = await Reserva.find(query)
      .sort({ createdAt: -1 })
      .populate('libro_id')
      .populate('user_id', 'name email');

    res.json(reservas);
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
});

// GET /reservas/admin/todas - Admin: Listar todas las reservas activas
router.get('/reservas/admin/todas', authMiddleware, async (req, res) => {
  try {
    // Solo admin y bibliotecario pueden acceder a este endpoint
    if (req.user.role !== 'admin' && req.user.role !== 'bibliotecario') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const query = { estado: { $in: ['activa', 'vencida'] } };

    const reservas = await Reserva.find(query)
      .sort({ createdAt: -1 })
      .populate('libro_id')
      .populate('user_id', 'name email');

    res.json(reservas);
  } catch (error) {
    console.error('Error obteniendo todas las reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
});

// GET /reservas/vencidas - Usuario: sus vencidas | Admin: todas las vencidas
router.get('/reservas/vencidas', authMiddleware, async (req, res) => {
  try {
    const now = new Date();

    // Construir query base
    const query = {
      estado: 'activa',
      hasta: { $lt: now }
    };

    // Si NO es admin/bibliotecario, filtrar por el usuario autenticado
    if (req.user.role !== 'admin' && req.user.role !== 'bibliotecario') {
      query.user_id = req.user.userId;
      console.log(' Usuario normal consultando sus reservas vencidas:', req.user.userId);
    } else {
      console.log(' Admin consultando todas las reservas vencidas');
    }

    const vencidas = await Reserva.find(query)
      .populate('libro_id')
      .populate('user_id', 'name email');

    console.log(` Encontradas ${vencidas.length} reservas vencidas`);

    // Solo enviar recordatorios si es admin
    if (req.user.role === 'admin' || req.user.role === 'bibliotecario') {
      for (const reserva of vencidas) {
        if (reserva.tipo === 'domicilio') {
          await sendLoanReminder(reserva.user_id.email, reserva.libro_id.titulo, reserva.hasta);
        }
      }
    }

    res.json(vencidas);
  } catch (error) {
    console.error('Error obteniendo reservas vencidas:', error);
    res.status(500).json({ message: 'Error al obtener reservas vencidas' });
  }
});

// POST /reservas - Crear reserva (Préstamo)
router.post('/reservas', authMiddleware, async (req, res) => {
  try {
    const { libro_id, tipo } = req.body; // tipo: 'sala' or 'domicilio'

    // Validate user eligibility (check for penalties)
    // For simplicity, we assume penalties are cleared manually or by time. 
    // Real implementation would check User model for active penalties.

    if (!libro_id || !tipo) {
      return res.status(400).json({ message: 'Faltan datos: libro_id, tipo' });
    }

    const libro = await Libro.findById(libro_id);
    if (!libro || libro.copias_disponibles <= 0) {
      return res.status(400).json({ message: 'Libro no disponible' });
    }

    const desde = new Date();
    let hasta = new Date();

    if (tipo === 'sala') {
      // Sala loan: return same day, e.g., in 2 hours or end of day
      hasta.setHours(hasta.getHours() + 2);
    } else {
      // Domicilio loan: return in 3 days (example)
      hasta.setDate(hasta.getDate() + 3);
    }

    const nuevaReserva = new Reserva({
      user_id: req.user.userId,
      libro_id,
      tipo,
      desde,
      hasta,
      estado: 'activa',
      comprobante_id: Math.random().toString(36).substring(7).toUpperCase()
    });

    libro.copias_disponibles = Math.max(libro.copias_disponibles - 1, 0);
    libro.actualizarDisponibilidad();

    await libro.save();
    await nuevaReserva.save();

    res.status(201).json({
      message: 'Préstamo registrado exitosamente',
      reserva: nuevaReserva,
      receipt: {
        documentos: [libro.titulo],
        fecha_devolucion: hasta,
        tipo_prestamo: tipo
      }
    });

  } catch (error) {
    console.error('Error creando reserva:', error);
    res.status(500).json({ message: 'Error al crear reserva' });
  }
});

// POST /reservas/devolver - Devolver libro
router.post('/reservas/devolver', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'bibliotecario') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { libro_id } = req.body;

    if (!libro_id) {
      return res.status(400).json({ message: 'El libro_id es requerido' });
    }

    console.log(' Buscando reserva para libro_id:', libro_id);

    // Buscar una reserva activa o vencida con este libro_id
    const reserva = await Reserva.findOne({
      libro_id: libro_id,
      estado: { $in: ['activa', 'vencida'] }
    }).populate('libro_id').populate('user_id', 'name email');

    if (!reserva) {
      console.log(' No se encontró reserva activa para libro_id:', libro_id);
      return res.status(404).json({
        message: 'No se encontró una reserva activa para este libro. Verifique el ID del libro.'
      });
    }

    console.log(' Reserva encontrada:', reserva._id, 'Usuario:', reserva.user_id?.name);

    const now = new Date();
    const penaltyDays = calculatePenalty(now, reserva.hasta);
    const MULTA_POR_DIA = 1000; // $1000 por día
    const multaEconomica = penaltyDays * MULTA_POR_DIA;

    reserva.estado = 'finalizada';
    reserva.fecha_devolucion_real = now;
    reserva.multa = penaltyDays;
    await reserva.save();

    console.log(' Reserva marcada como finalizada');

    // Restaurar disponibilidad del libro INMEDIATAMENTE
    const libro = await Libro.findById(reserva.libro_id);
    if (libro) {
      libro.copias_disponibles += 1;
      if (libro.copias_disponibles > libro.copias_totales) {
        libro.copias_disponibles = libro.copias_totales;
      }
      libro.actualizarDisponibilidad();
      await libro.save();
      console.log(` Libro ${libro.titulo} disponible nuevamente`);
    }

    res.json({
      message: 'Libro devuelto exitosamente',
      multa_dias: penaltyDays,
      multa_economica: multaEconomica,
      usuario: reserva.user_id?.name,
      libro: reserva.libro_id?.titulo,
      nota: 'El libro está disponible inmediatamente.'
    });

  } catch (error) {
    console.error('Error en devolución:', error);
    res.status(500).json({
      message: 'Error al procesar devolución',
      error: error.message
    });
  }
});


// DELETE /reservas/:id - Cancelar reserva
router.delete('/reservas/:id', authMiddleware, async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Check ownership or admin role
    if (reserva.user_id.toString() !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'bibliotecario') {
      return res.status(403).json({ message: 'No tienes permiso para cancelar esta reserva' });
    }

    if (reserva.estado !== 'activa') {
      return res.status(400).json({ message: 'Solo se pueden cancelar reservas activas' });
    }

    // Restore book availability
    const libro = await Libro.findById(reserva.libro_id);
    if (libro) {
      libro.copias_disponibles += 1;
      if (libro.copias_disponibles > libro.copias_totales) {
        libro.copias_disponibles = libro.copias_totales;
      }
      libro.actualizarDisponibilidad();
      await libro.save();
    }

    await Reserva.findByIdAndDelete(req.params.id);

    res.json({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error('Error cancelando reserva:', error);
    res.status(500).json({ message: 'Error al cancelar reserva' });
  }
});

module.exports = router;
