const mongoose = require('mongoose');

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
