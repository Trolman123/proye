const express = require('express');
const router = express.Router();
const { registrar, login, obtenerPerfil, listarUsuarios, actualizarUsuario } = require('../controllers/authController');
const { verificarToken, autorizarRoles } = require('../middleware/auth');

router.post('/registrar', registrar);
router.post('/login', login);
router.get('/perfil', verificarToken, obtenerPerfil);
router.get('/usuarios', verificarToken, autorizarRoles('admin'), listarUsuarios);
router.put('/usuarios/:id', verificarToken, autorizarRoles('admin'), actualizarUsuario);

module.exports = router;
