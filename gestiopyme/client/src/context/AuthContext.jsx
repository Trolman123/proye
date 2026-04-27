import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('usuario');
    if (token && savedUser) {
      try {
        setUsuario(JSON.parse(savedUser));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  const tieneRol = (...roles) => {
    return usuario && roles.includes(usuario.rol);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, tieneRol }}>
      {children}
    </AuthContext.Provider>
  );
};
