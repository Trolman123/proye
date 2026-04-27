import React, { useState, useEffect } from 'react';
import { reportesAPI, productosAPI } from '../services/api';
import StatCard from '../components/StatCard';
import { FiDollarSign, FiFileText, FiAlertTriangle, FiUsers, FiPackage, FiClock } from 'react-icons/fi';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, alertRes] = await Promise.all([
          reportesAPI.dashboard(),
          productosAPI.alertasStock()
        ]);
        setData(dashRes.data);
        setAlertas(alertRes.data.alertas);
      } catch (err) {
        console.error('Error al cargar dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const formatMoney = (num) => `S/ ${parseFloat(num || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

  const barData = {
    labels: data?.ventas_mensuales?.map(v => v.mes) || [],
    datasets: [{
      label: 'Ventas (S/)',
      data: data?.ventas_mensuales?.map(v => parseFloat(v.total)) || [],
      backgroundColor: 'rgba(99, 102, 241, 0.6)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
    }
  };

  const doughnutData = {
    labels: data?.top_productos?.map(p => p.producto?.nombre) || [],
    datasets: [{
      data: data?.top_productos?.map(p => parseInt(p.total_vendido)) || [],
      backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
      borderColor: '#0f172a',
      borderWidth: 2
    }]
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-50">Dashboard</h1>
        <p className="text-dark-400 text-sm mt-1">Resumen general de tu negocio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={FiDollarSign} label="Ventas del mes" value={formatMoney(data?.resumen?.ventas_mes)} color="emerald" />
        <StatCard icon={FiFileText} label="Facturas del mes" value={data?.resumen?.facturas_mes || 0} color="primary" />
        <StatCard icon={FiClock} label="Pendientes" value={data?.resumen?.facturas_pendientes || 0} color="amber" />
        <StatCard icon={FiAlertTriangle} label="Stock bajo" value={data?.resumen?.productos_stock_bajo || 0} color="red" />
        <StatCard icon={FiUsers} label="Clientes" value={data?.resumen?.total_clientes || 0} color="blue" />
        <StatCard icon={FiPackage} label="Productos" value={data?.resumen?.total_productos || 0} color="primary" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-medium text-dark-300 mb-4">Ventas de los últimos meses</h3>
          <div className="h-72">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-dark-300 mb-4">Top productos vendidos</h3>
          <div className="h-72 flex items-center justify-center">
            {data?.top_productos?.length > 0 ? (
              <Doughnut data={doughnutData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 11 } } }
                }
              }} />
            ) : (
              <p className="text-dark-500 text-sm">Sin datos de ventas</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas facturas */}
        <div className="card">
          <h3 className="text-sm font-medium text-dark-300 mb-4">Últimas facturas</h3>
          <div className="space-y-3">
            {data?.ultimas_facturas?.length > 0 ? data.ultimas_facturas.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-dark-100">{f.numero_factura}</p>
                  <p className="text-xs text-dark-400">{f.cliente?.nombre}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-dark-100">{formatMoney(f.total)}</p>
                  <span className={f.estado === 'pagada' ? 'badge-success' : f.estado === 'pendiente' ? 'badge-warning' : 'badge-danger'}>
                    {f.estado}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-dark-500 text-sm text-center py-4">No hay facturas registradas</p>
            )}
          </div>
        </div>

        {/* Alertas de stock */}
        <div className="card">
          <h3 className="text-sm font-medium text-dark-300 mb-4">Alertas de stock bajo</h3>
          <div className="space-y-3">
            {alertas.length > 0 ? alertas.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg border-l-2 border-red-500">
                <div>
                  <p className="text-sm font-medium text-dark-100">{p.nombre}</p>
                  <p className="text-xs text-dark-400">{p.codigo}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-400">{p.stock} uds.</p>
                  <p className="text-xs text-dark-500">Mín: {p.stock_minimo}</p>
                </div>
              </div>
            )) : (
              <p className="text-dark-500 text-sm text-center py-4">Sin alertas de stock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
