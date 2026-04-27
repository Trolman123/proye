import React, { useState, useEffect } from 'react';
import { empresaAPI, authAPI } from '../services/api';
import { FiSave, FiInfo, FiUsers, FiShield } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const Settings = () => {
  const [empresa, setEmpresa] = useState({
    nombre: '', documento: '', tipo_documento: 'RUC', direccion: '', telefono: '', email: '', moneda: 'PEN', simbolo_moneda: 'S/', impuesto_default: 18
  });
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [eRes, uRes] = await Promise.all([
          empresaAPI.obtener(),
          authAPI.listarUsuarios()
        ]);
        setEmpresa(eRes.data.empresa);
        setUsuarios(uRes.data.usuarios);
      } catch { toast.error('Error al cargar configuración'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleUpdateEmpresa = async (e) => {
    e.preventDefault();
    try {
      await empresaAPI.actualizar(empresa);
      toast.success('Datos de empresa actualizados');
    } catch { toast.error('Error al actualizar'); }
  };

  const toggleUsuario = async (u) => {
    try {
      await authAPI.actualizarUsuario(u.id, { activo: !u.activo });
      toast.success('Estado de usuario actualizado');
      const uRes = await authAPI.listarUsuarios();
      setUsuarios(uRes.data.usuarios);
    } catch { toast.error('Error al actualizar usuario'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-50">Configuración</h1>
        <p className="text-dark-400 text-sm mt-1">Gestiona los datos de tu empresa y usuarios</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos de Empresa */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-600/10 text-primary-400 rounded-lg"><FiInfo size={20} /></div>
            <h3 className="font-display font-semibold text-dark-50">Datos de la Empresa</h3>
          </div>
          <form onSubmit={handleUpdateEmpresa} className="space-y-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Nombre Comercial</label>
              <input value={empresa.nombre} onChange={e => setEmpresa({...empresa, nombre: e.target.value})} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1">Tipo Doc.</label>
                <select value={empresa.tipo_documento} onChange={e => setEmpresa({...empresa, tipo_documento: e.target.value})} className="input-field">
                  <option value="RUC">RUC</option><option value="DNI">DNI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Número</label>
                <input value={empresa.documento} onChange={e => setEmpresa({...empresa, documento: e.target.value})} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Dirección</label>
              <input value={empresa.direccion} onChange={e => setEmpresa({...empresa, direccion: e.target.value})} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1">Teléfono</label>
                <input value={empresa.telefono} onChange={e => setEmpresa({...empresa, telefono: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Email</label>
                <input value={empresa.email} onChange={e => setEmpresa({...empresa, email: e.target.value})} className="input-field" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <FiSave size={18} /> Guardar Cambios
            </button>
          </form>
        </div>

        {/* Usuarios */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-600/10 text-amber-400 rounded-lg"><FiUsers size={20} /></div>
            <h3 className="font-display font-semibold text-dark-50">Usuarios del Sistema</h3>
          </div>
          <div className="space-y-3">
            {usuarios.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-dark-100">{u.nombre}</p>
                  <p className="text-xs text-dark-400">{u.email} • <span className="capitalize">{u.rol}</span></p>
                </div>
                <button
                  onClick={() => toggleUsuario(u)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${u.activo ? 'bg-emerald-900/40 text-emerald-400 hover:bg-red-900/40 hover:text-red-400' : 'bg-red-900/40 text-red-400 hover:bg-emerald-900/40 hover:text-emerald-400'}`}
                >
                  {u.activo ? 'ACTIVO' : 'INACTIVO'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
