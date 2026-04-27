import React, { useState, useEffect, useCallback } from 'react';
import { clientesAPI } from '../services/api';
import Modal from '../components/Modal';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const emptyClient = { tipo_documento: 'DNI', numero_documento: '', nombre: '', email: '', telefono: '', direccion: '', observaciones: '' };

const Clients = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyClient);
  const { tieneRol } = useAuth();

  const cargarClientes = useCallback(async () => {
    try {
      const { data } = await clientesAPI.listar({ busqueda, limit: 100 });
      setClientes(data.clientes);
    } catch { toast.error('Error al cargar clientes'); }
    finally { setLoading(false); }
  }, [busqueda]);

  useEffect(() => {
    const t = setTimeout(cargarClientes, 300);
    return () => clearTimeout(t);
  }, [cargarClientes]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await clientesAPI.actualizar(editando.id, form);
        toast.success('Cliente actualizado');
      } else {
        await clientesAPI.crear(form);
        toast.success('Cliente registrado');
      }
      setModalOpen(false); setForm(emptyClient); setEditando(null); cargarClientes();
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error al guardar'); }
  };

  const handleEdit = (c) => {
    setEditando(c);
    setForm({ tipo_documento: c.tipo_documento, numero_documento: c.numero_documento, nombre: c.nombre, email: c.email || '', telefono: c.telefono || '', direccion: c.direccion || '', observaciones: c.observaciones || '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try { await clientesAPI.eliminar(id); toast.success('Cliente eliminado'); cargarClientes(); }
    catch { toast.error('Error al eliminar'); }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-50">Clientes</h1>
          <p className="text-dark-400 text-sm mt-1">{clientes.length} clientes registrados</p>
        </div>
        <button onClick={() => { setForm(emptyClient); setEditando(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
        <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar cliente..." className="input-field pl-10" />
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Documento</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Teléfono</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-dark-400">Cargando...</td></tr>
              ) : clientes.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-dark-500">No hay clientes registrados</td></tr>
              ) : clientes.map((c) => (
                <tr key={c.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="text-xs text-dark-400">{c.tipo_documento}</p>
                    <p className="text-sm font-mono text-dark-200">{c.numero_documento}</p>
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-dark-100">{c.nombre}</td>
                  <td className="px-6 py-3 text-sm text-dark-300">{c.email || '—'}</td>
                  <td className="px-6 py-3 text-sm text-dark-300">{c.telefono || '—'}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(c)} className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg"><FiEdit2 size={16} /></button>
                      {tieneRol('admin', 'gerente') && (
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg"><FiTrash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditando(null); }} title={editando ? 'Editar Cliente' : 'Nuevo Cliente'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Tipo Doc.</label>
              <select name="tipo_documento" value={form.tipo_documento} onChange={handleChange} className="input-field">
                <option value="DNI">DNI</option><option value="RUC">RUC</option><option value="CE">CE</option><option value="Pasaporte">Pasaporte</option><option value="Otro">Otro</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-dark-300 mb-1">Nro. Documento *</label>
              <input name="numero_documento" value={form.numero_documento} onChange={handleChange} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-1">Nombre / Razón Social *</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} className="input-field" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm text-dark-300 mb-1">Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" /></div>
            <div><label className="block text-sm text-dark-300 mb-1">Teléfono</label><input name="telefono" value={form.telefono} onChange={handleChange} className="input-field" /></div>
          </div>
          <div><label className="block text-sm text-dark-300 mb-1">Dirección</label><input name="direccion" value={form.direccion} onChange={handleChange} className="input-field" /></div>
          <div><label className="block text-sm text-dark-300 mb-1">Observaciones</label><textarea name="observaciones" value={form.observaciones} onChange={handleChange} className="input-field" rows="2" /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setModalOpen(false); setEditando(null); }} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{editando ? 'Actualizar' : 'Registrar'} Cliente</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clients;
