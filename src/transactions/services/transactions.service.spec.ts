import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { NotFoundException } from '@nestjs/common';
import { TransactionType, TransactionStatus } from '../../common/enums';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: jest.Mocked<Repository<Transaction>>;

  const mockTransaction = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-uuid-123',
    type: TransactionType.DEPOSIT,
    amount: 100,
    status: TransactionStatus.COMPLETED,
    reference: 'TXN-1234567890-ABC',
    description: 'Test deposit',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getRepositoryToken(Transaction), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get(getRepositoryToken(Transaction));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      user_id: 'user-uuid-123',
      type: TransactionType.DEPOSIT,
      amount: 100,
      description: 'Test deposit',
    };

    it('should successfully create a transaction', async () => {
      repository.create.mockReturnValue(mockTransaction as any);
      repository.save.mockResolvedValue(mockTransaction as any);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTransaction);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining(createDto));
      expect(repository.save).toHaveBeenCalled();
    });

    it('should generate unique reference', async () => {
      repository.create.mockReturnValue(mockTransaction as any);
      repository.save.mockResolvedValue(mockTransaction as any);

      await service.create(createDto);

      const createdTransaction = repository.create.mock.calls[0][0];
      expect(createdTransaction.reference).toMatch(/^TXN-\d+-[A-Z0-9]+$/);
    });

    it('should set status to PENDING by default', async () => {
      repository.create.mockReturnValue(mockTransaction as any);
      repository.save.mockResolvedValue(mockTransaction as any);

      await service.create(createDto);

      const createdTransaction = repository.create.mock.calls[0][0];
      expect(createdTransaction.status).toBe(TransactionStatus.PENDING);
    });
  });

  describe('findAll', () => {
    it('should return array of transactions', async () => {
      repository.find.mockResolvedValue([mockTransaction] as any);

      const result = await service.findAll();

      expect(result).toEqual([mockTransaction]);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should filter by user_id when provided', async () => {
      repository.find.mockResolvedValue([mockTransaction] as any);

      await service.findAll('user-uuid-123');

      expect(repository.find).toHaveBeenCalledWith({
        where: { user_id: 'user-uuid-123' },
        order: { created_at: 'DESC' },
      });
    });

    it('should filter by type when provided', async () => {
      repository.find.mockResolvedValue([mockTransaction] as any);

      await service.findAll(undefined, TransactionType.DEPOSIT);

      expect(repository.find).toHaveBeenCalledWith({
        where: { type: TransactionType.DEPOSIT },
        order: { created_at: 'DESC' },
      });
    });

    it('should filter by status when provided', async () => {
      repository.find.mockResolvedValue([mockTransaction] as any);

      await service.findAll(undefined, undefined, TransactionStatus.COMPLETED);

      expect(repository.find).toHaveBeenCalledWith({
        where: { status: TransactionStatus.COMPLETED },
        order: { created_at: 'DESC' },
      });
    });

    it('should apply multiple filters', async () => {
      repository.find.mockResolvedValue([mockTransaction] as any);

      await service.findAll('user-uuid-123', TransactionType.DEPOSIT, TransactionStatus.COMPLETED);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          user_id: 'user-uuid-123',
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
        },
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a transaction by uuid', async () => {
      repository.findOne.mockResolvedValue(mockTransaction as any);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockTransaction);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { uuid: '123e4567-e89b-12d3-a456-426614174000' },
      });
    });

    it('should throw NotFoundException if transaction not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      status: TransactionStatus.COMPLETED,
    };

    it('should successfully update a transaction', async () => {
      const updatedTransaction = { ...mockTransaction, ...updateDto };
      repository.findOne.mockResolvedValue(mockTransaction as any);
      repository.save.mockResolvedValue(updatedTransaction as any);

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateDto);

      expect(result.status).toBe(TransactionStatus.COMPLETED);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if transaction not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-uuid', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserBalance', () => {
    it('should calculate user balance from completed transactions', async () => {
      const mockBalance = { balance: '500' };
      const queryBuilder = repository.createQueryBuilder();
      (queryBuilder.getRawOne as jest.Mock).mockResolvedValue(mockBalance);

      const result = await service.getUserBalance('user-uuid-123');

      expect(result).toEqual({ balance: 500 });
      expect(queryBuilder.where).toHaveBeenCalledWith('transaction.user_id = :userId', {
        userId: 'user-uuid-123',
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('transaction.status = :status', {
        status: TransactionStatus.COMPLETED,
      });
    });

    it('should return 0 balance if no transactions found', async () => {
      const queryBuilder = repository.createQueryBuilder();
      (queryBuilder.getRawOne as jest.Mock).mockResolvedValue({ balance: null });

      const result = await service.getUserBalance('user-uuid-123');

      expect(result).toEqual({ balance: 0 });
    });

    it('should consider deposits as positive and withdrawals as negative', async () => {
      const mockBalance = { balance: '300' }; // deposits - withdrawals
      const queryBuilder = repository.createQueryBuilder();
      (queryBuilder.getRawOne as jest.Mock).mockResolvedValue(mockBalance);

      const result = await service.getUserBalance('user-uuid-123');

      expect(result.balance).toBe(300);
    });
  });
});
