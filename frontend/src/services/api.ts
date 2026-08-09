import axios from 'axios';
import { toast } from 'react-toastify';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Manejar otros errores
    if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción.');
    }
    
    if (error.response?.status === 404) {
      toast.error('Recurso no encontrado.');
    }
    
    if (error.response?.status >= 500) {
      toast.error('Error del servidor. Por favor, intenta más tarde.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
