const { Product } = require('../models');
const { Op } = require('sequelize');

const listar = async (req, res) => {
  try {
    const { busqueda, categoria, stock_bajo, page = 1, limit = 20 } = req.query;
    const where = { activo: true };

    if (busqueda) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${busqueda}%` } },
        { codigo: { [Op.iLike]: `%${busqueda}%` } }
      ];
    }
    if (categoria) {
      where.categoria = categoria;
    }
    if (stock_bajo === 'true') {
      where[Op.and] = [
        sequelize.where(
          sequelize.col('stock'),
          { [Op.lte]: sequelize.col('stock_minimo') }
        )
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Product.findAndCountAll({
      where,
      order: [['nombre', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      productos: rows,
      total: count,
      pagina: parseInt(page),
      totalPaginas: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
};

const obtener = async (req, res) => {
  try {
    const producto = await Product.findByPk(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json({ producto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener producto', error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const producto = await Product.create(req.body);
    res.status(201).json({ mensaje: 'Producto creado exitosamente', producto });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errores = error.errors.map(e => e.message);
      return res.status(400).json({ mensaje: 'Error de validación', errores });
    }
    res.status(500).json({ mensaje: 'Error al crear producto', error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const producto = await Product.findByPk(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    await producto.update(req.body);
    res.json({ mensaje: 'Producto actualizado', producto });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errores = error.errors.map(e => e.message);
      return res.status(400).json({ mensaje: 'Error de validación', errores });
    }
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const producto = await Product.findByPk(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    await producto.update({ activo: false });
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
};

const categorias = async (req, res) => {
  try {
    const cats = await Product.findAll({
      attributes: ['categoria'],
      where: { activo: true, categoria: { [Op.ne]: null } },
      group: ['categoria'],
      order: [['categoria', 'ASC']]
    });
    res.json({ categorias: cats.map(c => c.categoria) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: error.message });
  }
};

const alertasStock = async (req, res) => {
  try {
    const productos = await Product.findAll({
      where: { activo: true },
      order: [['stock', 'ASC']]
    });
    const alertas = productos.filter(p => p.stock <= p.stock_minimo);
    res.json({ alertas, total: alertas.length });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener alertas', error: error.message });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar, categorias, alertasStock };
