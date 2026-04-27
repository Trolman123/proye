const express = require('express');
const router = express.Router();
const { dashboard, reporteVentas, reporteInventario } = require('../controllers/reportController');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);
router.get('/dashboard', dashboard);
router.get('/ventas', reporteVentas);
router.get('/inventario', reporteInventario);

module.exports = router;
