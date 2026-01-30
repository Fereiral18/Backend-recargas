import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from '../services/transactions.service';
import { TransactionType, TransactionStatus } from '../../common/enums';

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
    description: 'Test deposit',
  };

  const mockRequest = {
    user: {
      uuid: 'user-uuid-123',
      role: 'USER',
    },
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      getUserBalance: jest.fn(),
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
      description: 'Test deposit',
    };

    it('should create a transaction', async () => {
      service.create.mockResolvedValue(mockTransaction as any);

      const result = await controller.create(createDto);

      expect(result).toEqual({
        message: 'Transaction created successfully',
        data: mockTransaction,
      });
    });
  });

  describe('findAll', () => {
    it('should return all transactions for admin', async () => {
      service.findAll.mockResolvedValue([mockTransaction] as any);

      const result = await controller.findAll(undefined, undefined, undefined, {
        user: { role: 'ADMIN' },
      } as any);

      expect(result.data).toEqual([mockTransaction]);
    });

    it('should filter user transactions for regular user', async () => {
      service.findAll.mockResolvedValue([mockTransaction] as any);

      await controller.findAll(undefined, undefined, undefined, mockRequest as any);

      expect(service.findAll).toHaveBeenCalledWith('user-uuid-123', undefined, undefined);
    });
  });

  describe('getBalance', () => {
    it('should return user balance', async () => {
      service.getUserBalance.mockResolvedValue({ balance: 500 } as any);

      const result = await controller.getBalance('user-uuid-123');

      expect(result).toEqual({
        message: 'Balance retrieved successfully',
        data: { balance: 500 },
      });
    });
  });
});
