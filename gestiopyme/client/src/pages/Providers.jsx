import React, { useState, useEffect, useCallback } from 'react';
import { proveedoresAPI } from '../services/api';
import Modal from '../components/Modal';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const emptyProvider = { tipo_documento: 'RUC', numero_documento: '', razon_social: '', contacto: '', email: '', telefono: '', direccion: '', condiciones_pago: '', observaciones: '' };

const Providers = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyProvider);
  const { tieneRol } = useAuth();

  const cargar = useCallback(async () => {
    try {
      const { data } = await proveedoresAPI.listar({ busqueda, limit: 100 });
      setProveedores(data.proveedores);
    } catch { toast.error('Error al cargar proveedores'); }
    finally { setLoading(false); }
  }, [busqueda]);

  useEffect(() => { const t = setTimeout(cargar, 300); return () => clearTimeout(t); }, [cargar]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) { await proveedoresAPI.actualizar(editando.id, form); toast.success('Proveedor actualizado'); }
      else { await proveedoresAPI.crear(form); toast.success('Proveedor registrado'); }
      setModalOpen(false); setForm(emptyProvider); setEditando(null); cargar();
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error al guardar'); }
  };

  const handleEdit = (p) => {
    setEditando(p);
    setForm({ tipo_documento: p.tipo_documento, numero_documento: p.numero_documento, razon_social: p.razon_social, contacto: p.contacto || '', email: p.email || '', telefono: p.telefono || '', direccion: p.direccion || '', condiciones_pago: p.condiciones_pago || '', observaciones: p.observaciones || '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    try { await proveedoresAPI.eliminar(id); toast.success('Proveedor eliminado'); cargar(); }
    catch { toast.error('Error al eliminar'); }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-50">Proveedores</h1>
          <p className="text-dark-400 text-sm mt-1">{proveedores.length} proveedores registrados</p>
        </div>
        <button onClick={() => { setForm(emptyProvider); setEditando(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Nuevo Proveedor
        </button>
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
        <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar proveedor..." className="input-field pl-10" />
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Razón Social</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Documento</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Contacto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Teléfono</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Cond. Pago</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-dark-400">Cargando...</td></tr>
              ) : proveedores.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-dark-500">No hay proveedores</td></tr>
              ) : proveedores.map((p) => (
                <tr key={p.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-dark-100">{p.razon_social}</td>
                  <td className="px-6 py-3"><p className="text-xs text-dark-400">{p.tipo_documento}</p><p className="text-sm font-mono text-dark-200">{p.numero_documento}</p></td>
                  <td className="px-6 py-3 text-sm text-dark-300">{p.contacto || '—'}</td>
                  <td className="px-6 py-3 text-sm text-dark-300">{p.telefono || '—'}</td>
                  <td className="px-6 py-3 text-sm text-dark-300">{p.condiciones_pago || '—'}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg"><FiEdit2 size={16} /></button>
                      {tieneRol('admin', 'gerente') && (
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg"><FiTrash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditando(null); }} title={editando ? 'Editar Proveedor' : 'Nuevo Proveedor'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Tipo Doc.</label>
              <select name="tipo_documento" value={form.tipo_documento} onChange={handleChange} className="input-field">
                <option value="RUC">RUC</option><option value="DNI">DNI</option><option value="CE">CE</option><option value="Otro">Otro</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-dark-300 mb-1">Nro. Documento *</label>
              <input name="numero_documento" value={form.numero_documento} onChange={handleChange} className="input-field" required />
            </div>
          </div>
          <div><label className="block text-sm text-dark-300 mb-1">Razón Social *</label><input name="razon_social" value={form.razon_social} onChange={handleChange} className="input-field" required /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm text-dark-300 mb-1">Contacto</label><input name="contacto" value={form.contacto} onChange={handleChange} className="input-field" /></div>
            <div><label className="block text-sm text-dark-300 mb-1">Teléfono</label><input name="telefono" value={form.telefono} onChange={handleChange} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm text-dark-300 mb-1">Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" /></div>
            <div><label className="block text-sm text-dark-300 mb-1">Condiciones de Pago</label><input name="condiciones_pago" value={form.condiciones_pago} onChange={handleChange} className="input-field" /></div>
          </div>
          <div><label className="block text-sm text-dark-300 mb-1">Dirección</label><input name="direccion" value={form.direccion} onChange={handleChange} className="input-field" /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setModalOpen(false); setEditando(null); }} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{editando ? 'Actualizar' : 'Registrar'} Proveedor</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Providers;
