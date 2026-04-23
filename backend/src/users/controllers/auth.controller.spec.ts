import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthResponse = {
    access_token: 'jwt.token.here',
    user: {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'USER',
      balance: 0,
    },
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      phone: '+1234567890',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
    };

    it('should register a new user', async () => {
      authService.register.mockResolvedValue(mockAuthResponse as any);

      const result = await controller.register(registerDto);

      expect(result).toEqual({
        message: 'User registered successfully',
        data: mockAuthResponse,
      });
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login a user', async () => {
      authService.login.mockResolvedValue(mockAuthResponse as any);

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        message: 'Login successful',
        data: mockAuthResponse,
      });
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
