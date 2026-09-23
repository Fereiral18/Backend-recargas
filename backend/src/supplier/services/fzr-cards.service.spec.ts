import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { FzrCardsService } from './fzr-cards.service';

describe('FzrCardsService', () => {
  let service: FzrCardsService;
  let configService: jest.Mocked<ConfigService>;
  let fetchMock: jest.Mock;

  beforeEach(async () => {
    const mockConfigService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FzrCardsService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get(FzrCardsService);
    configService = module.get(ConfigService);

    fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function mockConfig(values: Record<string, string | undefined>) {
    configService.get.mockImplementation((key: string) => values[key]);
  }

  function jsonResponse(body: unknown, ok = true, status = 200) {
    return { ok, status, json: async () => body };
  }

  it('should throw if FZR_API_KEY is not configured', async () => {
    mockConfig({});

    await expect(service.getBalance()).rejects.toThrow(InternalServerErrorException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should send the API key header and hit the default base URL', async () => {
    mockConfig({ FZR_API_KEY: 'fc_test123' });
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, balance: '100.0000', currency: 'USD' }));

    await service.getBalance();

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://api.fzr.cards/api/v2/balance');
    expect(options.headers['X-API-Key']).toBe('fc_test123');
  });

  it('should respect a custom FZR_API_BASE_URL', async () => {
    mockConfig({ FZR_API_KEY: 'fc_test123', FZR_API_BASE_URL: 'https://sandbox.fzr.cards' });
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, items: [] }));

    await service.listTopupCategories();

    expect(String(fetchMock.mock.calls[0][0])).toBe('https://sandbox.fzr.cards/api/v2/topups');
  });

  it('should pass category_id as a query param on getTopupOffers', async () => {
    mockConfig({ FZR_API_KEY: 'fc_test123' });
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, offers: [] }));

    await service.getTopupOffers('free-fire');

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      'https://api.fzr.cards/api/v2/topups/offers?category_id=free-fire',
    );
  });

  it('should send the idempotency key header when placing an order', async () => {
    mockConfig({ FZR_API_KEY: 'fc_test123' });
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, order: { id: 'o1' } }));

    await service.placeTopupOrder('free-fire', 'ff_100', { player_id: '123' }, 'recharge-uuid-1');

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers['Idempotency-Key']).toBe('recharge-uuid-1');
    expect(JSON.parse(options.body)).toEqual({
      category_id: 'free-fire',
      offer_id: 'ff_100',
      fields: { player_id: '123' },
    });
  });

  it('should throw InternalServerErrorException with the API error message on a non-ok response', async () => {
    mockConfig({ FZR_API_KEY: 'fc_test123' });
    fetchMock.mockResolvedValue(jsonResponse({ ok: false, error: 'Insufficient balance' }, false, 400));

    await expect(service.placeTopupOrder('x', 'y', {}, 'k')).rejects.toThrow('Insufficient balance');
  });

  describe('mock mode', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should never hit the real API when FZR_MOCK_MODE=true', () => {
      mockConfig({ FZR_MOCK_MODE: 'true' });
      expect(service.isMockMode()).toBe(true);
    });

    it('should create a fake processing order without calling fetch, keyed by the idempotency key', async () => {
      mockConfig({ FZR_MOCK_MODE: 'true' });

      const result = await service.placeTopupOrder('free-fire', 'ff_100', { player_id: '123' }, 'recharge-uuid-1');

      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.order.id).toBe('mock-fzr-recharge-uuid-1');
      expect(result.order.status).toBe('processing');
    });

    it('should let getOrder read back the current status of a mock order', async () => {
      mockConfig({ FZR_MOCK_MODE: 'true' });

      const placed = await service.placeTopupOrder('free-fire', 'ff_100', { player_id: '123' }, 'recharge-uuid-1');

      const fetched = await service.getOrder(placed.order.id);
      expect(fetched.order.status).toBe('processing');
    });

    it('should complete the mock order and call our own webhook after a delay', async () => {
      mockConfig({ FZR_MOCK_MODE: 'true', BACKEND_URL: 'http://localhost:4000' });
      fetchMock.mockResolvedValue(jsonResponse({ received: true }));

      const placed = await service.placeTopupOrder('free-fire', 'ff_100', { player_id: '123' }, 'recharge-uuid-1');

      jest.advanceTimersByTime(5000);
      await Promise.resolve();
      await Promise.resolve();

      const fetched = await service.getOrder(placed.order.id);
      expect(fetched.order.status).toBe('completed');

      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:4000/supplier/fzr/webhook',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ data: { id: placed.order.id } }),
        }),
      );
    });

    it('should throw when asked for a mock order id that was never created', async () => {
      mockConfig({ FZR_MOCK_MODE: 'true' });

      await expect(service.getOrder('unknown-order')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
