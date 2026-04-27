const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const existeUsuario = await User.findOne({ where: { email } });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado' });
    }

    const usuario = await User.create({ nombre, email, password, rol: rol || 'empleado' });
    const token = generarToken(usuario);

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errores = error.errors.map(e => e.message);
      return res.status(400).json({ mensaje: 'Error de validación', errores });
    }
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
    }

    const usuario = await User.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(401).json({ mensaje: 'Usuario desactivado. Contacte al administrador.' });
    }

    const passwordValido = await usuario.validarPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

const obtenerPerfil = async (req, res) => {
  res.json({ usuario: req.usuario });
};

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ usuarios });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo } = req.body;

    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    await usuario.update({ nombre, email, rol, activo });
    res.json({ mensaje: 'Usuario actualizado', usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
};

module.exports = { registrar, login, obtenerPerfil, listarUsuarios, actualizarUsuario };
