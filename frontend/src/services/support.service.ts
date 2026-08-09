import api from './api';

import type {
  CreateTicketData,
  Ticket,
  TicketFilters,
  TicketStats,
  UpdateTicketData,
  CreateMessageData,
  TicketMessage,
  ApiResponse,
} from './types';

export const supportService = {
  /**
   * Crear ticket
   */
  createTicket: async (
    ticketData: CreateTicketData
  ): Promise<ApiResponse<Ticket>> => {
    const response = await api.post<ApiResponse<Ticket>>(
      '/support/tickets',
      ticketData
    );

    return response.data;
  },

  /**
   * Obtener tickets
   */
  getTickets: async (
    filters: TicketFilters = {}
  ): Promise<ApiResponse<Ticket[]>> => {
    const response = await api.get<ApiResponse<Ticket[]>>(
      '/support/tickets',
      {
        params: filters,
      }
    );

    return response.data;
  },

  /**
   * Estadísticas
   */
  getStats: async (
    userId?: string
  ): Promise<ApiResponse<TicketStats>> => {
    const params = userId
      ? { user_id: userId }
      : {};

    const response = await api.get<ApiResponse<TicketStats>>(
      '/support/tickets/stats',
      {
        params,
      }
    );

    return response.data;
  },

  /**
   * Obtener ticket
   */
  getTicketById: async (
    uuid: string
  ): Promise<ApiResponse<Ticket>> => {
    const response = await api.get<ApiResponse<Ticket>>(
      `/support/tickets/${uuid}`
    );

    return response.data;
  },

  /**
   * Actualizar ticket
   */
  updateTicket: async (
    uuid: string,
    updateData: UpdateTicketData
  ): Promise<ApiResponse<Ticket>> => {
    const response = await api.patch<ApiResponse<Ticket>>(
      `/support/tickets/${uuid}`,
      updateData
    );

    return response.data;
  },

  /**
   * Enviar mensaje
   */
  sendMessage: async (
    ticketId: string,
    messageData: CreateMessageData
  ): Promise<ApiResponse<TicketMessage>> => {
    const response =
      await api.post<ApiResponse<TicketMessage>>(
        `/support/messages/${ticketId}`,
        messageData
      );

    return response.data;
  },

  /**
   * Obtener mensajes
   */
  getMessages: async (
    ticketId: string
  ): Promise<ApiResponse<TicketMessage[]>> => {
    const response =
      await api.get<ApiResponse<TicketMessage[]>>(
        `/support/messages/ticket/${ticketId}`
      );

    return response.data;
  },
};