import api from './api';

/**
 * Servicios adicionales para administradores
 */

// Gestión de Usuarios (Admin)
export const adminUserService = {
  /**
   * Listar todos los usuarios (solo admin)
   */
  getAllUsers: async (filters = {}) => {
    const response = await api.get('/users', { params: filters });
    return response.data;
  },

  /**
   * Obtener estadísticas de usuarios
   */
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  /**
   * Obtener usuario por UUID
   */
  getUserById: async (uuid) => {
    const response = await api.get(`/users/${uuid}`);
    return response.data;
  },

  /**
   * Actualizar usuario (admin)
   */
  updateUser: async (uuid, userData) => {
    const response = await api.patch(`/users/${uuid}`, userData);
    return response.data;
  },

  /**
   * Cambiar rol de usuario
   */
  changeUserRole: async (uuid, role) => {
    const response = await api.patch(`/users/${uuid}`, { role });
    return response.data;
  },

  /**
   * Cambiar estado de usuario (suspender, banear, etc)
   */
  changeUserStatus: async (uuid, status) => {
    const response = await api.patch(`/users/${uuid}`, { status });
    return response.data;
  },
};

// Gestión de Recargas (Admin)
export const adminRechargeService = {
  /**
   * Listar todas las recargas (admin)
   */
  getAllRecharges: async (filters = {}) => {
    const response = await api.get('/recharges', { params: filters });
    return response.data;
  },

  /**
   * Actualizar estado de recarga
   */
  updateRechargeStatus: async (uuid, status) => {
    const response = await api.patch(`/recharges/${uuid}`, { status });
    return response.data;
  },

  /**
   * Obtener estadísticas completas
   */
  getFullStats: async () => {
    const response = await api.get('/recharges/stats');
    return response.data;
  },
};

// Gestión de Tickets (Admin)
export const adminSupportService = {
  /**
   * Listar todos los tickets (admin)
   */
  getAllTickets: async (filters = {}) => {
    const response = await api.get('/support/tickets', { params: filters });
    return response.data;
  },

  /**
   * Asignar ticket a admin
   */
  assignTicket: async (uuid, adminId) => {
    const response = await api.patch(`/support/tickets/${uuid}`, {
      assigned_to: adminId,
      status: 'IN_PROGRESS',
    });
    return response.data;
  },

  /**
   * Cambiar estado de ticket
   */
  updateTicketStatus: async (uuid, status) => {
    const response = await api.patch(`/support/tickets/${uuid}`, { status });
    return response.data;
  },

  /**
   * Responder ticket (admin)
   */
  replyToTicket: async (ticketId, message) => {
    const response = await api.post(`/support/messages/${ticketId}`, {
      message,
      type: 'ADMIN_MESSAGE',
    });
    return response.data;
  },
};
