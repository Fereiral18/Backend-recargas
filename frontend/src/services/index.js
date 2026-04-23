import api from './api';

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Registrar nuevo usuario
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.data?.access_token) {
        localStorage.setItem('access_token', response.data.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Iniciar sesión
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.data?.access_token) {
        localStorage.setItem('access_token', response.data.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Cerrar sesión
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

/**
 * Servicio de usuarios
 */
export const userService = {
  /**
   * Obtener perfil del usuario
   */
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * Obtener dashboard del usuario
   */
  getDashboard: async () => {
    const response = await api.get('/users/dashboard');
    return response.data;
  },

  /**
   * Actualizar perfil
   */
  updateProfile: async (userData) => {
    const response = await api.patch('/users/me', userData);
    return response.data;
  },
};

/**
 * Servicio de recargas
 */
export const rechargeService = {
  /**
   * Crear nueva recarga (JSON)
   */
  create: async (rechargeData) => {
    const response = await api.post('/recharges', rechargeData);
    return response.data;
  },

  /**
   * Crear nueva recarga con archivo (FormData)
   */
  createWithFile: async (formData) => {
    const response = await api.post('/recharges', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Obtener URL del comprobante (protegido con JWT)
   */
  getProofImageUrl: async (uuid) => {
    const response = await api.get(`/recharges/${uuid}/proof`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },

  /**
   * Obtener todas las recargas con filtros
   */
  getAll: async (filters = {}) => {
    const response = await api.get('/recharges', { params: filters });
    return response.data;
  },

  /**
   * Obtener una recarga por UUID
   */
  getById: async (uuid) => {
    const response = await api.get(`/recharges/${uuid}`);
    return response.data;
  },

  /**
   * Obtener estadísticas de recargas
   */
  getStats: async (userId) => {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/recharges/stats', { params });
    return response.data;
  },

  /**
   * Cancelar recarga (solo si PENDING y < 10 min)
   */
  cancel: async (uuid) => {
    const response = await api.patch(`/recharges/${uuid}/cancel`);
    return response.data;
  },
};

/**
 * Servicio de transacciones
 */
export const transactionService = {
  /**
   * Crear nueva transacción
   */
  create: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  /**
   * Obtener todas las transacciones con filtros
   */
  getAll: async (filters = {}) => {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  },

  /**
   * Obtener estadísticas de transacciones
   */
  getStats: async (userId) => {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/transactions/stats', { params });
    return response.data;
  },

  /**
   * Obtener balance del usuario
   */
  getBalance: async (userId) => {
    const response = await api.get(`/transactions/balance/${userId}`);
    return response.data;
  },

  /**
   * Obtener una transacción por UUID
   */
  getById: async (uuid) => {
    const response = await api.get(`/transactions/${uuid}`);
    return response.data;
  },
};

/**
 * Servicio de soporte
 */
export const supportService = {
  /**
   * Crear nuevo ticket
   */
  createTicket: async (ticketData) => {
    const response = await api.post('/support/tickets', ticketData);
    return response.data;
  },

  /**
   * Obtener todos los tickets
   */
  getTickets: async (filters = {}) => {
    const response = await api.get('/support/tickets', { params: filters });
    return response.data;
  },

  /**
   * Obtener estadísticas de tickets
   */
  getStats: async (userId) => {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/support/tickets/stats', { params });
    return response.data;
  },

  /**
   * Obtener un ticket por UUID
   */
  getTicketById: async (uuid) => {
    const response = await api.get(`/support/tickets/${uuid}`);
    return response.data;
  },

  /**
   * Actualizar ticket
   */
  updateTicket: async (uuid, updateData) => {
    const response = await api.patch(`/support/tickets/${uuid}`, updateData);
    return response.data;
  },

  /**
   * Enviar mensaje en ticket
   */
  sendMessage: async (ticketId, messageData) => {
    const response = await api.post(`/support/messages/${ticketId}`, messageData);
    return response.data;
  },

  /**
   * Obtener mensajes de un ticket
   */
  getMessages: async (ticketId) => {
    const response = await api.get(`/support/messages/ticket/${ticketId}`);
    return response.data;
  },
};
