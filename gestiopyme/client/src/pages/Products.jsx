import React, { useState, useEffect, useCallback } from 'react';
import { productosAPI } from '../services/api';
import Modal from '../components/Modal';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const emptyProduct = { codigo: '', nombre: '', descripcion: '', categoria: '', precio_compra: '', precio_venta: '', stock: '', stock_minimo: '5', unidad: 'unidad' };

const Products = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const { tieneRol } = useAuth();

  const cargarProductos = useCallback(async () => {
    try {
      const { data } = await productosAPI.listar({ busqueda, limit: 100 });
      setProductos(data.productos);
    } catch (err) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [busqueda]);

  useEffect(() => {
    const timer = setTimeout(cargarProductos, 300);
    return () => clearTimeout(timer);
  }, [cargarProductos]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await productosAPI.actualizar(editando.id, form);
        toast.success('Producto actualizado');
      } else {
        await productosAPI.crear(form);
        toast.success('Producto creado');
      }
      setModalOpen(false);
      setForm(emptyProduct);
      setEditando(null);
      cargarProductos();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar');
    }
  };

  const handleEdit = (p) => {
    setEditando(p);
    setForm({
      codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion || '',
      categoria: p.categoria || '', precio_compra: p.precio_compra, precio_venta: p.precio_venta,
      stock: p.stock, stock_minimo: p.stock_minimo, unidad: p.unidad || 'unidad'
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await productosAPI.eliminar(id);
      toast.success('Producto eliminado');
      cargarProductos();
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const formatMoney = (n) => `S/ ${parseFloat(n).toFixed(2)}`;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-50">Inventario</h1>
          <p className="text-dark-400 text-sm mt-1">{productos.length} productos registrados</p>
        </div>
        {tieneRol('admin', 'gerente') && (
          <button onClick={() => { setForm(emptyProduct); setEditando(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
            <FiPlus size={18} /> Nuevo Producto
          </button>
        )}
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o código..."
          className="input-field pl-10"
        />
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Código</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Producto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Categoría</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">P. Compra</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">P. Venta</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Stock</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8 text-dark-400">Cargando...</td></tr>
              ) : productos.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-dark-500">No se encontraron productos</td></tr>
              ) : (
                productos.map((p) => (
                  <tr key={p.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-3 text-sm font-mono text-dark-300">{p.codigo}</td>
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-dark-100">{p.nombre}</p>
                      {p.descripcion && <p className="text-xs text-dark-500 truncate max-w-xs">{p.descripcion}</p>}
                    </td>
                    <td className="px-6 py-3 text-sm text-dark-300">{p.categoria || '—'}</td>
                    <td className="px-6 py-3 text-sm text-dark-300 text-right">{formatMoney(p.precio_compra)}</td>
                    <td className="px-6 py-3 text-sm font-medium text-dark-100 text-right">{formatMoney(p.precio_venta)}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.stock <= p.stock_minimo && <FiAlertTriangle size={14} className="text-red-400" />}
                        <span className={`text-sm font-medium ${p.stock <= p.stock_minimo ? 'text-red-400' : 'text-dark-200'}`}>
                          {p.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tieneRol('admin', 'gerente') && (
                          <button onClick={() => handleEdit(p)} className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors">
                            <FiEdit2 size={16} />
                          </button>
                        )}
                        {tieneRol('admin') && (
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors">
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditando(null); }} title={editando ? 'Editar Producto' : 'Nuevo Producto'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Código *</label>
              <input name="codigo" value={form.codigo} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="input-field" rows="2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Categoría</label>
              <input name="categoria" value={form.categoria} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Unidad</label>
              <input name="unidad" value={form.unidad} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">P. Compra *</label>
              <input name="precio_compra" type="number" step="0.01" value={form.precio_compra} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">P. Venta *</label>
              <input name="precio_venta" type="number" step="0.01" value={form.precio_venta} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Stock *</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Stock Mín.</label>
              <input name="stock_minimo" type="number" value={form.stock_minimo} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setModalOpen(false); setEditando(null); }} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{editando ? 'Actualizar' : 'Crear'} Producto</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
