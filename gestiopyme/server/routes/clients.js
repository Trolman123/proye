const express = require('express');
const router = express.Router();
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/clientController');
const { verificarToken, autorizarRoles } = require('../middleware/auth');

router.use(verificarToken);
router.get('/', listar);
router.get('/:id', obtener);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', autorizarRoles('admin', 'gerente'), eliminar);

module.exports = router;
