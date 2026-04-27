const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: { msg: 'Este código de producto ya existe' }
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { notEmpty: { msg: 'El nombre del producto es obligatorio' } }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  precio_compra: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: { args: [0], msg: 'El precio de compra no puede ser negativo' } }
  },
  precio_venta: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: { args: [0], msg: 'El precio de venta no puede ser negativo' } }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: { args: [0], msg: 'El stock no puede ser negativo' } }
  },
  stock_minimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: { min: { args: [0], msg: 'El stock mínimo no puede ser negativo' } }
  },
  unidad: {
    type: DataTypes.STRING(30),
    defaultValue: 'unidad'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'productos',
  timestamps: true
});

module.exports = Product;
