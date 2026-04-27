const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Provider = sequelize.define('Provider', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_documento: {
    type: DataTypes.ENUM('RUC', 'DNI', 'CE', 'Otro'),
    defaultValue: 'RUC'
  },
  numero_documento: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: { msg: 'Este número de documento ya está registrado' }
  },
  razon_social: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { notEmpty: { msg: 'La razón social es obligatoria' } }
  },
  contacto: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: { isEmail: { msg: 'Debe proporcionar un correo válido' } }
  },
  telefono: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  condiciones_pago: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'proveedores',
  timestamps: true
});

module.exports = Provider;
