const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_documento: {
    type: DataTypes.ENUM('DNI', 'RUC', 'CE', 'Pasaporte', 'Otro'),
    defaultValue: 'DNI'
  },
  numero_documento: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: { msg: 'Este número de documento ya está registrado' }
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { notEmpty: { msg: 'El nombre es obligatorio' } }
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
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'clientes',
  timestamps: true
});

module.exports = Client;
