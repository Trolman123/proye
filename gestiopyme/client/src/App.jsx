import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Clients from './pages/Clients';
import Providers from './pages/Providers';
import Invoices from './pages/Invoices';
import NewInvoice from './pages/NewInvoice';
import InvoiceDetail from './pages/InvoiceDetail';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="productos" element={<Products />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="proveedores" element={<Providers />} />
            <Route path="facturas" element={<Invoices />} />
            <Route path="facturas/nueva" element={<ProtectedRoute roles={['admin', 'gerente']}><NewInvoice /></ProtectedRoute>} />
            <Route path="facturas/:id" element={<InvoiceDetail />} />
            <Route path="reportes" element={<ProtectedRoute roles={['admin', 'gerente']}><Reports /></ProtectedRoute>} />
            <Route path="configuracion" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
