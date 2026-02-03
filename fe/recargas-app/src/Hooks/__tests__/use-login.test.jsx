import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogin } from '../use-login';
import { authService } from '../../services';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../services', () => ({
  authService: {
    login: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useLogin Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: BrowserRouter,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.handleLogin).toBe('function');
  });

  it('should handle successful login', async () => {
    const mockResponse = {
      data: {
        access_token: 'test-token',
        user: {
          uuid: '123',
          email: 'test@example.com',
          role: 'USER',
        },
      },
    };

    authService.login.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: BrowserRouter,
    });

    await act(async () => {
      await result.current.handleLogin({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle login error', async () => {
    authService.login.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useLogin(), {
      wrapper: BrowserRouter,
    });

    await act(async () => {
      try {
        await result.current.handleLogin({
          email: 'test@example.com',
          password: 'wrong-password',
        });
      } catch (error) {
        expect(error.message).toBe('Invalid credentials');
      }
    });
  });
});
