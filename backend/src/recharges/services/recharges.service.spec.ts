import { Test, TestingModule } from '@nestjs/testing';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RechargesService } from './recharges.service';
import { RechargePackagesService } from './recharge-packages.service';
import { Recharge } from '../entities/recharge.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import {
  RechargeStatus,
  RechargeType,
  RechargeModality,
  GameOperator,
  TransactionType,
  TransactionStatus,
  UserRole,
} from '../../common/enums';

describe('RechargesService', () => {
  let service: RechargesService;
  let rechargeRepository: jest.Mocked<Repository<Recharge>>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let rechargePackagesService: jest.Mocked<RechargePackagesService>;
  let dataSource: jest.Mocked<DataSource>;

  const b2cUser = { uuid: 'user-uuid-123', role: UserRole.USER };
  const resellerUser = { uuid: 'reseller-uuid-456', role: UserRole.RESELLER };

  const mockPackage = {
    uuid: 'pkg-uuid-1',
    operator: GameOperator.FREE_FIRE,
    package: 'SMALL',
    type: RechargeType.DIAMONDS,
    name: '100 + 10 diamantes',
    b2c_price_ars: 1500,
    reseller_price_usd: 0.9,
    active: true,
  };

  const mockRecharge = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-uuid-123',
    type: RechargeType.DIAMONDS,
    operator: GameOperator.FREE_FIRE,
    package: 'SMALL',
    amount: 1500,
    fee: 0,
    total: 1500,
    status: RechargeStatus.PENDING,
    phone_number: 'PLAYER123',
    reference: 'RCH-1234567890-ABC',
    currency: 'ARS',
    modality: RechargeModality.DIRECT,
    paid_from_balance: false,
    created_at: new Date(),
  };

  let queryBuilderMock: any;
  let queryRunnerMock: any;

  beforeEach(async () => {
    queryBuilderMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getCount: jest.fn().mockResolvedValue(0),
      getRawOne: jest.fn().mockResolvedValue({ total: '0' }),
    };

    const mockRechargeRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
    };

    const mockTransactionRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const mockRechargePackagesService = {
      findForPurchase: jest.fn().mockResolvedValue(mockPackage),
    };

    queryRunnerMock = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn((_entity, data) => data),
        increment: jest.fn(),
      },
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RechargesService,
        { provide: getRepositoryToken(Recharge), useValue: mockRechargeRepository },
        { provide: getRepositoryToken(Transaction), useValue: mockTransactionRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: RechargePackagesService, useValue: mockRechargePackagesService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<RechargesService>(RechargesService);
    rechargeRepository = module.get(getRepositoryToken(Recharge));
    transactionRepository = module.get(getRepositoryToken(Transaction));
    userRepository = module.get(getRepositoryToken(User));
    rechargePackagesService = module.get(RechargePackagesService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create (B2C, priced from the catalog)', () => {
    const createDto = {
      user_id: 'someone-else', // must be ignored: owner always comes from the JWT user
      type: RechargeType.DIAMONDS,
      operator: GameOperator.FREE_FIRE,
      package: 'SMALL',
      phone_number: 'PLAYER123',
    };

    it('should successfully create a recharge with transaction', async () => {
      const queryRunner = dataSource.createQueryRunner();
      rechargeRepository.create.mockReturnValue(mockRecharge as any);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockRecharge);

      const result = await service.create(createDto as any, b2cUser);

      expect(result).toBeDefined();
      expect(rechargePackagesService.findForPurchase).toHaveBeenCalledWith(
        GameOperator.FREE_FIRE,
        'SMALL',
      );
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should price from the catalog (ARS) with no fee, and never touch balance', async () => {
      const queryRunner = dataSource.createQueryRunner();
      rechargeRepository.create.mockReturnValue(mockRecharge as any);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockRecharge);

      await service.create(createDto as any, b2cUser);

      const createdRecharge = rechargeRepository.create.mock.calls[0][0] as any;
      expect(createdRecharge.amount).toBe(mockPackage.b2c_price_ars);
      expect(createdRecharge.total).toBe(mockPackage.b2c_price_ars);
      expect(createdRecharge.fee).toBe(0);
      expect(createdRecharge.currency).toBe('ARS');
      expect(createdRecharge.paid_from_balance).toBe(false);
      expect(queryRunner.manager.findOne).not.toHaveBeenCalled();
    });

    it('should always own the order as the authenticated user, ignoring the body user_id', async () => {
      const queryRunner = dataSource.createQueryRunner();
      rechargeRepository.create.mockReturnValue(mockRecharge as any);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockRecharge);

      await service.create(createDto as any, b2cUser);

      const createdRecharge = rechargeRepository.create.mock.calls[0][0] as any;
      expect(createdRecharge.user_id).toBe(b2cUser.uuid);
    });

    it('should force DIRECT modality regardless of what was requested', async () => {
      const queryRunner = dataSource.createQueryRunner();
      rechargeRepository.create.mockReturnValue(mockRecharge as any);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockRecharge);

      await service.create({ ...createDto, modality: RechargeModality.GIFT_CARD } as any, b2cUser);

      const createdRecharge = rechargeRepository.create.mock.calls[0][0] as any;
      expect(createdRecharge.modality).toBe(RechargeModality.DIRECT);
    });

    it('should generate unique reference', async () => {
      const queryRunner = dataSource.createQueryRunner();
      rechargeRepository.create.mockReturnValue(mockRecharge as any);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockRecharge);

      await service.create(createDto as any, b2cUser);

      const createdRecharge = rechargeRepository.create.mock.calls[0][0] as any;
      expect(createdRecharge.reference).toMatch(/^RCH-\d+-[a-z0-9]+$/);
    });

    it('should rollback transaction on error', async () => {
      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.manager.save as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.create(createDto as any, b2cUser)).rejects.toThrow();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should throw BadRequestException when the (operator, package) has no catalog entry', async () => {
      rechargePackagesService.findForPurchase.mockResolvedValue(null);

      await expect(service.create(createDto as any, b2cUser)).rejects.toThrow(BadRequestException);
      expect(dataSource.createQueryRunner).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the package type does not match the requested type', async () => {
      rechargePackagesService.findForPurchase.mockResolvedValue({
        ...mockPackage,
        type: RechargeType.PB_CARD,
      } as any);

      await expect(
        service.create({ ...createDto, type: RechargeType.DIAMONDS } as any, b2cUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create (reseller, paid from balance)', () => {
    const createDto = {
      type: RechargeType.DIAMONDS,
      operator: GameOperator.FREE_FIRE,
      package: 'SMALL',
      phone_number: 'PLAYER123',
      modality: RechargeModality.GIFT_CARD,
    };

    it('should debit the balance and record a completed PURCHASE transaction', async () => {
      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.manager.findOne as jest.Mock).mockResolvedValue({
        uuid: resellerUser.uuid,
        balance: 100,
      });
      rechargeRepository.create.mockImplementation((data) => data as any);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockRecharge);

      await service.create(createDto as any, resellerUser);

      expect(queryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          uuid: resellerUser.uuid,
          balance: 100 - mockPackage.reseller_price_usd,
        }),
      );
      const createdRecharge = rechargeRepository.create.mock.calls[0][0] as any;
      expect(createdRecharge.fee).toBe(0);
      expect(createdRecharge.total).toBe(mockPackage.reseller_price_usd);
      expect(createdRecharge.currency).toBe('USD');
      expect(createdRecharge.paid_from_balance).toBe(true);
      expect(createdRecharge.modality).toBe(RechargeModality.GIFT_CARD);
      expect(queryRunner.manager.create).toHaveBeenCalledWith(
        Transaction,
        expect.objectContaining({
          user_id: resellerUser.uuid,
          type: TransactionType.PURCHASE,
          status: TransactionStatus.COMPLETED,
          amount: mockPackage.reseller_price_usd,
          currency: 'USD',
        }),
      );
    });

    it('should throw BadRequestException if balance is insufficient', async () => {
      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.manager.findOne as jest.Mock).mockResolvedValue({
        uuid: resellerUser.uuid,
        balance: 0.1,
      });

      await expect(service.create(createDto as any, resellerUser)).rejects.toThrow(
        BadRequestException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if the acting user no longer exists', async () => {
      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.create(createDto as any, resellerUser)).rejects.toThrow(NotFoundException);
    });
  });

  /** Refund = REFUND transaction + atomic balance increment, in one DB transaction. */
  const expectRefundOf40 = () => {
    expect(queryRunnerMock.manager.save).toHaveBeenCalledWith(
      expect.objectContaining({ type: TransactionType.REFUND, amount: 40 }),
    );
    expect(queryRunnerMock.manager.increment).toHaveBeenCalledWith(
      User,
      { uuid: mockRecharge.user_id },
      'balance',
      40,
    );
    expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
  };

  describe('findAll', () => {
    it('should return paginated recharges', async () => {
      const queryBuilder = rechargeRepository.createQueryBuilder();
      (queryBuilder.getManyAndCount as jest.Mock).mockResolvedValue([[mockRecharge], 1]);

      const result = await service.findAll({});

      expect(result).toEqual({ data: [mockRecharge], total: 1, page: 1, limit: 20 });
    });

    it('should apply filters when provided', async () => {
      const queryBuilder = rechargeRepository.createQueryBuilder();

      await service.findAll({ user_id: 'user-uuid-123', status: RechargeStatus.COMPLETED });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('recharge.user_id = :user_id', {
        user_id: 'user-uuid-123',
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('recharge.status = :status', {
        status: RechargeStatus.COMPLETED,
      });
    });
  });

  describe('findOne', () => {
    it('should return a recharge by uuid', async () => {
      rechargeRepository.findOne.mockResolvedValue(mockRecharge as any);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockRecharge);
    });

    it('should throw NotFoundException if recharge not found', async () => {
      rechargeRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a recharge status', async () => {
      rechargeRepository.findOne.mockResolvedValue({ ...mockRecharge } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);

      const result: any = await service.update('123e4567-e89b-12d3-a456-426614174000', {
        status: RechargeStatus.FAILED,
      });

      expect(result.status).toBe(RechargeStatus.FAILED);
      expect(transactionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if recharge not found', async () => {
      rechargeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-uuid', { status: RechargeStatus.COMPLETED }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should record a PURCHASE transaction the first time a B2C recharge completes', async () => {
      rechargeRepository.findOne.mockResolvedValue({ ...mockRecharge } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);
      transactionRepository.create.mockImplementation((t) => t as any);
      transactionRepository.save.mockImplementation(async (t) => t as any);

      const result: any = await service.update('123e4567-e89b-12d3-a456-426614174000', {
        status: RechargeStatus.COMPLETED,
      });

      expect(result.completed_at).toBeInstanceOf(Date);
      expect(transactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockRecharge.user_id,
          type: TransactionType.PURCHASE,
          status: TransactionStatus.COMPLETED,
          amount: mockRecharge.total,
        }),
      );
      expect(transactionRepository.save).toHaveBeenCalled();
    });

    it('should not duplicate the transaction if already COMPLETED', async () => {
      rechargeRepository.findOne.mockResolvedValue({
        ...mockRecharge,
        status: RechargeStatus.COMPLETED,
      } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);

      await service.update('123e4567-e89b-12d3-a456-426614174000', {
        status: RechargeStatus.COMPLETED,
      });

      expect(transactionRepository.create).not.toHaveBeenCalled();
    });

    it('should not create a purchase transaction when completing a reseller order already paid from balance', async () => {
      rechargeRepository.findOne.mockResolvedValue({
        ...mockRecharge,
        paid_from_balance: true,
      } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);

      await service.update('123e4567-e89b-12d3-a456-426614174000', {
        status: RechargeStatus.COMPLETED,
      });

      expect(transactionRepository.create).not.toHaveBeenCalled();
    });

    it('should refund the balance when a balance-paid order ends up FAILED', async () => {
      rechargeRepository.findOne.mockResolvedValue({
        ...mockRecharge,
        paid_from_balance: true,
        total: 40,
      } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);
      transactionRepository.create.mockImplementation((t) => t as any);
      transactionRepository.save.mockImplementation(async (t) => t as any);

      await service.update('123e4567-e89b-12d3-a456-426614174000', {
        status: RechargeStatus.FAILED,
      });

      expectRefundOf40();
    });
  });

  describe('markPaidByProvider', () => {
    it('should store the provider reference/payload and move the recharge to PROCESSING, booking the revenue', async () => {
      rechargeRepository.findOne.mockResolvedValue({ ...mockRecharge } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);
      transactionRepository.create.mockImplementation((t) => t as any);
      transactionRepository.save.mockImplementation(async (t) => t as any);

      const mpPayment = { id: 123456789, status: 'approved' };

      const result: any = await service.markPaidByProvider(
        mockRecharge.uuid,
        '123456789',
        mpPayment,
      );

      expect(rechargeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ provider_reference: '123456789', provider_response: mpPayment }),
      );
      expect(result.status).toBe(RechargeStatus.PROCESSING);
      expect(result.completed_at).toBeUndefined();
      expect(transactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: TransactionType.PURCHASE, amount: mockRecharge.total }),
      );
    });

    it('should be idempotent when Mercado Pago retries the same approved webhook', async () => {
      rechargeRepository.findOne.mockResolvedValue({
        ...mockRecharge,
        status: RechargeStatus.PROCESSING,
      } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);

      await service.markPaidByProvider(mockRecharge.uuid, '123456789', { id: 123456789 });

      expect(transactionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if the recharge does not exist', async () => {
      rechargeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markPaidByProvider('non-existent-uuid', '123', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySupplierOrderId / recordSupplierOrder / completeFromSupplier / failFromSupplier', () => {
    it('should find a recharge by its supplier order id', async () => {
      rechargeRepository.findOne.mockResolvedValue(mockRecharge as any);

      const result = await service.findBySupplierOrderId('fzr-order-1');

      expect(rechargeRepository.findOne).toHaveBeenCalledWith({
        where: { supplier_order_id: 'fzr-order-1' },
      });
      expect(result).toEqual(mockRecharge);
    });

    it('should record the supplier order without changing status', async () => {
      rechargeRepository.findOne.mockResolvedValue({
        ...mockRecharge,
        status: RechargeStatus.PROCESSING,
      } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);

      const result: any = await service.recordSupplierOrder(mockRecharge.uuid, 'fzr-order-1', {
        id: 'fzr-order-1',
      });

      expect(result.supplier_order_id).toBe('fzr-order-1');
      expect(result.status).toBe(RechargeStatus.PROCESSING);
    });

    it('should complete a recharge once the supplier confirms delivery, without double-booking revenue', async () => {
      rechargeRepository.findOne.mockResolvedValue({
        ...mockRecharge,
        status: RechargeStatus.PROCESSING,
      } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);

      const result: any = await service.completeFromSupplier(mockRecharge.uuid, 'fzr-order-1', {
        status: 'completed',
      });

      expect(result.status).toBe(RechargeStatus.COMPLETED);
      expect(result.completed_at).toBeInstanceOf(Date);
      expect(transactionRepository.create).not.toHaveBeenCalled();
    });

    it('should fail a recharge when the supplier rejects/refunds the order', async () => {
      rechargeRepository.findOne.mockResolvedValue({
        ...mockRecharge,
        status: RechargeStatus.PROCESSING,
      } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);

      const result: any = await service.failFromSupplier(mockRecharge.uuid, 'fzr-order-1', {
        status: 'refunded',
      });

      expect(result.status).toBe(RechargeStatus.FAILED);
    });
  });

  describe('markFailedByProvider', () => {
    it('should store the provider reference/payload and fail the recharge', async () => {
      rechargeRepository.findOne.mockResolvedValue({ ...mockRecharge } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);

      const mpPayment = { id: 999, status: 'rejected' };

      const result: any = await service.markFailedByProvider(mockRecharge.uuid, '999', mpPayment);

      expect(rechargeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ provider_reference: '999', provider_response: mpPayment }),
      );
      expect(result.status).toBe(RechargeStatus.FAILED);
    });

    it('should refund the balance if the failed order had been paid from it', async () => {
      rechargeRepository.findOne.mockResolvedValue({
        ...mockRecharge,
        paid_from_balance: true,
        total: 40,
      } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);
      transactionRepository.create.mockImplementation((t) => t as any);
      transactionRepository.save.mockImplementation(async (t) => t as any);

      await service.markFailedByProvider(mockRecharge.uuid, '999', { id: 999 });

      expectRefundOf40();
    });
  });

  describe('getStats', () => {
    it('should return recharge statistics', async () => {
      const result = await service.getStats();

      expect(result).toEqual({
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        todayTotal: 0,
        todayPending: 0,
        todayAmount: 0,
      });
    });
  });

  describe('cancelByUser', () => {
    it('should cancel a pending recharge owned by the user', async () => {
      rechargeRepository.findOne.mockResolvedValue({ ...mockRecharge } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);

      const result: any = await service.cancelByUser(mockRecharge.uuid, mockRecharge.user_id);

      expect(result.status).toBe(RechargeStatus.CANCELLED);
    });

    it('should throw NotFoundException if recharge belongs to another user', async () => {
      rechargeRepository.findOne.mockResolvedValue({ ...mockRecharge } as any);

      await expect(service.cancelByUser(mockRecharge.uuid, 'other-user')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if recharge is not PENDING', async () => {
      rechargeRepository.findOne.mockResolvedValue({
        ...mockRecharge,
        status: RechargeStatus.COMPLETED,
      } as any);

      await expect(
        service.cancelByUser(mockRecharge.uuid, mockRecharge.user_id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if more than 10 minutes have passed', async () => {
      const oldDate = new Date(Date.now() - 11 * 60 * 1000);
      rechargeRepository.findOne.mockResolvedValue({
        ...mockRecharge,
        created_at: oldDate,
      } as any);

      await expect(
        service.cancelByUser(mockRecharge.uuid, mockRecharge.user_id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should refund the balance when cancelling an order paid from it', async () => {
      rechargeRepository.findOne.mockResolvedValue({
        ...mockRecharge,
        paid_from_balance: true,
        total: 40,
      } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);
      transactionRepository.create.mockImplementation((t) => t as any);
      transactionRepository.save.mockImplementation(async (t) => t as any);

      await service.cancelByUser(mockRecharge.uuid, mockRecharge.user_id);

      expectRefundOf40();
    });

    it('should not credit the balance twice if the order was already refunded (concurrent cancel)', async () => {
      rechargeRepository.findOne.mockResolvedValue({
        ...mockRecharge,
        paid_from_balance: true,
        total: 40,
      } as any);
      rechargeRepository.save.mockImplementation(async (r) => r as any);
      // The REFUND transaction for this recharge already exists: unique
      // constraint on `reference` rejects the second insert.
      queryRunnerMock.manager.save.mockRejectedValueOnce({ code: '23505' });

      await service.cancelByUser(mockRecharge.uuid, mockRecharge.user_id);

      expect(queryRunnerMock.manager.increment).not.toHaveBeenCalled();
      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
