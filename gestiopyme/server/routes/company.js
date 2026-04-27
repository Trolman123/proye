const express = require('express');
const router = express.Router();
const { obtener, actualizar } = require('../controllers/companyController');
const { verificarToken, autorizarRoles } = require('../middleware/auth');

router.use(verificarToken);
router.get('/', obtener);
router.put('/', autorizarRoles('admin'), actualizar);

module.exports = router;
