import React, { useState, useEffect } from 'react';
import { reportesAPI } from '../services/api';
import { FiDownload, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const Reports = () => {
  const [ventas, setVentas] = useState(null);
  const [inventario, setInventario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, iRes] = await Promise.all([
          reportesAPI.ventas(),
          reportesAPI.inventario()
        ]);
        setVentas(vRes.data);
        setInventario(iRes.data);
      } catch { toast.error('Error al cargar reportes'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const formatMoney = (n) => `S/ ${parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-50">Reportes</h1>
        <p className="text-dark-400 text-sm mt-1">Análisis detallado de ventas e inventario</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de Ventas */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600/10 text-emerald-400 rounded-lg"><FiTrendingUp size={20} /></div>
              <h3 className="font-display font-semibold text-dark-50">Resumen de Ventas</h3>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
              <span className="text-dark-400 text-sm">Total Facturas</span>
              <span className="text-dark-50 font-bold">{ventas?.resumen?.total_facturas}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg border-l-4 border-emerald-500">
              <span className="text-dark-400 text-sm">Ventas Totales (Bruto)</span>
              <span className="text-emerald-400 font-bold">{formatMoney(ventas?.resumen?.total_ventas)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
              <span className="text-dark-400 text-sm">Base Imponible</span>
              <span className="text-dark-50 font-bold">{formatMoney(ventas?.resumen?.total_subtotal)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
              <span className="text-dark-400 text-sm">IGV Recaudado</span>
              <span className="text-dark-50 font-bold">{formatMoney(ventas?.resumen?.total_impuesto)}</span>
            </div>
          </div>
        </div>

        {/* Valor de Inventario */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/10 text-blue-400 rounded-lg"><FiPieChart size={20} /></div>
              <h3 className="font-display font-semibold text-dark-50">Valor de Inventario</h3>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
              <span className="text-dark-400 text-sm">Total Productos</span>
              <span className="text-dark-50 font-bold">{inventario?.resumen?.total_productos}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg border-l-4 border-blue-500">
              <span className="text-dark-400 text-sm">Valor total (Precio Venta)</span>
              <span className="text-blue-400 font-bold">{formatMoney(inventario?.resumen?.valor_inventario_venta)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
              <span className="text-dark-400 text-sm">Costo total (Precio Compra)</span>
              <span className="text-dark-50 font-bold">{formatMoney(inventario?.resumen?.valor_inventario_compra)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
              <span className="text-dark-400 text-sm">Margen Bruto Estimado</span>
              <span className="text-emerald-400 font-bold">
                {formatMoney((inventario?.resumen?.valor_inventario_venta || 0) - (inventario?.resumen?.valor_inventario_compra || 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
