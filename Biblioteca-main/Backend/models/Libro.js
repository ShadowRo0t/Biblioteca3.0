const mongoose = require('mongoose');

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

function syncDisponibilidad(libro) {
  if (typeof libro.copias_totales === 'number' && typeof libro.copias_disponibles === 'number') {
    if (libro.copias_disponibles > libro.copias_totales) {
      libro.copias_disponibles = libro.copias_totales;
    }
  }

  libro.disponibilidad = (libro.copias_disponibles ?? 0) > 0 ? 'Disponible' : 'Agotado';
}

libroSchema.pre('save', function(next) {
  syncDisponibilidad(this);
  next();
});

libroSchema.methods.actualizarDisponibilidad = function() {
  syncDisponibilidad(this);
};

module.exports = mongoose.model('Libro', libroSchema);
