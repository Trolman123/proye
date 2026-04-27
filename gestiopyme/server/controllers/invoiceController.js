const { Invoice, InvoiceItem, Product, Client, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const generarNumeroFactura = async () => {
  const ultima = await Invoice.findOne({ order: [['id', 'DESC']] });
  const num = ultima ? ultima.id + 1 : 1;
  return `FAC-${String(num).padStart(6, '0')}`;
};

const listar = async (req, res) => {
  try {
    const { busqueda, estado, fecha_inicio, fecha_fin, page = 1, limit = 20 } = req.query;
    const where = {};

    if (estado) where.estado = estado;
    if (fecha_inicio && fecha_fin) {
      where.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
    } else if (fecha_inicio) {
      where.fecha = { [Op.gte]: fecha_inicio };
    }
    if (busqueda) {
      where[Op.or] = [
        { numero_factura: { [Op.iLike]: `%${busqueda}%` } },
        { '$cliente.nombre$': { [Op.iLike]: `%${busqueda}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [
        { model: Client, as: 'cliente', attributes: ['id', 'nombre', 'numero_documento'] },
        { model: User, as: 'creador', attributes: ['id', 'nombre'] }
      ],
      order: [['fecha', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.json({ facturas: rows, total: count, pagina: parseInt(page), totalPaginas: Math.ceil(count / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener facturas', error: error.message });
  }
};

const obtener = async (req, res) => {
  try {
    const factura = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'cliente' },
        { model: User, as: 'creador', attributes: ['id', 'nombre'] },
        {
          model: InvoiceItem, as: 'items',
          include: [{ model: Product, as: 'producto', attributes: ['id', 'codigo', 'nombre'] }]
        }
      ]
    });
    if (!factura) return res.status(404).json({ mensaje: 'Factura no encontrada' });
    res.json({ factura });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener factura', error: error.message });
  }
};

const crear = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { cliente_id, items, impuesto_porcentaje, observaciones } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ mensaje: 'La factura debe tener al menos un ítem' });
    }

    const cliente = await Client.findByPk(cliente_id);
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

    let subtotal = 0;
    const itemsProcesados = [];

    for (const item of items) {
      const producto = await Product.findByPk(item.producto_id, { transaction: t });
      if (!producto) throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`);
      }

      const subtotalItem = parseFloat(producto.precio_venta) * item.cantidad;
      subtotal += subtotalItem;

      itemsProcesados.push({
        producto_id: producto.id,
        cantidad: item.cantidad,
        precio_unitario: producto.precio_venta,
        subtotal: subtotalItem
      });

      await producto.update(
        { stock: producto.stock - item.cantidad },
        { transaction: t }
      );
    }

    const imp = parseFloat(impuesto_porcentaje || 18);
    const impuesto_monto = subtotal * (imp / 100);
    const total = subtotal + impuesto_monto;
    const numero_factura = await generarNumeroFactura();

    const factura = await Invoice.create({
      numero_factura,
      cliente_id,
      fecha: new Date(),
      subtotal,
      impuesto_porcentaje: imp,
      impuesto_monto,
      total,
      estado: 'pendiente',
      observaciones,
      creado_por: req.usuario.id
    }, { transaction: t });

    for (const item of itemsProcesados) {
      await InvoiceItem.create({
        ...item,
        factura_id: factura.id
      }, { transaction: t });
    }

    await t.commit();

    const facturaCompleta = await Invoice.findByPk(factura.id, {
      include: [
        { model: Client, as: 'cliente' },
        {
          model: InvoiceItem, as: 'items',
          include: [{ model: Product, as: 'producto' }]
        }
      ]
    });

    res.status(201).json({ mensaje: 'Factura creada exitosamente', factura: facturaCompleta });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al crear factura', error: error.message });
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const factura = await Invoice.findByPk(req.params.id);
    if (!factura) return res.status(404).json({ mensaje: 'Factura no encontrada' });

    const { estado } = req.body;
    if (!['pendiente', 'pagada', 'anulada'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    await factura.update({ estado });
    res.json({ mensaje: 'Estado actualizado', factura });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar estado', error: error.message });
  }
};

module.exports = { listar, obtener, crear, cambiarEstado };
