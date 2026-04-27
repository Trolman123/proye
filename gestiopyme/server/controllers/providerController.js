const { Provider } = require('../models');
const { Op } = require('sequelize');

const listar = async (req, res) => {
  try {
    const { busqueda, page = 1, limit = 20 } = req.query;
    const where = { activo: true };

    if (busqueda) {
      where[Op.or] = [
        { razon_social: { [Op.iLike]: `%${busqueda}%` } },
        { numero_documento: { [Op.iLike]: `%${busqueda}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Provider.findAndCountAll({
      where, order: [['razon_social', 'ASC']], limit: parseInt(limit), offset
    });

    res.json({ proveedores: rows, total: count, pagina: parseInt(page), totalPaginas: Math.ceil(count / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener proveedores', error: error.message });
  }
};

const obtener = async (req, res) => {
  try {
    const proveedor = await Provider.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    res.json({ proveedor });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener proveedor', error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const proveedor = await Provider.create(req.body);
    res.status(201).json({ mensaje: 'Proveedor creado exitosamente', proveedor });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errores = error.errors.map(e => e.message);
      return res.status(400).json({ mensaje: 'Error de validación', errores });
    }
    res.status(500).json({ mensaje: 'Error al crear proveedor', error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const proveedor = await Provider.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    await proveedor.update(req.body);
    res.json({ mensaje: 'Proveedor actualizado', proveedor });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errores = error.errors.map(e => e.message);
      return res.status(400).json({ mensaje: 'Error de validación', errores });
    }
    res.status(500).json({ mensaje: 'Error al actualizar proveedor', error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const proveedor = await Provider.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    await proveedor.update({ activo: false });
    res.json({ mensaje: 'Proveedor eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar proveedor', error: error.message });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
