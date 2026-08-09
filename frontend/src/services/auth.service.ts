import axios from 'axios';
import api from './api';

import type {
  RegisterData,
  LoginCredentials,
  AuthResponse,
  User,
} from './types';

export const authService = {
  /**
   * Registrar nuevo usuario
   */
  register: async (
    userData: RegisterData
  ): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        '/auth/register',
        userData
      );

      if (response.data.data?.access_token) {
        localStorage.setItem(
          'access_token',
          response.data.data.access_token
        );

        localStorage.setItem(
          'user',
          JSON.stringify(response.data.data.user)
        );
      }

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || error;
      }

      throw error;
    }
  },

  /**
   * Iniciar sesión
   */
  login: async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        '/auth/login',
        credentials
      );

      if (response.data.data?.access_token) {
        localStorage.setItem(
          'access_token',
          response.data.data.access_token
        );

        localStorage.setItem(
          'user',
          JSON.stringify(response.data.data.user)
        );
      }

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || error;
      }

      throw error;
    }
  },

  /**
   * Cerrar sesión
   */
  logout: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');

    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: (): boolean => {
    return Boolean(
      localStorage.getItem('access_token')
    );
  },
};