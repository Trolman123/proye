import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesAPI, productosAPI, facturasAPI } from '../services/api';
import { FiTrash2, FiPlus, FiSave } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const NewInvoice = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [items, setItems] = useState([]);
  const [impuesto, setImpuesto] = useState(18);
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          clientesAPI.listar({ limit: 200 }),
          productosAPI.listar({ limit: 200 })
        ]);
        setClientes(cRes.data.clientes);
        setProductos(pRes.data.productos);
      } catch { toast.error('Error al cargar datos'); }
    };
    load();
  }, []);

  const addItem = () => {
    setItems([...items, { producto_id: '', cantidad: 1, precio: 0, nombre: '', subtotal: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    if (field === 'producto_id') {
      const prod = productos.find(p => p.id === parseInt(value));
      newItems[index] = {
        ...newItems[index],
        producto_id: value,
        nombre: prod?.nombre || '',
        precio: parseFloat(prod?.precio_venta || 0),
        subtotal: parseFloat(prod?.precio_venta || 0) * newItems[index].cantidad
      };
    } else if (field === 'cantidad') {
      const cant = parseInt(value) || 0;
      newItems[index] = { ...newItems[index], cantidad: cant, subtotal: newItems[index].precio * cant };
    }
    setItems(newItems);
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const montoImpuesto = subtotal * (impuesto / 100);
  const total = subtotal + montoImpuesto;
  const formatMoney = (n) => `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteId) { toast.error('Selecciona un cliente'); return; }
    if (items.length === 0) { toast.error('Agrega al menos un producto'); return; }

    setGuardando(true);
    try {
      await facturasAPI.crear({
        cliente_id: parseInt(clienteId),
        items: items.map(i => ({ producto_id: parseInt(i.producto_id), cantidad: i.cantidad })),
        impuesto_porcentaje: impuesto,
        observaciones
      });
      toast.success('Factura creada exitosamente');
      navigate('/facturas');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al crear factura');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-50">Nueva Factura</h1>
        <p className="text-dark-400 text-sm mt-1">Crea una nueva factura de venta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Cliente */}
            <div className="card">
              <h3 className="text-sm font-medium text-dark-300 mb-3">Datos del cliente</h3>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="input-field" required>
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} — {c.numero_documento}</option>
                ))}
              </select>
            </div>

            {/* Ítems */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-dark-300">Detalle de la factura</h3>
                <button type="button" onClick={addItem} className="btn-secondary flex items-center gap-1 text-sm py-1.5 px-3">
                  <FiPlus size={14} /> Agregar ítem
                </button>
              </div>

              {items.length === 0 ? (
                <p className="text-dark-500 text-sm text-center py-6">No hay ítems. Haz clic en "Agregar ítem".</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-dark-800 rounded-lg">
                      <select
                        value={item.producto_id}
                        onChange={(e) => updateItem(idx, 'producto_id', e.target.value)}
                        className="input-field flex-1"
                        required
                      >
                        <option value="">Seleccionar producto...</option>
                        {productos.filter(p => p.stock > 0).map(p => (
                          <option key={p.id} value={p.id}>{p.codigo} — {p.nombre} (Stock: {p.stock})</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => updateItem(idx, 'cantidad', e.target.value)}
                        className="input-field w-20 text-center"
                        required
                      />
                      <span className="text-sm text-dark-300 w-28 text-right">{formatMoney(item.precio)}</span>
                      <span className="text-sm font-medium text-dark-100 w-28 text-right">{formatMoney(item.subtotal)}</span>
                      <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-dark-400 hover:text-red-400">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-sm font-medium text-dark-300 mb-4">Resumen</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Subtotal</span>
                  <span className="text-dark-200">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-dark-400">Impuesto</span>
                  <div className="flex items-center gap-2">
                    <input type="number" value={impuesto} onChange={(e) => setImpuesto(parseFloat(e.target.value) || 0)} className="input-field w-16 text-center text-xs py-1" />
                    <span className="text-dark-200">{formatMoney(montoImpuesto)}</span>
                  </div>
                </div>
                <div className="border-t border-dark-700 pt-3 flex justify-between">
                  <span className="font-medium text-dark-100">Total</span>
                  <span className="font-display text-xl font-bold text-primary-300">{formatMoney(total)}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <label className="block text-sm text-dark-300 mb-2">Observaciones</label>
              <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="input-field" rows="3" placeholder="Notas opcionales..." />
            </div>

            <button type="submit" disabled={guardando} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {guardando ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><FiSave size={18} /> Emitir Factura</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewInvoice;
