import api from './api';

import type {
  CreateTransactionData,
  Transaction,
  TransactionFilters,
  TransactionStats,
  Balance,
  ApiResponse,
} from './types';

export const transactionService = {
  /**
   * Crear transacción
   */
  create: async (
    transactionData: CreateTransactionData
  ): Promise<ApiResponse<Transaction>> => {
    const response = await api.post<ApiResponse<Transaction>>(
      '/transactions',
      transactionData
    );

    return response.data;
  },

  /**
   * Obtener transacciones
   */
  getAll: async (
    filters: TransactionFilters = {}
  ): Promise<ApiResponse<Transaction[]>> => {
    const response = await api.get<ApiResponse<Transaction[]>>(
      '/transactions',
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
  ): Promise<ApiResponse<TransactionStats>> => {
    const params = userId
      ? { user_id: userId }
      : {};

    const response =
      await api.get<ApiResponse<TransactionStats>>(
        '/transactions/stats',
        {
          params,
        }
      );

    return response.data;
  },

  /**
   * Balance
   */
  getBalance: async (
    userId: string
  ): Promise<ApiResponse<Balance>> => {
    const response = await api.get<ApiResponse<Balance>>(
      `/transactions/balance/${userId}`
    );

    return response.data;
  },

  /**
   * Obtener transacción
   */
  getById: async (
    uuid: string
  ): Promise<ApiResponse<Transaction>> => {
    const response = await api.get<ApiResponse<Transaction>>(
      `/transactions/${uuid}`
    );

    return response.data;
  },
};