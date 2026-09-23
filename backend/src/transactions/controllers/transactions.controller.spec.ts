import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from '../services/transactions.service';
import { TransactionType, TransactionStatus, UserRole } from '../../common/enums';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: jest.Mocked<TransactionsService>;

  const mockTransaction = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-uuid-123',
    type: TransactionType.DEPOSIT,
    amount: 100,
    status: TransactionStatus.COMPLETED,
    reference: 'TXN-1234567890-ABC',
  };

  const ownerReq = { user: { uuid: 'user-uuid-123', role: UserRole.USER } } as any;
  const otherUserReq = { user: { uuid: 'someone-else', role: UserRole.USER } } as any;
  const adminReq = { user: { uuid: 'admin-uuid', role: UserRole.ADMIN } } as any;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      getStats: jest.fn(),
      getUserBalance: jest.fn(),
      getRevenueStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [{ provide: TransactionsService, useValue: mockService }],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      user_id: 'user-uuid-123',
      type: TransactionType.DEPOSIT,
      amount: 100,
    };

    it('should create a transaction when called by an admin', async () => {
      service.create.mockResolvedValue(mockTransaction as any);

      const result = await controller.create(createDto as any, adminReq);

      expect(result).toEqual(mockTransaction);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should reject a non-admin trying to create a transaction', () => {
      expect(() => controller.create(createDto as any, ownerReq)).toThrow(ForbiddenException);
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('forces a non-admin to only see their own transactions regardless of the user_id query param', async () => {
      service.findAll.mockResolvedValue({ data: [mockTransaction], total: 1, page: 1, limit: 20 } as any);

      const result = await controller.findAll(ownerReq, 'someone-else', undefined, undefined);

      expect(result).toEqual({ data: [mockTransaction], total: 1, page: 1, limit: 20 });
      expect(service.findAll).toHaveBeenCalledWith({
        user_id: 'user-uuid-123',
        type: undefined,
        status: undefined,
        page: undefined,
        limit: undefined,
      });
    });

    it('lets an admin filter by any user_id', async () => {
      service.findAll.mockResolvedValue({ data: [mockTransaction], total: 1, page: 1, limit: 20 } as any);

      await controller.findAll(adminReq, 'someone-else', undefined, undefined);

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'someone-else' }),
      );
    });
  });

  describe('getStats', () => {
    it('forces a non-admin to only see their own stats', async () => {
      const mockStats = { total: 5, pending: 1, completed: 4 };
      service.getStats.mockResolvedValue(mockStats as any);

      const result = await controller.getStats(ownerReq, 'someone-else');

      expect(result).toEqual(mockStats);
      expect(service.getStats).toHaveBeenCalledWith('user-uuid-123');
    });
  });

  describe('getRevenueStats', () => {
    it('returns the revenue summary for an admin', async () => {
      const mockRevenue = {
        b2c: { currency: 'ARS', gross: 7500, refunded: 0, net: 7500, count: 5 },
        reseller: { currency: 'USD', gross: 4.5, refunded: 0.9, net: 3.6, count: 5 },
      };
      service.getRevenueStats.mockResolvedValue(mockRevenue as any);

      const result = await controller.getRevenueStats(adminReq);

      expect(result).toEqual(mockRevenue);
    });

    it('rejects a non-admin', () => {
      expect(() => controller.getRevenueStats(ownerReq)).toThrow(ForbiddenException);
      expect(service.getRevenueStats).not.toHaveBeenCalled();
    });
  });

  describe('getUserBalance', () => {
    const mockBalance = {
      user_id: 'user-uuid-123',
      total_balance: 500,
      total_deposits: 500,
      total_withdrawals: 0,
      total_purchases: 0,
      total_transactions: 1,
    };

    it('returns the balance summary for the owner', async () => {
      service.getUserBalance.mockResolvedValue(mockBalance as any);

      const result = await controller.getUserBalance('user-uuid-123', ownerReq);

      expect(result).toEqual(mockBalance);
      expect(service.getUserBalance).toHaveBeenCalledWith('user-uuid-123');
    });

    it('rejects a non-owner, non-admin request for someone else\'s balance', () => {
      expect(() => controller.getUserBalance('user-uuid-123', otherUserReq)).toThrow(ForbiddenException);
    });

    it('lets an admin see anyone\'s balance', async () => {
      service.getUserBalance.mockResolvedValue(mockBalance as any);

      const result = await controller.getUserBalance('user-uuid-123', adminReq);

      expect(result).toEqual(mockBalance);
    });
  });

  describe('findOne', () => {
    it('returns the transaction to its owner', async () => {
      service.findOne.mockResolvedValue(mockTransaction as any);

      const result = await controller.findOne('123e4567-e89b-12d3-a456-426614174000', ownerReq);

      expect(result).toEqual(mockTransaction);
    });

    it('rejects a non-owner, non-admin request', async () => {
      service.findOne.mockResolvedValue(mockTransaction as any);

      await expect(
        controller.findOne('123e4567-e89b-12d3-a456-426614174000', otherUserReq),
      ).rejects.toThrow(ForbiddenException);
    });

    it('lets an admin view any transaction', async () => {
      service.findOne.mockResolvedValue(mockTransaction as any);

      const result = await controller.findOne('123e4567-e89b-12d3-a456-426614174000', adminReq);

      expect(result).toEqual(mockTransaction);
    });
  });

  describe('update', () => {
    it('updates a transaction when called by an admin', async () => {
      const updateDto = { status: TransactionStatus.COMPLETED };
      const updated = { ...mockTransaction, ...updateDto };
      service.update.mockResolvedValue(updated as any);

      const result = await controller.update('123e4567-e89b-12d3-a456-426614174000', updateDto, adminReq);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000', updateDto);
    });

    it('rejects a non-admin trying to update a transaction', () => {
      const updateDto = { status: TransactionStatus.COMPLETED };

      expect(() =>
        controller.update('123e4567-e89b-12d3-a456-426614174000', updateDto, ownerReq),
      ).toThrow(ForbiddenException);
      expect(service.update).not.toHaveBeenCalled();
    });
  });
});
