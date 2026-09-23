import { createHmac } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { MercadoPagoService } from '../services/mercado-pago.service';
import { RechargesService } from '../../recharges/services/recharges.service';
import { SupplierFulfillmentService } from '../../supplier/services/supplier-fulfillment.service';
import { RechargeStatus, RechargeType, GameOperator, UserRole } from '../../common/enums';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let mercadoPagoService: jest.Mocked<MercadoPagoService>;
  let rechargesService: jest.Mocked<RechargesService>;
  let supplierFulfillmentService: jest.Mocked<SupplierFulfillmentService>;
  let configService: jest.Mocked<ConfigService>;

  const mockRecharge = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-uuid-123',
    type: RechargeType.DIAMONDS,
    operator: GameOperator.FREE_FIRE,
    amount: 100,
    total: 100,
    status: RechargeStatus.PENDING,
    paid_from_balance: false,
  };

  const b2cUser = { uuid: 'user-uuid-123', role: UserRole.USER };
  const otherUser = { uuid: 'someone-else', role: UserRole.USER };
  const admin = { uuid: 'admin-uuid', role: UserRole.ADMIN };

  beforeEach(async () => {
    const mockMercadoPagoService = {
      createPreference: jest.fn(),
      getPayment: jest.fn(),
    };

    const mockRechargesService = {
      findOne: jest.fn(),
      markPaidByProvider: jest.fn(),
      markFailedByProvider: jest.fn(),
    };

    const mockSupplierFulfillmentService = {
      fulfillRecharge: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: MercadoPagoService, useValue: mockMercadoPagoService },
        { provide: RechargesService, useValue: mockRechargesService },
        { provide: SupplierFulfillmentService, useValue: mockSupplierFulfillmentService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    mercadoPagoService = module.get(MercadoPagoService);
    rechargesService = module.get(RechargesService);
    supplierFulfillmentService = module.get(SupplierFulfillmentService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPreference', () => {
    it('should create a preference for the owner of a pending B2C recharge', async () => {
      rechargesService.findOne.mockResolvedValue(mockRecharge as any);
      mercadoPagoService.createPreference.mockResolvedValue({
        preference_id: 'pref-1',
        init_point: 'https://mp/checkout/pref-1',
      } as any);

      const result = await controller.createPreference(mockRecharge.uuid, b2cUser);

      expect(result.data.init_point).toBe('https://mp/checkout/pref-1');
    });

    it('should allow an admin to generate the preference on behalf of the user', async () => {
      rechargesService.findOne.mockResolvedValue(mockRecharge as any);
      mercadoPagoService.createPreference.mockResolvedValue({ preference_id: 'pref-1' } as any);

      await expect(controller.createPreference(mockRecharge.uuid, admin)).resolves.toBeDefined();
    });

    it('should reject a user who does not own the recharge', async () => {
      rechargesService.findOne.mockResolvedValue(mockRecharge as any);

      await expect(controller.createPreference(mockRecharge.uuid, otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should reject a recharge that is not PENDING', async () => {
      rechargesService.findOne.mockResolvedValue({
        ...mockRecharge,
        status: RechargeStatus.COMPLETED,
      } as any);

      await expect(controller.createPreference(mockRecharge.uuid, b2cUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject a reseller order paid from balance, since Mercado Pago is B2C-only', async () => {
      rechargesService.findOne.mockResolvedValue({
        ...mockRecharge,
        paid_from_balance: true,
      } as any);

      await expect(controller.createPreference(mockRecharge.uuid, b2cUser)).rejects.toThrow(
        BadRequestException,
      );
      expect(mercadoPagoService.createPreference).not.toHaveBeenCalled();
    });
  });

  describe('handleWebhook', () => {
    const secret = 'test-secret';
    const dataId = '123456789';
    const xRequestId = 'req-abc-123';
    const ts = '1704908010';

    function sign(id: string, requestId: string, timestamp: string, key: string) {
      const manifest = `id:${id.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
      const v1 = createHmac('sha256', key).update(manifest).digest('hex');
      return `ts=${timestamp},v1=${v1}`;
    }

    it('should mark the recharge as paid on an approved payment with a valid signature', async () => {
      configService.get.mockReturnValue(secret);
      mercadoPagoService.getPayment.mockResolvedValue({
        id: 123456789,
        status: 'approved',
        external_reference: mockRecharge.uuid,
        transaction_amount: 100,
        currency_id: 'ARS',
      } as any);
      rechargesService.findOne.mockResolvedValue(mockRecharge as any);

      const xSignature = sign(dataId, xRequestId, ts, secret);

      await controller.handleWebhook(dataId, 'payment', xSignature, xRequestId, {});

      expect(rechargesService.markPaidByProvider).toHaveBeenCalledWith(
        mockRecharge.uuid,
        '123456789',
        expect.objectContaining({ status: 'approved' }),
      );
      expect(supplierFulfillmentService.fulfillRecharge).toHaveBeenCalledWith(mockRecharge.uuid);
    });

    it('should not fail the webhook if automatic supplier fulfillment errors out', async () => {
      configService.get.mockReturnValue(secret);
      mercadoPagoService.getPayment.mockResolvedValue({
        id: 123456789,
        status: 'approved',
        external_reference: mockRecharge.uuid,
        transaction_amount: 100,
        currency_id: 'ARS',
      } as any);
      rechargesService.findOne.mockResolvedValue(mockRecharge as any);
      supplierFulfillmentService.fulfillRecharge.mockRejectedValue(new Error('sin mapeo configurado'));

      const xSignature = sign(dataId, xRequestId, ts, secret);

      await expect(
        controller.handleWebhook(dataId, 'payment', xSignature, xRequestId, {}),
      ).resolves.toEqual({ received: true });
      expect(rechargesService.markPaidByProvider).toHaveBeenCalled();
    });

    it('should not attempt supplier fulfillment on a rejected/failed payment', async () => {
      configService.get.mockReturnValue(secret);
      mercadoPagoService.getPayment.mockResolvedValue({
        id: 999,
        status: 'rejected',
        external_reference: mockRecharge.uuid,
      } as any);

      const xSignature = sign('999', xRequestId, ts, secret);

      await controller.handleWebhook('999', 'payment', xSignature, xRequestId, {});

      expect(supplierFulfillmentService.fulfillRecharge).not.toHaveBeenCalled();
    });

    it('should reject a webhook with an invalid signature', async () => {
      configService.get.mockReturnValue(secret);

      await expect(
        controller.handleWebhook(dataId, 'payment', 'ts=1,v1=bogus', xRequestId, {}),
      ).rejects.toThrow(ForbiddenException);
      expect(mercadoPagoService.getPayment).not.toHaveBeenCalled();
    });

    it('should mark the recharge as failed on a rejected payment', async () => {
      configService.get.mockReturnValue(secret);
      mercadoPagoService.getPayment.mockResolvedValue({
        id: 999,
        status: 'rejected',
        external_reference: mockRecharge.uuid,
      } as any);

      const xSignature = sign('999', xRequestId, ts, secret);

      await controller.handleWebhook('999', 'payment', xSignature, xRequestId, {});

      expect(rechargesService.markFailedByProvider).toHaveBeenCalledWith(
        mockRecharge.uuid,
        '999',
        expect.objectContaining({ status: 'rejected' }),
      );
    });

    it('should ignore non-payment notification topics without erroring', async () => {
      const result = await controller.handleWebhook(undefined, 'merchant_order', undefined, undefined, {});

      expect(result).toEqual({ received: true });
      expect(mercadoPagoService.getPayment).not.toHaveBeenCalled();
    });

    it('should process the payment without validating signature when no webhook secret is configured', async () => {
      configService.get.mockReturnValue(undefined);
      mercadoPagoService.getPayment.mockResolvedValue({
        id: 123456789,
        status: 'approved',
        external_reference: mockRecharge.uuid,
        transaction_amount: 100,
        currency_id: 'ARS',
      } as any);
      rechargesService.findOne.mockResolvedValue(mockRecharge as any);

      await controller.handleWebhook(dataId, 'payment', undefined, undefined, {});

      expect(rechargesService.markPaidByProvider).toHaveBeenCalled();
    });

    describe('amount / currency checks on approved payments', () => {
      function approvedPayment(overrides: Record<string, unknown> = {}) {
        mercadoPagoService.getPayment.mockResolvedValue({
          id: 123456789,
          status: 'approved',
          external_reference: mockRecharge.uuid,
          transaction_amount: 100,
          currency_id: 'ARS',
          ...overrides,
        } as any);
      }

      beforeEach(() => {
        configService.get.mockReturnValue(undefined);
      });

      it('should not mark the recharge as paid if MP charged less than the recharge total', async () => {
        approvedPayment({ transaction_amount: 1 });
        rechargesService.findOne.mockResolvedValue(mockRecharge as any);

        await expect(
          controller.handleWebhook(dataId, 'payment', undefined, undefined, {}),
        ).resolves.toEqual({ received: true });

        expect(rechargesService.markPaidByProvider).not.toHaveBeenCalled();
        expect(supplierFulfillmentService.fulfillRecharge).not.toHaveBeenCalled();
      });

      it('should not mark the recharge as paid if the currency does not match', async () => {
        approvedPayment({ currency_id: 'USD' });
        rechargesService.findOne.mockResolvedValue(mockRecharge as any);

        await controller.handleWebhook(dataId, 'payment', undefined, undefined, {});

        expect(rechargesService.markPaidByProvider).not.toHaveBeenCalled();
      });

      it('should never accept an MP payment for a reseller order already paid from balance', async () => {
        approvedPayment();
        rechargesService.findOne.mockResolvedValue({ ...mockRecharge, paid_from_balance: true } as any);

        await controller.handleWebhook(dataId, 'payment', undefined, undefined, {});

        expect(rechargesService.markPaidByProvider).not.toHaveBeenCalled();
      });
    });

    it('should reject webhooks in production when no webhook secret is configured', async () => {
      configService.get.mockImplementation((key: string) =>
        key === 'NODE_ENV' ? 'production' : undefined,
      );

      await expect(
        controller.handleWebhook(dataId, 'payment', undefined, undefined, {}),
      ).rejects.toThrow(ForbiddenException);
      expect(mercadoPagoService.getPayment).not.toHaveBeenCalled();
    });
  });
});
