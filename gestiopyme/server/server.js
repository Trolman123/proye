require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const clientRoutes = require('./routes/clients');
const providerRoutes = require('./routes/providers');
const invoiceRoutes = require('./routes/invoices');
const reportRoutes = require('./routes/reports');
const companyRoutes = require('./routes/company');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/clientes', clientRoutes);
app.use('/api/proveedores', providerRoutes);
app.use('/api/facturas', invoiceRoutes);
app.use('/api/reportes', reportRoutes);
app.use('/api/empresa', companyRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'GestioPYME API funcionando', timestamp: new Date() });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// Iniciar servidor y base de datos
const iniciar = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a PostgreSQL establecida');

    await sequelize.sync({ alter: true });
    console.log('✓ Modelos sincronizados con la base de datos');

    app.listen(PORT, () => {
      console.log(`✓ Servidor GestioPYME ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

// Ejecutar servidor solo si no es importado como módulo (ej. por Vercel)
if (require.main === module) {
  iniciar();
}

// Exportar la app para entornos Serverless como Vercel
module.exports = app;
