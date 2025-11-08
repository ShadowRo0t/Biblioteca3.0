const express = require('express');
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
