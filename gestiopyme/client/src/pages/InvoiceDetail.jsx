import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facturasAPI, empresaAPI } from '../services/api';
import { FiArrowLeft, FiPrinter } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [fRes, eRes] = await Promise.all([
          facturasAPI.obtener(id),
          empresaAPI.obtener()
        ]);
        setFactura(fRes.data.factura);
        setEmpresa(eRes.data.empresa);
      } catch { toast.error('Error al cargar factura'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const formatMoney = (n) => `S/ ${parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div></div>;
  if (!factura) return <div className="p-6 text-center text-dark-400">Factura no encontrada</div>;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate('/facturas')} className="btn-secondary flex items-center gap-2">
          <FiArrowLeft size={16} /> Volver
        </button>
        <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
          <FiPrinter size={16} /> Imprimir
        </button>
      </div>

      <div className="card max-w-4xl mx-auto bg-white text-slate-900 p-8 shadow-xl" id="invoice-print">
        {/* Encabezado */}
        <div className="flex justify-between items-start border-b pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-600 mb-2">{empresa?.nombre || 'Mi Empresa'}</h1>
            <p className="text-sm text-slate-500">{empresa?.direccion}</p>
            <p className="text-sm text-slate-500">{empresa?.tipo_documento}: {empresa?.documento}</p>
            <p className="text-sm text-slate-500">Tel: {empresa?.telefono}</p>
            <p className="text-sm text-slate-500">Email: {empresa?.email}</p>
          </div>
          <div className="text-right">
            <div className="bg-primary-50 border border-primary-100 p-4 rounded-lg inline-block">
              <h2 className="text-primary-600 font-bold text-lg mb-1">FACTURA DE VENTA</h2>
              <p className="text-2xl font-mono font-bold text-slate-800">{factura.numero_factura}</p>
            </div>
            <p className="text-sm text-slate-500 mt-4">Fecha: <span className="font-semibold text-slate-700">{factura.fecha}</span></p>
            <p className="text-sm text-slate-500">Estado: <span className={`uppercase font-bold ${factura.estado === 'pagada' ? 'text-emerald-600' : factura.estado === 'pendiente' ? 'text-amber-500' : 'text-red-500'}`}>{factura.estado}</span></p>
          </div>
        </div>

        {/* Cliente */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Facturar a:</h3>
          <p className="text-lg font-bold text-slate-800">{factura.cliente?.nombre}</p>
          <p className="text-sm text-slate-600">{factura.cliente?.tipo_documento}: {factura.cliente?.numero_documento}</p>
          <p className="text-sm text-slate-600">Dirección: {factura.cliente?.direccion || '—'}</p>
          <p className="text-sm text-slate-600">Tel: {factura.cliente?.telefono || '—'}</p>
        </div>

        {/* Tabla de ítems */}
        <table className="w-full mb-8">
          <thead className="border-b-2 border-slate-100">
            <tr>
              <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase">Descripción</th>
              <th className="text-center py-3 text-xs font-bold text-slate-500 uppercase w-24">Cant.</th>
              <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase w-32">Precio Unit.</th>
              <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase w-32">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {factura.items?.map((item) => (
              <tr key={item.id}>
                <td className="py-4">
                  <p className="font-medium text-slate-800">{item.producto?.nombre}</p>
                  <p className="text-xs text-slate-500">{item.producto?.codigo}</p>
                </td>
                <td className="py-4 text-center text-slate-600">{item.cantidad}</td>
                <td className="py-4 text-right text-slate-600">{formatMoney(item.precio_unitario)}</td>
                <td className="py-4 text-right font-medium text-slate-800">{formatMoney(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal:</span>
              <span>{formatMoney(factura.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>IGV ({factura.impuesto_porcentaje}%):</span>
              <span>{formatMoney(factura.impuesto_monto)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900 border-t pt-3">
              <span>TOTAL:</span>
              <span>{formatMoney(factura.total)}</span>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        {factura.observaciones && (
          <div className="mt-12 pt-8 border-t">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Observaciones:</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{factura.observaciones}</p>
          </div>
        )}

        <div className="mt-12 text-center text-xs text-slate-400 italic">
          Gracias por su preferencia. Esta es una representación digital de una factura.
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .card { border: none !important; box-shadow: none !important; p: 0 !important; }
          #invoice-print { margin: 0 !important; width: 100% !important; max-width: none !important; }
        }
      `}} />
    </div>
  );
};

export default InvoiceDetail;
