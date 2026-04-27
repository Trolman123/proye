import React, { useState, useEffect, useCallback } from 'react';
import { facturasAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEye, FiCheck, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const Invoices = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const navigate = useNavigate();
  const { tieneRol } = useAuth();

  const cargar = useCallback(async () => {
    try {
      const { data } = await facturasAPI.listar({ busqueda, estado, limit: 50 });
      setFacturas(data.facturas);
    } catch { toast.error('Error al cargar facturas'); }
    finally { setLoading(false); }
  }, [busqueda, estado]);

  useEffect(() => { const t = setTimeout(cargar, 300); return () => clearTimeout(t); }, [cargar]);

  const formatMoney = (n) => `S/ ${parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await facturasAPI.cambiarEstado(id, nuevoEstado);
      toast.success(`Factura marcada como ${nuevoEstado}`);
      cargar();
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error al cambiar estado'); }
  };

  const badgeClass = (estado) => {
    if (estado === 'pagada') return 'badge-success';
    if (estado === 'pendiente') return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-50">Facturas</h1>
          <p className="text-dark-400 text-sm mt-1">{facturas.length} facturas</p>
        </div>
        {tieneRol('admin', 'gerente') && (
          <button onClick={() => navigate('/facturas/nueva')} className="btn-primary flex items-center gap-2">
            <FiPlus size={18} /> Nueva Factura
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
          <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar factura..." className="input-field pl-10" />
        </div>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="input-field max-w-[200px]">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="pagada">Pagadas</option>
          <option value="anulada">Anuladas</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Nro. Factura</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Cliente</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Subtotal</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Impuesto</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Total</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-8 text-dark-400">Cargando...</td></tr>
              ) : facturas.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8 text-dark-500">No hay facturas</td></tr>
              ) : facturas.map((f) => (
                <tr key={f.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-3 text-sm font-mono font-medium text-primary-300">{f.numero_factura}</td>
                  <td className="px-6 py-3 text-sm text-dark-300">{f.fecha}</td>
                  <td className="px-6 py-3 text-sm text-dark-100">{f.cliente?.nombre}</td>
                  <td className="px-6 py-3 text-sm text-dark-300 text-right">{formatMoney(f.subtotal)}</td>
                  <td className="px-6 py-3 text-sm text-dark-400 text-right">{formatMoney(f.impuesto_monto)}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-dark-100 text-right">{formatMoney(f.total)}</td>
                  <td className="px-6 py-3 text-center"><span className={badgeClass(f.estado)}>{f.estado}</span></td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/facturas/${f.id}`)} className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg" title="Ver detalle"><FiEye size={16} /></button>
                      {tieneRol('admin', 'gerente') && f.estado === 'pendiente' && (
                        <>
                          <button onClick={() => cambiarEstado(f.id, 'pagada')} className="p-1.5 text-dark-400 hover:text-emerald-400 hover:bg-dark-700 rounded-lg" title="Marcar pagada"><FiCheck size={16} /></button>
                          <button onClick={() => cambiarEstado(f.id, 'anulada')} className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg" title="Anular"><FiXCircle size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
