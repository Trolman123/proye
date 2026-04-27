import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
