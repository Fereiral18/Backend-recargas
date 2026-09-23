import api from './api';

import type {
  CreateRechargeData,
  Recharge,
  RechargeFilters,
  RechargeStats,
  RechargePackage,
  ApiResponse,
} from './types';

export const rechargeService = {
  /**
   * Crear nueva recarga. El precio lo calcula el backend a partir del
   * catálogo (operator + package) — el frontend nunca manda un monto.
   * OJO: a diferencia de otros endpoints, este devuelve la recarga directo
   * (sin envolver en {message, data}).
   */
  create: async (
    rechargeData: CreateRechargeData
  ): Promise<Recharge> => {
    const response = await api.post<Recharge>(
      '/recharges',
      rechargeData
    );

    return response.data;
  },

  /**
   * Obtener el catálogo de paquetes vendibles (precio real, definido por un admin).
   */
  getPackages: async (
    operator: string
  ): Promise<RechargePackage[]> => {
    const response = await api.get<RechargePackage[]>(
      '/recharge-packages',
      {
        params: { operator },
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
   * Obtener recarga por UUID (devuelta directo, sin envolver).
   */
  getById: async (
    uuid: string
  ): Promise<Recharge> => {
    const response = await api.get<Recharge>(
      `/recharges/${uuid}`
    );

    return response.data;
  },

  /**
   * Obtener estadísticas (devueltas directo, sin envolver).
   */
  getStats: async (
    userId?: string
  ): Promise<RechargeStats> => {
    const params = userId
      ? { user_id: userId }
      : {};

    const response = await api.get<RechargeStats>(
      '/recharges/stats',
      {
        params,
      }
    );

    return response.data;
  },

  /**
   * Cancelar recarga (devuelta directo, sin envolver).
   */
  cancel: async (
    uuid: string
  ): Promise<Recharge> => {
    const response = await api.patch<Recharge>(
      `/recharges/${uuid}/cancel`
    );

    return response.data;
  },
};