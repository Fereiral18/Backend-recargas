import api from './api';

import type {
  CreateRechargeData,
  Recharge,
  RechargeFilters,
  RechargeStats,
  ApiResponse,
} from './types';

export const rechargeService = {
  /**
   * Crear nueva recarga
   */
  create: async (
    rechargeData: CreateRechargeData
  ): Promise<ApiResponse<Recharge>> => {
    const response = await api.post<ApiResponse<Recharge>>(
      '/recharges',
      rechargeData
    );

    return response.data;
  },

  /**
   * Crear recarga con archivo
   */
  createWithFile: async (
    formData: FormData
  ): Promise<ApiResponse<Recharge>> => {
    const response = await api.post<ApiResponse<Recharge>>(
      '/recharges',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Obtener imagen del comprobante
   */
  getProofImageUrl: async (
    uuid: string
  ): Promise<string> => {
    const response = await api.get<Blob>(
      `/recharges/${uuid}/proof`,
      {
        responseType: 'blob',
      }
    );

    return URL.createObjectURL(response.data);
  },

  /**
   * Obtener recargas
   */
  getAll: async (
    filters: RechargeFilters = {}
  ): Promise<ApiResponse<Recharge[]>> => {
    const response = await api.get<ApiResponse<Recharge[]>>(
      '/recharges',
      {
        params: filters,
      }
    );

    return response.data;
  },

  /**
   * Obtener recarga por UUID
   */
  getById: async (
    uuid: string
  ): Promise<ApiResponse<Recharge>> => {
    const response = await api.get<ApiResponse<Recharge>>(
      `/recharges/${uuid}`
    );

    return response.data;
  },

  /**
   * Obtener estadísticas
   */
  getStats: async (
    userId?: string
  ): Promise<ApiResponse<RechargeStats>> => {
    const params = userId
      ? { user_id: userId }
      : {};

    const response = await api.get<ApiResponse<RechargeStats>>(
      '/recharges/stats',
      {
        params,
      }
    );

    return response.data;
  },

  /**
   * Cancelar recarga
   */
  cancel: async (
    uuid: string
  ): Promise<ApiResponse<Recharge>> => {
    const response = await api.patch<ApiResponse<Recharge>>(
      `/recharges/${uuid}/cancel`
    );

    return response.data;
  },
};