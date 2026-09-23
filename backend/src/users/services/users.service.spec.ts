import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { NotFoundException } from '@nestjs/common';
import { UserRole, UserStatus, TransactionType, TransactionStatus } from '../../common/enums';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;

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
      increment: jest.fn(),
    };

    const mockTransactionRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
    transactionRepository = module.get(getRepositoryToken(Transaction));
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

  describe('updateAsAdmin', () => {
    it('should update role, status and tier but strip balance', async () => {
      repository.findOne.mockResolvedValue({ ...mockUser } as User);
      repository.save.mockImplementation(async (u) => u as User);

      const result = await service.updateAsAdmin(mockUser.uuid, {
        role: UserRole.RESELLER,
        tier_id: 'tier-uuid-1',
        balance: 99999,
      } as any);

      expect(result.role).toBe(UserRole.RESELLER);
      expect((result as any).tier_id).toBe('tier-uuid-1');
      const savedUser = repository.save.mock.calls[0][0] as any;
      expect(savedUser.balance).toBe(0); // untouched, not 99999
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.updateAsAdmin('non-existent-uuid', { role: UserRole.RESELLER }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('creditBalance', () => {
    it('should increment the balance and record a DEPOSIT transaction', async () => {
      repository.findOne.mockResolvedValue({ ...mockUser, balance: 50 } as User);
      repository.save.mockImplementation(async (u) => u as User);
      transactionRepository.create.mockImplementation((t) => t as any);
      transactionRepository.save.mockImplementation(async (t) => t as any);

      const result = await service.creditBalance(mockUser.uuid, 100, 'USDT TXID 0xabc');

      expect((result as any).balance).toBe(150);
      // Atomic SQL increment, not a read-modify-write save of the whole user.
      expect(repository.increment).toHaveBeenCalledWith({ uuid: mockUser.uuid }, 'balance', 100);
      expect(transactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.uuid,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          amount: 100,
          metadata: { note: 'USDT TXID 0xabc' },
        }),
      );
      expect(transactionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.creditBalance('non-existent-uuid', 100)).rejects.toThrow(
        NotFoundException,
      );
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
