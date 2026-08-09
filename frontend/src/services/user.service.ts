import api from './api';

import type {
  User,
  DashboardData,
  UpdateProfileData,
  ApiResponse,
} from './types';

export const userService = {
  /**
   * Obtener perfil
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>(
      '/users/me'
    );

    return response.data;
  },

  /**
   * Obtener dashboard
   */
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await api.get<ApiResponse<DashboardData>>(
      '/users/dashboard'
    );

    return response.data;
  },

  /**
   * Actualizar perfil
   */
  updateProfile: async (
    userData: UpdateProfileData
  ): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>(
      '/users/me',
      userData
    );

    return response.data;
  },
};