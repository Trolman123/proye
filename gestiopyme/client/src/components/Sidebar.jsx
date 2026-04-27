import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid, FiPackage, FiUsers, FiTruck, FiFileText,
  FiPlusCircle, FiBarChart2, FiSettings, FiLogOut, FiX
} from 'react-icons/fi';

const navItems = [
  { to: '/', icon: FiGrid, label: 'Dashboard', roles: ['admin', 'gerente', 'empleado'] },
  { to: '/productos', icon: FiPackage, label: 'Inventario', roles: ['admin', 'gerente', 'empleado'] },
  { to: '/clientes', icon: FiUsers, label: 'Clientes', roles: ['admin', 'gerente', 'empleado'] },
  { to: '/proveedores', icon: FiTruck, label: 'Proveedores', roles: ['admin', 'gerente', 'empleado'] },
  { to: '/facturas', icon: FiFileText, label: 'Facturas', roles: ['admin', 'gerente', 'empleado'] },
  { to: '/facturas/nueva', icon: FiPlusCircle, label: 'Nueva Factura', roles: ['admin', 'gerente'] },
  { to: '/reportes', icon: FiBarChart2, label: 'Reportes', roles: ['admin', 'gerente'] },
  { to: '/configuracion', icon: FiSettings, label: 'Configuración', roles: ['admin'] },
];

const Sidebar = ({ open, onClose }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-600/20 text-primary-300 border-l-2 border-primary-500'
        : 'text-dark-300 hover:bg-dark-800 hover:text-dark-50'
    }`;

  return (
    <>
      {/* Overlay para móvil */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose}></div>
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-dark-900 border-r border-dark-700 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-display font-bold text-lg text-dark-50">GestioPYME</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-dark-400 hover:text-dark-50">
            <FiX size={20} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems
            .filter(item => item.roles.includes(usuario?.rol))
            .map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass} onClick={onClose}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))
          }
        </nav>

        {/* Usuario y Logout */}
        <div className="border-t border-dark-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-primary-600/30 rounded-full flex items-center justify-center">
              <span className="text-primary-300 font-semibold text-sm">
                {usuario?.nombre?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-100 truncate">{usuario?.nombre}</p>
              <p className="text-xs text-dark-400 capitalize">{usuario?.rol}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FiLogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
