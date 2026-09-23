import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { UserRole, UserStatus } from '../../common/enums';

jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    phone: '+1234567890',
    first_name: 'John',
    last_name: 'Doe',
    password_hash: '$2a$10$hashedPassword',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    balance: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);

    mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
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
      userRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser as any);
      userRepository.create.mockReturnValue(mockUser as any);
      userRepository.save.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('jwt.token.here');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token', 'jwt.token.here');
      expect(result).toHaveProperty('user');
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      userRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser as any);
      userRepository.create.mockReturnValue(mockUser as any);
      userRepository.save.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('jwt.token.here');

      await service.register(registerDto);

      const createdUser = userRepository.create.mock.calls[0][0] as any;
      expect(createdUser.password_hash).not.toBe(registerDto.password);
    });

    it('should not return password_hash in the response', async () => {
      userRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser as any);
      userRepository.create.mockReturnValue(mockUser as any);
      userRepository.save.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('jwt.token.here');

      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty('password_hash');
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser } as any);
      userRepository.save.mockImplementation(async (u) => u as any);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('jwt.token.here');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', 'jwt.token.here');
      expect(result).toHaveProperty('user');
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: loginDto.email } });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should still run a bcrypt comparison for an unknown email (no timing leak)', async () => {
      userRepository.findOne.mockResolvedValue(null);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginDto.password, expect.any(String));
    });

    it('should throw UnauthorizedException if account is not active and the password is correct', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser, status: UserStatus.SUSPENDED } as any);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      await expect(service.login(loginDto)).rejects.toThrow('Account is not active');
    });

    it('should not reveal that an inactive account exists when the password is wrong', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser, status: UserStatus.SUSPENDED } as any);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser } as any);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should not return password_hash in the response', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser } as any);
      userRepository.save.mockImplementation(async (u) => u as any);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('jwt.token.here');

      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty('password_hash');
    });
  });

  describe('validateUser', () => {
    it('should return the user if active', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser } as any);

      const result = await service.validateUser(mockUser.uuid);

      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if account is not active', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser, status: UserStatus.BANNED } as any);

      await expect(service.validateUser(mockUser.uuid)).rejects.toThrow(UnauthorizedException);
    });
  });
});
