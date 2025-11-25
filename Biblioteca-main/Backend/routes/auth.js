const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const crypto = require('crypto');
const { sendActivationEmail } = require('../services/emailService');

router.post('/register', [
  body('name').trim().isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rut').optional().trim(),
  body('address').optional().trim(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, rut, address, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const user = new User({
      name,
      email,
      password,
      rut,
      address,
      phone,
      isActive: true // Auto-activate
    });

    await user.save();

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
});

router.get('/activate/:token', async (req, res) => {
  try {
    const user = await User.findOne({ activationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ message: 'Token de activación inválido' });
    }

    user.isActive = true;
    user.activationToken = undefined;
    await user.save();

    res.send('<h1>Cuenta activada exitosamente! Ya puedes iniciar sesión en la app.</h1>');
  } catch (error) {
    console.error('Error en activación:', error);
    res.status(500).json({ message: 'Error al activar cuenta' });
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

    // if (!user.isActive) {
    //   return res.status(401).json({ message: 'Tu cuenta no ha sido activada. Revisa tu correo.' });
    // }

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
