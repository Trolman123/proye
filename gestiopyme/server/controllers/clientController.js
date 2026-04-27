const { Client, Invoice } = require('../models');
const { Op } = require('sequelize');

const listar = async (req, res) => {
  try {
    const { busqueda, page = 1, limit = 20 } = req.query;
    const where = { activo: true };

    if (busqueda) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${busqueda}%` } },
        { numero_documento: { [Op.iLike]: `%${busqueda}%` } },
        { email: { [Op.iLike]: `%${busqueda}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Client.findAndCountAll({
      where,
      order: [['nombre', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    res.json({ clientes: rows, total: count, pagina: parseInt(page), totalPaginas: Math.ceil(count / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener clientes', error: error.message });
  }
};

const obtener = async (req, res) => {
  try {
    const cliente = await Client.findByPk(req.params.id, {
      include: [{ model: Invoice, as: 'facturas', limit: 10, order: [['fecha', 'DESC']] }]
    });
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.json({ cliente });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener cliente', error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const cliente = await Client.create(req.body);
    res.status(201).json({ mensaje: 'Cliente creado exitosamente', cliente });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errores = error.errors.map(e => e.message);
      return res.status(400).json({ mensaje: 'Error de validación', errores });
    }
    res.status(500).json({ mensaje: 'Error al crear cliente', error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const cliente = await Client.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    await cliente.update(req.body);
    res.json({ mensaje: 'Cliente actualizado', cliente });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errores = error.errors.map(e => e.message);
      return res.status(400).json({ mensaje: 'Error de validación', errores });
    }
    res.status(500).json({ mensaje: 'Error al actualizar cliente', error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const cliente = await Client.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    await cliente.update({ activo: false });
    res.json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar cliente', error: error.message });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
