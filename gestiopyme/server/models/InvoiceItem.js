const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoiceItem = sequelize.define('InvoiceItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  factura_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'facturas', key: 'id' }
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'productos', key: 'id' }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: { args: [1], msg: 'La cantidad mínima es 1' } }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'factura_items',
  timestamps: true
});

module.exports = InvoiceItem;
