import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';

describe('MercadoPagoService (mock mode)', () => {
  let service: MercadoPagoService;
  let configService: jest.Mocked<ConfigService>;

  const mockRecharge = { uuid: 'recharge-uuid-1', operator: 'FREE_FIRE', type: 'DIAMONDS', total: 1500 };

  beforeEach(async () => {
    const mockConfigService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [MercadoPagoService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get(MercadoPagoService);
    configService = module.get(ConfigService);
  });

  function mockConfig(values: Record<string, string | undefined>) {
    configService.get.mockImplementation((key: string) => values[key]);
  }

  it('should not be in mock mode by default', () => {
    mockConfig({});
    expect(service.isMockMode()).toBe(false);
  });

  it('should be in mock mode when MP_MOCK_MODE=true', () => {
    mockConfig({ MP_MOCK_MODE: 'true' });
    expect(service.isMockMode()).toBe(true);
  });

  it('should never be in mock mode in production, even with MP_MOCK_MODE=true', () => {
    mockConfig({ MP_MOCK_MODE: 'true', NODE_ENV: 'production' });
    expect(service.isMockMode()).toBe(false);
  });

  it('should return a mock-checkout init_point instead of calling the real SDK', async () => {
    mockConfig({ MP_MOCK_MODE: 'true', BACKEND_URL: 'http://localhost:4000' });

    const preference = await service.createPreference(mockRecharge as any);

    expect(preference.init_point).toBe(
      `http://localhost:4000/payments/mercadopago/mock-checkout/mock-${mockRecharge.uuid}`,
    );
  });

  it('should track the mock payment as pending until approved/rejected', async () => {
    mockConfig({ MP_MOCK_MODE: 'true' });

    const preference = await service.createPreference(mockRecharge as any);
    const paymentId = preference.preference_id as string;

    const pending = await service.getPayment(paymentId);
    expect(pending.status).toBe('pending');

    service.setMockPaymentStatus(paymentId, 'approved');

    const approved = await service.getPayment(paymentId);
    expect(approved.status).toBe('approved');
    expect(approved.external_reference).toBe(mockRecharge.uuid);
  });

  it('should throw NotFoundException for an unknown mock payment id', async () => {
    mockConfig({ MP_MOCK_MODE: 'true' });

    await expect(service.getPayment('nonexistent')).rejects.toThrow(NotFoundException);
  });
});
