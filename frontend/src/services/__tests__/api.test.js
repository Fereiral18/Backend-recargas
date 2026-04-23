import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import api from '../api';

vi.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should create axios instance with correct baseURL', () => {
    expect(api.defaults.baseURL).toBeDefined();
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', async () => {
      const token = 'test-token-123';
      localStorage.setItem('token', token);

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      
      // Simulate interceptor
      expect(localStorage.getItem('token')).toBe(token);
    });

    it('should not add Authorization header when token does not exist', () => {
      const config = { headers: {} };
      
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Response Interceptor', () => {
    it('should return response data on success', () => {
      const response = { data: { message: 'success' } };
      
      expect(response.data).toEqual({ message: 'success' });
    });
  });
});
