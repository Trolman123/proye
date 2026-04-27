const express = require('express');
const router = express.Router();
const { listar, obtener, crear, actualizar, eliminar, categorias, alertasStock } = require('../controllers/productController');
const { verificarToken, autorizarRoles } = require('../middleware/auth');

router.use(verificarToken);
router.get('/', listar);
router.get('/categorias', categorias);
router.get('/alertas-stock', alertasStock);
router.get('/:id', obtener);
router.post('/', autorizarRoles('admin', 'gerente'), crear);
router.put('/:id', autorizarRoles('admin', 'gerente'), actualizar);
router.delete('/:id', autorizarRoles('admin'), eliminar);

module.exports = router;
