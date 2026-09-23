import api from './api';

import type {
  ApiResponse,
  BalanceTopUpRequest,
  CreateBalanceTopUpData,
} from './types';

export const balanceTopUpService = {
  /**
   * Solicitar carga de saldo (revendedores). Sube el comprobante y queda
   * PENDING hasta que un admin la revise.
   */
  create: async (
    data: CreateBalanceTopUpData
  ): Promise<ApiResponse<BalanceTopUpRequest>> => {
    const formData = new FormData();

    formData.append('amount', String(data.amount));

    if (data.note) {
      formData.append('note', data.note);
    }

    formData.append('proof_image', data.proof_image);

    const response = await api.post<ApiResponse<BalanceTopUpRequest>>(
      '/balance-topups',
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
   * Lista las solicitudes: el backend ya filtra solo — un revendedor ve las
   * suyas, un admin las ve todas.
   */
  getAll: async (
    status?: string
  ): Promise<{ data: BalanceTopUpRequest[]; meta?: { total: number } }> => {
    const response = await api.get<{
      data: BalanceTopUpRequest[];
      meta?: { total: number };
    }>('/balance-topups', {
      params: status ? { status } : {},
    });

    return response.data;
  },

  getById: async (
    uuid: string
  ): Promise<ApiResponse<BalanceTopUpRequest>> => {
    const response = await api.get<ApiResponse<BalanceTopUpRequest>>(
      `/balance-topups/${uuid}`
    );

    return response.data;
  },

  getProofImageUrl: async (uuid: string): Promise<string> => {
    const response = await api.get<Blob>(
      `/balance-topups/${uuid}/proof`,
      {
        responseType: 'blob',
      }
    );

    return URL.createObjectURL(response.data);
  },

  /**
   * Aprueba una solicitud (admin only): acredita el saldo automáticamente.
   */
  approve: async (
    uuid: string,
    reviewNote?: string
  ): Promise<ApiResponse<BalanceTopUpRequest>> => {
    const response = await api.patch<ApiResponse<BalanceTopUpRequest>>(
      `/balance-topups/${uuid}/approve`,
      { review_note: reviewNote }
    );

    return response.data;
  },

  /**
   * Rechaza una solicitud (admin only): no toca el saldo.
   */
  reject: async (
    uuid: string,
    reviewNote?: string
  ): Promise<ApiResponse<BalanceTopUpRequest>> => {
    const response = await api.patch<ApiResponse<BalanceTopUpRequest>>(
      `/balance-topups/${uuid}/reject`,
      { review_note: reviewNote }
    );

    return response.data;
  },
};
