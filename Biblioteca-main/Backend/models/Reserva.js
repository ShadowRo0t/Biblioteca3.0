const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  libro_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Libro',
    required: [true, 'El ID del libro es obligatorio']
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
