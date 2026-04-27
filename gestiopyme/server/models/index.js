const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Client = require('./Client');
const Provider = require('./Provider');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const Company = require('./Company');

// Relaciones Factura - Cliente
Invoice.belongsTo(Client, { foreignKey: 'cliente_id', as: 'cliente' });
Client.hasMany(Invoice, { foreignKey: 'cliente_id', as: 'facturas' });

// Relaciones Factura - Usuario (quien la creó)
Invoice.belongsTo(User, { foreignKey: 'creado_por', as: 'creador' });

// Relaciones FacturaItem - Factura
InvoiceItem.belongsTo(Invoice, { foreignKey: 'factura_id', as: 'factura' });
Invoice.hasMany(InvoiceItem, { foreignKey: 'factura_id', as: 'items' });

// Relaciones FacturaItem - Producto
InvoiceItem.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto' });
Product.hasMany(InvoiceItem, { foreignKey: 'producto_id', as: 'factura_items' });

module.exports = {
  sequelize,
  User,
  Product,
  Client,
  Provider,
  Invoice,
  InvoiceItem,
  Company
};
