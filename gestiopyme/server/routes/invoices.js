const express = require('express');
const router = express.Router();
const { listar, obtener, crear, cambiarEstado } = require('../controllers/invoiceController');
const { verificarToken, autorizarRoles } = require('../middleware/auth');

router.use(verificarToken);
router.get('/', listar);
router.get('/:id', obtener);
router.post('/', crear);
router.put('/:id/estado', autorizarRoles('admin', 'gerente'), cambiarEstado);

module.exports = router;
