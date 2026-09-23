import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { RechargesController } from './recharges.controller';
import { RechargesService } from '../services/recharges.service';
import { SupplierFulfillmentService } from '../../supplier/services/supplier-fulfillment.service';
import { RechargeStatus, RechargeType, GameOperator, UserRole } from '../../common/enums';

describe('RechargesController', () => {
  let controller: RechargesController;
  let service: jest.Mocked<RechargesService>;
  let supplierFulfillmentService: jest.Mocked<SupplierFulfillmentService>;

  const mockRecharge = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-uuid-123',
    type: RechargeType.DIAMONDS,
    operator: GameOperator.FREE_FIRE,
    amount: 100,
    fee: 5,
    total: 100,
    status: RechargeStatus.PENDING,
    phone_number: 'PLAYER123',
    reference: 'RCH-1234567890-ABC',
    paid_from_balance: false,
  };

  const admin = { uuid: 'admin-uuid', role: UserRole.ADMIN };
  const regularUser = { uuid: 'user-uuid-123', role: UserRole.USER };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      getStats: jest.fn(),
      cancelByUser: jest.fn(),
    };

    const mockSupplierFulfillmentService = {
      fulfillRecharge: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RechargesController],
      providers: [
        { provide: RechargesService, useValue: mockService },
        { provide: SupplierFulfillmentService, useValue: mockSupplierFulfillmentService },
      ],
    }).compile();

    controller = module.get<RechargesController>(RechargesController);
    service = module.get(RechargesService);
    supplierFulfillmentService = module.get(SupplierFulfillmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      type: RechargeType.DIAMONDS,
      operator: GameOperator.FREE_FIRE,
      amount: 100,
      phone_number: 'PLAYER123',
    };
    const currentUser = { uuid: 'user-uuid-123', role: UserRole.USER };

    it('should create a B2C recharge without triggering supplier fulfillment', async () => {
      service.create.mockResolvedValue(mockRecharge as any);

      const result = await controller.create(createDto as any, currentUser);

      expect(result).toEqual(mockRecharge);
      expect(service.create).toHaveBeenCalledWith(createDto, currentUser);
      expect(service.update).not.toHaveBeenCalled();
      expect(supplierFulfillmentService.fulfillRecharge).not.toHaveBeenCalled();
    });

    it('should auto-fulfill a reseller order paid from balance (their real limit is FZR balance, not manual approval)', async () => {
      const resellerRecharge = { ...mockRecharge, paid_from_balance: true };
      const processing = { ...resellerRecharge, status: RechargeStatus.PROCESSING };
      const completed = { ...processing, status: RechargeStatus.COMPLETED, supplier_order_id: 'fzr-1' };

      service.create.mockResolvedValue(resellerRecharge as any);
      service.update.mockResolvedValue(processing as any);
      supplierFulfillmentService.fulfillRecharge.mockResolvedValue(completed as any);

      const result = await controller.create(createDto as any, currentUser);

      expect(service.update).toHaveBeenCalledWith(resellerRecharge.uuid, {
        status: RechargeStatus.PROCESSING,
      });
      expect(supplierFulfillmentService.fulfillRecharge).toHaveBeenCalledWith(resellerRecharge.uuid);
      expect(result).toEqual(completed);
    });

    it('should leave a reseller order in PROCESSING (not throw) if supplier fulfillment fails', async () => {
      const resellerRecharge = { ...mockRecharge, paid_from_balance: true };
      const processing = { ...resellerRecharge, status: RechargeStatus.PROCESSING };

      service.create.mockResolvedValue(resellerRecharge as any);
      service.update.mockResolvedValue(processing as any);
      supplierFulfillmentService.fulfillRecharge.mockRejectedValue(new Error('sin mapeo configurado'));

      const result = await controller.create(createDto as any, currentUser);

      expect(result).toEqual(processing);
    });
  });

  describe('findAll', () => {
    it('should forward query filters to the service for an admin', async () => {
      service.findAll.mockResolvedValue({ data: [mockRecharge], total: 1, page: 1, limit: 20 } as any);

      const result = await controller.findAll(admin, 'user-uuid-123', undefined, 'PENDING');

      expect(result).toEqual({ data: [mockRecharge], total: 1, page: 1, limit: 20 });
      expect(service.findAll).toHaveBeenCalledWith({
        user_id: 'user-uuid-123',
        operator: undefined,
        status: 'PENDING',
        search: undefined,
        page: undefined,
        limit: undefined,
      });
    });

    it('should force user_id to the caller for a non-admin, ignoring any user_id in the query', async () => {
      service.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await controller.findAll(regularUser, 'someone-elses-uuid');

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: regularUser.uuid }),
      );
    });

    it('should force user_id to the caller for a non-admin who sends no user_id at all', async () => {
      service.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await controller.findAll(regularUser);

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: regularUser.uuid }),
      );
    });
  });

  describe('findOne', () => {
    it('should let the owner view their own recharge', async () => {
      service.findOne.mockResolvedValue(mockRecharge as any);

      const result = await controller.findOne(mockRecharge.uuid, {
        uuid: mockRecharge.user_id,
        role: UserRole.USER,
      });

      expect(result).toEqual(mockRecharge);
    });

    it('should let an admin view any recharge', async () => {
      service.findOne.mockResolvedValue(mockRecharge as any);

      const result = await controller.findOne(mockRecharge.uuid, admin);

      expect(result).toEqual(mockRecharge);
    });

    it('should reject a user who does not own the recharge', async () => {
      service.findOne.mockResolvedValue(mockRecharge as any);

      await expect(
        controller.findOne(mockRecharge.uuid, { uuid: 'stranger-uuid', role: UserRole.USER }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should let an admin update a reseller order (paid from balance) to any status', async () => {
      const resellerRecharge = { ...mockRecharge, paid_from_balance: true };
      const updateDto = { status: RechargeStatus.COMPLETED };
      service.findOne.mockResolvedValue(resellerRecharge as any);
      service.update.mockResolvedValue({ ...resellerRecharge, ...updateDto } as any);

      const result = await controller.update(mockRecharge.uuid, updateDto, admin);

      expect(result).toEqual({ ...resellerRecharge, ...updateDto });
      expect(service.update).toHaveBeenCalledWith(mockRecharge.uuid, updateDto);
    });

    it('should let an admin cancel/fail a B2C order manually as an escape hatch', async () => {
      service.findOne.mockResolvedValue({ ...mockRecharge } as any);
      const updateDto = { status: RechargeStatus.FAILED };
      service.update.mockResolvedValue({ ...mockRecharge, ...updateDto } as any);

      await controller.update(mockRecharge.uuid, updateDto, admin);

      expect(service.update).toHaveBeenCalledWith(mockRecharge.uuid, updateDto);
    });

    it('should reject a non-admin trying to update a recharge', async () => {
      await expect(
        controller.update(mockRecharge.uuid, { status: RechargeStatus.COMPLETED }, regularUser),
      ).rejects.toThrow(ForbiddenException);
      expect(service.update).not.toHaveBeenCalled();
    });

    it('should reject an admin manually completing a B2C order (must go through Mercado Pago + supplier)', async () => {
      service.findOne.mockResolvedValue({ ...mockRecharge } as any);

      await expect(
        controller.update(mockRecharge.uuid, { status: RechargeStatus.COMPLETED }, admin),
      ).rejects.toThrow(BadRequestException);
      expect(service.update).not.toHaveBeenCalled();
    });

    it('should reject an admin manually moving a B2C order to PROCESSING', async () => {
      service.findOne.mockResolvedValue({ ...mockRecharge } as any);

      await expect(
        controller.update(mockRecharge.uuid, { status: RechargeStatus.PROCESSING }, admin),
      ).rejects.toThrow(BadRequestException);
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should forward the user_id filter to the service for an admin', async () => {
      const mockStats = { total: 10, completed: 7, pending: 2, failed: 1 };
      service.getStats.mockResolvedValue(mockStats as any);

      const result = await controller.getStats(admin, 'user-uuid-123');

      expect(result).toEqual(mockStats);
      expect(service.getStats).toHaveBeenCalledWith('user-uuid-123');
    });

    it('should force the stats to the caller for a non-admin', async () => {
      service.getStats.mockResolvedValue({} as any);

      await controller.getStats(regularUser, 'someone-elses-uuid');

      expect(service.getStats).toHaveBeenCalledWith(regularUser.uuid);
    });
  });

  describe('cancelByUser', () => {
    it('should cancel the recharge for the current user', async () => {
      const cancelled = { ...mockRecharge, status: RechargeStatus.CANCELLED };
      service.cancelByUser.mockResolvedValue(cancelled as any);

      const result = await controller.cancelByUser('123e4567-e89b-12d3-a456-426614174000', {
        uuid: 'user-uuid-123',
        role: UserRole.USER,
      });

      expect(result).toEqual(cancelled);
      expect(service.cancelByUser).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        'user-uuid-123',
      );
    });
  });
});
