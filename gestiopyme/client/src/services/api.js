import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor: agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  registrar: (data) => api.post('/auth/registrar', data),
  perfil: () => api.get('/auth/perfil'),
  listarUsuarios: () => api.get('/auth/usuarios'),
  actualizarUsuario: (id, data) => api.put(`/auth/usuarios/${id}`, data)
};

// Productos
export const productosAPI = {
  listar: (params) => api.get('/productos', { params }),
  obtener: (id) => api.get(`/productos/${id}`),
  crear: (data) => api.post('/productos', data),
  actualizar: (id, data) => api.put(`/productos/${id}`, data),
  eliminar: (id) => api.delete(`/productos/${id}`),
  categorias: () => api.get('/productos/categorias'),
  alertasStock: () => api.get('/productos/alertas-stock')
};

// Clientes
export const clientesAPI = {
  listar: (params) => api.get('/clientes', { params }),
  obtener: (id) => api.get(`/clientes/${id}`),
  crear: (data) => api.post('/clientes', data),
  actualizar: (id, data) => api.put(`/clientes/${id}`, data),
  eliminar: (id) => api.delete(`/clientes/${id}`)
};

// Proveedores
export const proveedoresAPI = {
  listar: (params) => api.get('/proveedores', { params }),
  obtener: (id) => api.get(`/proveedores/${id}`),
  crear: (data) => api.post('/proveedores', data),
  actualizar: (id, data) => api.put(`/proveedores/${id}`, data),
  eliminar: (id) => api.delete(`/proveedores/${id}`)
};

// Facturas
export const facturasAPI = {
  listar: (params) => api.get('/facturas', { params }),
  obtener: (id) => api.get(`/facturas/${id}`),
  crear: (data) => api.post('/facturas', data),
  cambiarEstado: (id, estado) => api.put(`/facturas/${id}/estado`, { estado })
};

// Reportes
export const reportesAPI = {
  dashboard: () => api.get('/reportes/dashboard'),
  ventas: (params) => api.get('/reportes/ventas', { params }),
  inventario: () => api.get('/reportes/inventario')
};

// Empresa
export const empresaAPI = {
  obtener: () => api.get('/empresa'),
  actualizar: (data) => api.put('/empresa', data)
};

export default api;
