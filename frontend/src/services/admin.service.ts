import api from './api';

import type {
  User,
  Recharge,
  Ticket,
  TicketMessage,
  RechargeFilters,
  TicketFilters,
  ApiResponse,
} from './types';


// ============================================
// TIPOS ADMIN
// ============================================

export interface AdminUser {
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  balance?: number | string | null;
  created_at: string;
  updated_at?: string;
}
export interface AdminRecharge {
  uuid: string;

  amount: number | string;

  currency?: string | null;

  status: RechargeStatus;

  operator: string;
  type: string;

  phone_number: string;

  package?: string | null;

  proof_image_path?: string | null;

  payment_method?: string | null;

  transaction_id?: string | null;

  reference?: string | null;

  // true = revendedor (ya se le debitó el balance al crear el pedido, se
  // gestiona/entrega a mano). false/undefined = cliente final (se paga y se
  // completa solo vía Mercado Pago + proveedor, nunca a mano).
  paid_from_balance?: boolean;

  created_at: string;

  updated_at?: string | null;

  user?: {
    uuid?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
}
export interface AdminUserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminUserStats {
  total?: number;
  active?: number;
  suspended?: number;
  banned?: number;
  admins?: number;
  users?: number;
}

export interface UpdateAdminUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
}

// Coinciden exacto con backend/src/common/enums/user-role.enum.ts y
// user-status.enum.ts — OJO que status es una mezcla real de mayúsc/minúsc
// en el backend (ACTIVE = 'active', pero INACTIVE = 'INACTIVE', etc.), no
// un typo de este archivo.
export type UserRole =
  | 'user'
  | 'reseller'
  | 'admin';

export type UserStatus =
  | 'active'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'BANNED';

export type RechargeStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export interface AdminRechargeStats {
  total?: number;
  pending?: number;
  completed?: number;
  cancelled?: number;
  rejected?: number;
  totalAmount?: number;
}

export interface AssignTicketData {
  assigned_to: string;
  status?: TicketStatus;
}

export interface AdminReplyData {
  message: string;
  type: 'ADMIN_MESSAGE';
}


// ============================================
// GESTIÓN DE USUARIOS
// ============================================

export const adminUserService = {
  /**
   * Listar todos los usuarios
   */
getAllUsers: async (
  filters: AdminUserFilters = {}
): Promise<ApiResponse<AdminUser[]>> => {
  const response = await api.get<ApiResponse<AdminUser[]>>(
    '/users',
    {
      params: filters,
    }
  );

  return response.data;
},

  /**
   * Obtener estadísticas de usuarios
   */
  getStats: async (): Promise<
    ApiResponse<AdminUserStats>
  > => {
    const response =
      await api.get<ApiResponse<AdminUserStats>>(
        '/users/stats'
      );

    return response.data;
  },

  /**
   * Obtener usuario por UUID
   */
  getUserById: async (
    uuid: string
  ): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>(
      `/users/${uuid}`
    );

    return response.data;
  },

  /**
   * Actualizar usuario
   */
  updateUser: async (
    uuid: string,
    userData: UpdateAdminUserData
  ): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>(
      `/users/${uuid}`,
      userData
    );

    return response.data;
  },

  /**
   * Cambiar rol
   */
  changeUserRole: async (
    uuid: string,
    role: UserRole
  ): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>(
      `/users/${uuid}`,
      {
        role,
      }
    );

    return response.data;
  },

  /**
   * Cambiar estado
   */
  changeUserStatus: async (
    uuid: string,
    status: UserStatus
  ): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>(
      `/users/${uuid}`,
      {
        status,
      }
    );

    return response.data;
  },

  /**
   * Acredita saldo directo al balance de un revendedor (ajuste manual,
   * fuera del flujo de solicitud + comprobante).
   */
  creditBalance: async (
    uuid: string,
    amount: number,
    note?: string
  ): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>(
      `/users/${uuid}/balance/credit`,
      { amount, note }
    );

    return response.data;
  },
};


