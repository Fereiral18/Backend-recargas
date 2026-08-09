// ============================================
// USUARIO
// ============================================

export interface User {
  id: string;
  uuid?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}


// ============================================
// AUTH
// ============================================

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthData {
  access_token: string;
  user: User;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  data: AuthData;
}


// ============================================
// RESPUESTAS GENERALES
// ============================================

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}


// ============================================
// USUARIOS
// ============================================

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

export interface DashboardData {
  balance?: number;
  totalRecharges?: number;
  totalTransactions?: number;
  totalSpent?: number;
  recentTransactions?: Transaction[];
}


// ============================================
// RECARGAS
// ============================================

export interface CreateRechargeData {
  amount: number;
  currency?: string;
  paymentMethod?: string;
  phoneNumber?: string;
  userId?: string;
}

export interface RechargeFilters {
  user_id?: string;
  status?: string;
  currency?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface Recharge {
  id: string;
  uuid: string;
  user_id?: string;
  amount: number;
  currency?: string;
  status: string;
  paymentMethod?: string;
  proof?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RechargeStats {
  total?: number;
  pending?: number;
  completed?: number;
  cancelled?: number;
  amount?: number;
}


// ============================================
// TRANSACCIONES
// ============================================

export interface CreateTransactionData {
  amount: number;
  currency?: string;
  type?: string;
  description?: string;
  user_id?: string;
}

export interface TransactionFilters {
  user_id?: string;
  type?: string;
  status?: string;
  currency?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface Transaction {
  id: string;
  uuid: string;
  user_id?: string;
  amount: number;
  currency?: string;
  type: string;
  status: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionStats {
  total?: number;
  completed?: number;
  pending?: number;
  failed?: number;
  totalAmount?: number;
}

export interface Balance {
  balance: number;
  currency?: string;
}


// ============================================
// SOPORTE
// ============================================

export interface CreateTicketData {
  subject: string;
  message: string;
  category?: string;
  priority?: string;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  user_id?: string;
  page?: number;
  limit?: number;
}

export interface UpdateTicketData {
  status?: string;
  priority?: string;
  subject?: string;
}

export interface Ticket {
  id: string;
  uuid: string;
  user_id?: string;
  subject: string;
  message?: string;
  status: string;
  priority?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketStats {
  total?: number;
  open?: number;
  pending?: number;
  resolved?: number;
  closed?: number;
}

export interface CreateMessageData {
  message: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id?: string;
  message: string;
  createdAt?: string;
}