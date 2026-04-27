import React from 'react';
import { FiMenu, FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuToggle }) => {
  const { usuario } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
      <div className="flex items-center justify-between px-6 py-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-dark-300 hover:text-dark-50 transition-colors"
        >
          <FiMenu size={22} />
        </button>

        <div className="hidden lg:block">
          <h2 className="text-sm text-dark-400">
            Bienvenido, <span className="text-dark-100 font-medium">{usuario?.nombre}</span>
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative text-dark-400 hover:text-dark-50 transition-colors">
            <FiBell size={20} />
          </button>
          <span className="badge-info capitalize">{usuario?.rol}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
