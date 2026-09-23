import api from './api';

import type { ApiResponse, PaymentPreference } from './types';

export const paymentService = {
  /**
   * Crea la preferencia de pago de Mercado Pago para una recarga pendiente
   * y devuelve la URL a la que hay que redirigir al usuario para pagar.
   */
  createMercadoPagoPreference: async (
    rechargeUuid: string
  ): Promise<ApiResponse<PaymentPreference>> => {
    const response = await api.post<ApiResponse<PaymentPreference>>(
      `/payments/mercadopago/preference/${rechargeUuid}`
    );

    return response.data;
  },
};
