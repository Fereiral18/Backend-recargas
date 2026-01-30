import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from '../repositories/users.repository';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRole, UserStatus } from '../../common/enums';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    phone: '+1234567890',
    first_name: 'John',
    last_name: 'Doe',
    password: '$2a$10$hashedPassword',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    balance: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const mockUsersRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(UsersRepository);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      phone: '+1234567890',
      firstName: 'Jane',
      lastName: 'Smith',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(mockUser as any);
      usersRepository.save.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('jwt.token.here');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(mockUser as any);
      usersRepository.save.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('jwt.token.here');

      await service.register(registerDto);

      const savedUser = usersRepository.save.mock.calls[0][0];
      expect(savedUser.password).not.toBe(registerDto.password);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true) as any);
      jwtService.sign.mockReturnValue('jwt.token.here');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', 'jwt.token.here');
      expect(result).toHaveProperty('user');
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false) as any);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should not return password in response', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true) as any);
      jwtService.sign.mockReturnValue('jwt.token.here');

      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('validateUser', () => {
    it('should return user if validation succeeds', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true) as any);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result?.email).toBe(mockUser.email);
    });

    it('should return null if user not found', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false) as any);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });
});
