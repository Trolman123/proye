const jwt = require('jsonwebtoken');
const { User } = require('../models');

const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ mensaje: 'Token de autenticación no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await User.findByPk(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ mensaje: 'Usuario no válido o inactivo' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: 'Token expirado, inicie sesión nuevamente' });
    }
    return res.status(401).json({ mensaje: 'Token no válido' });
  }
};

const autorizarRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = { verificarToken, autorizarRoles };
