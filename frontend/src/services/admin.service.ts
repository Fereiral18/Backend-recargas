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

export type UserRole =
  | 'USER'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type UserStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'BANNED';

export type RechargeStatus =
  | 'PENDING'
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
          type: 'ADMIN_MESSAGE',
        }
      );

    return response.data;
  },
};