// ============================================
// GESTIÓN DE RECARGAS
// ============================================

export const adminRechargeService = {
  /**
   * Listar todas las recargas
   */
  getAllRecharges: async (
  filters: RechargeFilters = {}
): Promise<ApiResponse<AdminRecharge[]>> => {
  const response =
    await api.get<ApiResponse<AdminRecharge[]>>(
      '/recharges',
      {
        params: filters,
      }
    );

  return response.data;
},

  /**
   * Actualizar estado de recarga
   */
  updateRechargeStatus: async (
    uuid: string,
    status: RechargeStatus
  ): Promise<ApiResponse<Recharge>> => {
    const response =
      await api.patch<ApiResponse<Recharge>>(
        `/recharges/${uuid}`,
        {
          status,
        }
      );

    return response.data;
  },

  /**
   * Obtener estadísticas completas
   */
  getFullStats: async (): Promise<
    ApiResponse<AdminRechargeStats>
  > => {
    const response =
      await api.get<ApiResponse<AdminRechargeStats>>(
        '/recharges/stats'
      );

    return response.data;
  },
};


// ============================================
// AUDITORÍA / FINANZAS
// ============================================

export interface RevenueSummary {
  currency: 'ARS' | 'USD';
  gross: number;
  refunded: number;
  net: number;
  count: number;
}

export interface RevenueStats {
  b2c: RevenueSummary;
  reseller: RevenueSummary;
}

export interface SupplierBalance {
  ok: boolean;
  balance: string;
  currency: string;
}

export interface RevenuePeriod {
  from?: string;
  to?: string;
}

export const adminFinanceService = {
  /**
   * Ingresos netos de clientes finales (ARS) y revendedores (USD),
   * descontando reembolsos. Sin `period`, trae todo el histórico.
   */
  getRevenueStats: async (period?: RevenuePeriod): Promise<RevenueStats> => {
    const response = await api.get<RevenueStats>('/transactions/revenue-stats', {
      params: period,
    });
    return response.data;
  },

  /**
   * Nuestro saldo prepago con el proveedor (FZR Cards).
   */
  getSupplierBalance: async (): Promise<SupplierBalance> => {
    const response = await api.get<SupplierBalance>('/supplier/fzr/catalog/balance');
    return response.data;
  },
};


// ============================================
// GESTIÓN DE SOPORTE
// ============================================

export const adminSupportService = {
  /**
   * Listar todos los tickets
   */
  getAllTickets: async (
    filters: TicketFilters = {}
  ): Promise<ApiResponse<Ticket[]>> => {
    const response =
      await api.get<ApiResponse<Ticket[]>>(
        '/support/tickets',
        {
          params: filters,
        }
      );

    return response.data;
  },

  /**
   * Asignar ticket a administrador
   */
  assignTicket: async (
    uuid: string,
    adminId: string
  ): Promise<ApiResponse<Ticket>> => {
    const response =
      await api.patch<ApiResponse<Ticket>>(
        `/support/tickets/${uuid}`,
        {
          assigned_to: adminId,
          status: 'IN_PROGRESS',
        }
      );

    return response.data;
  },

  /**
   * Cambiar estado del ticket
   */
  updateTicketStatus: async (
    uuid: string,
    status: TicketStatus
  ): Promise<ApiResponse<Ticket>> => {
    const response =
      await api.patch<ApiResponse<Ticket>>(
        `/support/tickets/${uuid}`,
        {
          status,
        }
      );

    return response.data;
  },

  /**
   * Responder ticket
   */
  replyToTicket: async (
    ticketId: string,
    message: string
  ): Promise<ApiResponse<TicketMessage>> => {
    const response =
      await api.post<ApiResponse<TicketMessage>>(
        `/support/messages/${ticketId}`,
        {
          message,
          type: 'ADMIN_RESPONSE',
        }
      );

    return response.data;
  },
};