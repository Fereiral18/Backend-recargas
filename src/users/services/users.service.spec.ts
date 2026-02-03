import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { UserRole, UserStatus } from '../../common/enums';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

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
    const mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user without password', async () => {
      repository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findOne(mockUser.uuid);

      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty('password_hash');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { uuid: mockUser.uuid },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateDto = {
        first_name: 'Jane',
        phone: '+9876543210',
      };

      repository.findOne.mockResolvedValue(mockUser as User);
      repository.save.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      } as User);

      const result = await service.update(mockUser.uuid, updateDto);

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password_hash');
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-uuid', { first_name: 'Jane' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard data', async () => {
      repository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.getDashboard(mockUser.uuid);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('total_recharges');
      expect(result).toHaveProperty('pending_recharges');
      expect(result).toHaveProperty('total_transactions');
      expect(result).toHaveProperty('open_tickets');
    });
  });
});
