const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: 'Mi Empresa'
  },
  documento: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  tipo_documento: {
    type: DataTypes.STRING(20),
    defaultValue: 'RUC'
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  moneda: {
    type: DataTypes.STRING(10),
    defaultValue: 'PEN'
  },
  simbolo_moneda: {
    type: DataTypes.STRING(5),
    defaultValue: 'S/'
  },
  impuesto_default: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 18.00
  },
  logo_url: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'empresa',
  timestamps: true
});

module.exports = Company;
