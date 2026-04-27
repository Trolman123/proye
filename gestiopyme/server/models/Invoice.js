const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_factura: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'clientes', key: 'id' }
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  impuesto_porcentaje: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 18.00
  },
  impuesto_monto: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagada', 'anulada'),
    defaultValue: 'pendiente'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  creado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'usuarios', key: 'id' }
  }
}, {
  tableName: 'facturas',
  timestamps: true
});

module.exports = Invoice;
