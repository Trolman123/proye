const { Invoice, InvoiceItem, Product, Client, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const dashboard = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    // Ventas del mes
    const ventasMes = await Invoice.findAll({
      attributes: [
        [fn('SUM', col('total')), 'total_ventas'],
        [fn('COUNT', col('id')), 'cantidad_facturas']
      ],
      where: {
        fecha: { [Op.between]: [inicioMes, finMes] },
        estado: { [Op.ne]: 'anulada' }
      },
      raw: true
    });

    // Facturas pendientes
    const pendientes = await Invoice.count({ where: { estado: 'pendiente' } });

    // Productos con stock bajo
    const stockBajo = await Product.count({
      where: {
        activo: true,
        [Op.and]: [literal('stock <= stock_minimo')]
      }
    });

    // Total de clientes activos
    const totalClientes = await Client.count({ where: { activo: true } });

    // Total de productos activos
    const totalProductos = await Product.count({ where: { activo: true } });

    // Ventas de los últimos 6 meses
    const ventasUltimosMeses = await Invoice.findAll({
      attributes: [
        [fn('TO_CHAR', col('fecha'), 'YYYY-MM'), 'mes'],
        [fn('SUM', col('total')), 'total'],
        [fn('COUNT', col('id')), 'cantidad']
      ],
      where: {
        fecha: { [Op.gte]: new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1) },
        estado: { [Op.ne]: 'anulada' }
      },
      group: [fn('TO_CHAR', col('fecha'), 'YYYY-MM')],
      order: [[fn('TO_CHAR', col('fecha'), 'YYYY-MM'), 'ASC']],
      raw: true
    });

    // Productos más vendidos (top 5)
    const topProductos = await InvoiceItem.findAll({
      attributes: [
        'producto_id',
        [fn('SUM', col('cantidad')), 'total_vendido'],
        [fn('SUM', col('subtotal')), 'total_ingreso']
      ],
      include: [{
        model: Product, as: 'producto',
        attributes: ['nombre', 'codigo'],
        where: { activo: true }
      }],
      group: ['producto_id', 'producto.id', 'producto.nombre', 'producto.codigo'],
      order: [[literal('total_vendido'), 'DESC']],
      limit: 5,
      raw: true,
      nest: true
    });

    // Últimas 5 facturas
    const ultimasFacturas = await Invoice.findAll({
      include: [{ model: Client, as: 'cliente', attributes: ['nombre'] }],
      order: [['fecha', 'DESC']],
      limit: 5
    });

    res.json({
      resumen: {
        ventas_mes: parseFloat(ventasMes[0]?.total_ventas || 0),
        facturas_mes: parseInt(ventasMes[0]?.cantidad_facturas || 0),
        facturas_pendientes: pendientes,
        productos_stock_bajo: stockBajo,
        total_clientes: totalClientes,
        total_productos: totalProductos
      },
      ventas_mensuales: ventasUltimosMeses,
      top_productos: topProductos,
      ultimas_facturas: ultimasFacturas
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener dashboard', error: error.message });
  }
};

const reporteVentas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const where = { estado: { [Op.ne]: 'anulada' } };

    if (fecha_inicio && fecha_fin) {
      where.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
    }

    const facturas = await Invoice.findAll({
      where,
      include: [
        { model: Client, as: 'cliente', attributes: ['nombre', 'numero_documento'] },
        {
          model: InvoiceItem, as: 'items',
          include: [{ model: Product, as: 'producto', attributes: ['nombre', 'codigo'] }]
        }
      ],
      order: [['fecha', 'DESC']]
    });

    const resumen = {
      total_facturas: facturas.length,
      total_ventas: facturas.reduce((sum, f) => sum + parseFloat(f.total), 0),
      total_subtotal: facturas.reduce((sum, f) => sum + parseFloat(f.subtotal), 0),
      total_impuesto: facturas.reduce((sum, f) => sum + parseFloat(f.impuesto_monto), 0)
    };

    res.json({ facturas, resumen });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar reporte', error: error.message });
  }
};

const reporteInventario = async (req, res) => {
  try {
    const productos = await Product.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']]
    });

    const resumen = {
      total_productos: productos.length,
      valor_inventario_compra: productos.reduce((s, p) => s + (parseFloat(p.precio_compra) * p.stock), 0),
      valor_inventario_venta: productos.reduce((s, p) => s + (parseFloat(p.precio_venta) * p.stock), 0),
      productos_stock_bajo: productos.filter(p => p.stock <= p.stock_minimo).length,
      productos_sin_stock: productos.filter(p => p.stock === 0).length
    };

    res.json({ productos, resumen });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar reporte de inventario', error: error.message });
  }
};

module.exports = { dashboard, reporteVentas, reporteInventario };
