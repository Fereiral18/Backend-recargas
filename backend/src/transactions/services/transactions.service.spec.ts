import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from '../entities/transaction.entity';
import { TransactionType, TransactionStatus } from '../../common/enums';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: jest.Mocked<Repository<Transaction>>;

  const mockTransaction = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-uuid-123',
    type: TransactionType.DEPOSIT,
    amount: 100,
    fee: 0,
    net_amount: 100,
    status: TransactionStatus.PENDING,
    reference: 'TXN-1234567890-ABC',
    currency: 'USD',
    created_at: new Date(),
  };

  let queryBuilderMock: any;

  beforeEach(async () => {
    queryBuilderMock = {
      select: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getCount: jest.fn().mockResolvedValue(0),
      getRawMany: jest.fn().mockResolvedValue([]),
    };

    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
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
    };

    it('should successfully create a transaction', async () => {
      repository.create.mockReturnValue(mockTransaction as any);
      repository.save.mockResolvedValue(mockTransaction as any);

      const result = await service.create(createDto as any);

      expect(result).toEqual(mockTransaction);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should generate a unique reference', async () => {
      repository.create.mockReturnValue(mockTransaction as any);
      repository.save.mockResolvedValue(mockTransaction as any);

      await service.create(createDto as any);

      const created = repository.create.mock.calls[0][0] as any;
      expect(created.reference).toMatch(/^TXN-\d+-[a-z0-9]+$/);
    });

    it('should set status to PENDING by default', async () => {
      repository.create.mockReturnValue(mockTransaction as any);
      repository.save.mockResolvedValue(mockTransaction as any);

      await service.create(createDto as any);

      const created = repository.create.mock.calls[0][0] as any;
      expect(created.status).toBe(TransactionStatus.PENDING);
    });

    it('should default currency to USD when not provided', async () => {
      repository.create.mockReturnValue(mockTransaction as any);
      repository.save.mockResolvedValue(mockTransaction as any);

      await service.create(createDto as any);

      const created = repository.create.mock.calls[0][0] as any;
      expect(created.currency).toBe('USD');
    });

    it('should compute net_amount as amount minus fee', async () => {
      repository.create.mockReturnValue(mockTransaction as any);
      repository.save.mockResolvedValue(mockTransaction as any);

      await service.create({ ...createDto, fee: 10 } as any);

      const created = repository.create.mock.calls[0][0] as any;
      expect(created.net_amount).toBe(90);
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions', async () => {
      queryBuilderMock.getManyAndCount.mockResolvedValue([[mockTransaction], 1]);

      const result = await service.findAll({});

      expect(result).toEqual({ data: [mockTransaction], total: 1, page: 1, limit: 20 });
    });

    it('should apply filters when provided', async () => {
      await service.findAll({ user_id: 'user-uuid-123', type: TransactionType.DEPOSIT });

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith('transaction.user_id = :user_id', {
        user_id: 'user-uuid-123',
      });
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith('transaction.type = :type', {
        type: TransactionType.DEPOSIT,
      });
    });
  });

  describe('findOne', () => {
    it('should return a transaction by uuid', async () => {
      repository.findOne.mockResolvedValue(mockTransaction as any);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should successfully update a transaction', async () => {
      repository.findOne.mockResolvedValue({ ...mockTransaction } as any);
      repository.save.mockImplementation(async (t) => t as any);

      const result: any = await service.update('123e4567-e89b-12d3-a456-426614174000', {
        status: TransactionStatus.COMPLETED,
      });

      expect(result.status).toBe(TransactionStatus.COMPLETED);
      expect(result.completed_at).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-uuid', { status: TransactionStatus.COMPLETED }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserBalance', () => {
    it('should sum completed transactions by type', async () => {
      repository.find.mockResolvedValue([
        { ...mockTransaction, type: TransactionType.DEPOSIT, net_amount: 500 },
        { ...mockTransaction, type: TransactionType.PURCHASE, net_amount: 120 },
        { ...mockTransaction, type: TransactionType.WITHDRAWAL, net_amount: 80 },
      ] as any);

      const result = await service.getUserBalance('user-uuid-123');

      expect(result).toEqual({
        user_id: 'user-uuid-123',
        total_balance: 500 - 80 - 120,
        total_deposits: 500,
        total_withdrawals: 80,
        total_purchases: 120,
        total_refunds: 0,
        total_fees: 0,
        total_transactions: 3,
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { user_id: 'user-uuid-123', status: TransactionStatus.COMPLETED },
      });
    });

    it('should return zeroed totals if no transactions found', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.getUserBalance('user-uuid-123');

      expect(result).toEqual({
        user_id: 'user-uuid-123',
        total_balance: 0,
        total_deposits: 0,
        total_withdrawals: 0,
        total_purchases: 0,
        total_refunds: 0,
        total_fees: 0,
        total_transactions: 0,
      });
    });

    it('should add refunds back and subtract fees (a failed reseller order that got refunded must not look like a permanent loss)', async () => {
      repository.find.mockResolvedValue([
        { ...mockTransaction, type: TransactionType.DEPOSIT, net_amount: 100 },
        { ...mockTransaction, type: TransactionType.PURCHASE, net_amount: 10 },
        { ...mockTransaction, type: TransactionType.REFUND, net_amount: 10 },
        { ...mockTransaction, type: TransactionType.FEE, net_amount: 2 },
      ] as any);

      const result = await service.getUserBalance('user-uuid-123');

      expect(result.total_refunds).toBe(10);
      expect(result.total_fees).toBe(2);
      expect(result.total_balance).toBe(100 - 10 + 10 - 2);
    });
  });

  describe('getStats', () => {
    it('should return total and pending/completed breakdown', async () => {
      queryBuilderMock.getCount.mockResolvedValueOnce(10).mockResolvedValueOnce(3);

      const result = await service.getStats();

      expect(result).toEqual({ total: 10, pending: 3, completed: 7 });
    });
  });

  describe('getRevenueStats', () => {
    it('splits revenue by currency (B2C=ARS, reseller=USD) and nets out refunds', async () => {
      queryBuilderMock.getRawMany.mockResolvedValue([
        { currency: 'ARS', type: TransactionType.PURCHASE, total: '7500.00', count: '5' },
        { currency: 'USD', type: TransactionType.PURCHASE, total: '4.50', count: '5' },
        { currency: 'USD', type: TransactionType.REFUND, total: '0.90', count: '1' },
      ]);

      const result = await service.getRevenueStats();

      expect(result).toEqual({
        b2c: { currency: 'ARS', gross: 7500, refunded: 0, net: 7500, count: 5 },
        reseller: { currency: 'USD', gross: 4.5, refunded: 0.9, net: 3.6, count: 5 },
      });
    });

    it('returns zeroed summaries when there are no transactions yet', async () => {
      queryBuilderMock.getRawMany.mockResolvedValue([]);

      const result = await service.getRevenueStats();

      expect(result).toEqual({
        b2c: { currency: 'ARS', gross: 0, refunded: 0, net: 0, count: 0 },
        reseller: { currency: 'USD', gross: 0, refunded: 0, net: 0, count: 0 },
      });
    });

    it('scopes the query to a period when from/to are given (e.g. a single month)', async () => {
      queryBuilderMock.getRawMany.mockResolvedValue([]);

      const from = new Date('2026-09-01T00:00:00.000Z');
      const to = new Date('2026-10-01T00:00:00.000Z');

      await service.getRevenueStats(from, to);

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith('t.created_at >= :from', { from });
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith('t.created_at < :to', { to });
    });
  });
});
