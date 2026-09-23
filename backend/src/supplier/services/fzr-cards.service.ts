import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Thin client for the FZR Cards public API (https://api.fzr.cards) — the
 * supplier we buy game top-ups/gift cards from to fulfill our own
 * customers' recharges. Their API is a prepaid-balance model, same shape as
 * our reseller balance: every order debits our FZR account instantly.
 *
 * NOTE: their OpenAPI spec documents request shapes precisely but leaves
 * response/webhook payloads as loosely-typed ("additionalProperties: true")
 * objects, and doesn't specify a webhook signing scheme. Field names below
 * (order.id, order.status, etc.) are best-effort based on their docs and
 * should be confirmed once real credentials are available — hit
 * POST /account/webhook/test to see one real payload.
 *
 * Set FZR_MOCK_MODE=true (no FZR_API_KEY needed) to test the automatic
 * fulfillment pipeline end-to-end: placeTopupOrder creates a fake order and
 * schedules a real HTTP call to our own /supplier/fzr/webhook a few seconds
 * later — the exact same endpoint the real FZR would call — so the whole
 * PENDING → PROCESSING → COMPLETED path runs for real, just without FZR.
 */
@Injectable()
export class FzrCardsService {
  private readonly logger = new Logger(FzrCardsService.name);
  private readonly mockOrders = new Map<string, Record<string, any>>();

  constructor(private readonly configService: ConfigService) {}

  isMockMode(): boolean {
    return this.configService.get<string>('FZR_MOCK_MODE') === 'true';
  }

  private getApiKey(): string {
    const apiKey = this.configService.get<string>('FZR_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException('FZR_API_KEY no está configurado');
    }

    return apiKey;
  }

  private getBaseUrl(): string {
    return this.configService.get<string>('FZR_API_BASE_URL') || 'https://api.fzr.cards';
  }

  private async request<T = any>(
    method: 'GET' | 'POST',
    path: string,
    options: { query?: Record<string, string | undefined>; body?: unknown; idempotencyKey?: string } = {},
  ): Promise<T> {
    const url = new URL(this.getBaseUrl() + path);

    for (const [key, value] of Object.entries(options.query || {})) {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }

    const headers: Record<string, string> = {
      'X-API-Key': this.getApiKey(),
      'Content-Type': 'application/json',
    };

    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const payload = await response.json().catch(() => undefined);

    if (!response.ok) {
      this.logger.error(
        `FZR Cards API error ${response.status} on ${method} ${path}: ${JSON.stringify(payload)}`,
      );
      throw new InternalServerErrorException(
        (payload && payload.error) || `Error consultando a FZR Cards (${response.status})`,
      );
    }

    return payload as T;
  }

  /** Our prepaid balance with FZR Cards (USD). */
  async getBalance() {
    if (this.isMockMode()) {
      // Sin credenciales reales no hay nada que consultar -- un valor fijo
      // alcanza para probar la pantalla de auditoría en dev.
      return { ok: true as const, balance: '5000.00', currency: 'USD' as const };
    }

    return this.request<{ ok: true; balance: string; currency: 'USD' }>('GET', '/api/v2/balance');
  }

  /** List top-up categories (games), e.g. to populate a supplier-mapping admin screen. */
  async listTopupCategories() {
    return this.request<{ ok: true; items: Array<{ category_id: string; name: string; note?: string }> }>(
      'GET',
      '/api/v2/topups',
    );
  }

  /** Offers (packages) + required buyer fields for one category_id. */
  async getTopupOffers(categoryId: string) {
    return this.request<{
      ok: true;
      category_id: string;
      name: string;
      offers: Array<{ offer_id: string | null; name: string; price_usd: string }>;
      fields: Array<{ key: string; label: string; type: string; options?: unknown[] }>;
    }>('GET', '/api/v2/topups/offers', { query: { category_id: categoryId } });
  }

  /** Validates a player id before ordering (e.g. Free Fire Player ID). */
  async validateTopupId(categoryId: string, fields: Record<string, string>) {
    return this.request<{ ok: true; valid: boolean; player_name?: string; region?: string }>(
      'POST',
      '/api/v2/topups/validate-id',
      { body: { category_id: categoryId, fields } },
    );
  }

  /**
   * Places a top-up order. Debits our FZR balance immediately; the order
   * then sits `processing` until FZR completes or refunds it.
   * `idempotencyKey` should be our recharge's uuid so a retried webhook (or
   * a retried call on our side) never double-charges our FZR balance.
   */
  async placeTopupOrder(
    categoryId: string,
    offerId: string,
    fields: Record<string, string>,
    idempotencyKey: string,
  ) {
    if (this.isMockMode()) {
      return this.placeMockTopupOrder(categoryId, offerId, fields, idempotencyKey);
    }

    return this.request<{ ok: true; order: Record<string, any> }>('POST', '/api/v2/topups/order', {
      body: { category_id: categoryId, offer_id: offerId, fields },
      idempotencyKey,
    });
  }

  /** Fetches an order by its public id — the authoritative source of truth for status. */
  async getOrder(orderId: string) {
    if (this.isMockMode()) {
      const order = this.mockOrders.get(orderId);

      if (!order) {
        throw new InternalServerErrorException(`Orden simulada ${orderId} no encontrada`);
      }

      return { ok: true as const, order };
    }

    return this.request<{ ok: true; order: Record<string, any> }>('GET', `/api/v2/orders/${orderId}`);
  }

  private placeMockTopupOrder(
    categoryId: string,
    offerId: string,
    fields: Record<string, string>,
    idempotencyKey: string,
  ): Promise<{ ok: true; order: Record<string, any> }> {
    const orderId = `mock-fzr-${idempotencyKey}`;
    const order: Record<string, any> = {
      id: orderId,
      status: 'processing',
      category_id: categoryId,
      offer_id: offerId,
      fields,
      mock: true,
    };

    this.mockOrders.set(orderId, order);
    this.logger.warn(`FZR_MOCK_MODE activo: orden simulada ${orderId} creada, se completará en unos segundos`);

    // Simulates FZR fulfilling the order asynchronously and calling our
    // webhook — a real HTTP call to our own real endpoint, not a shortcut.
    setTimeout(() => {
      const stored = this.mockOrders.get(orderId);

      if (stored) {
        stored.status = 'completed';
      }

      const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000';

      fetch(`${backendUrl}/supplier/fzr/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { id: orderId } }),
      }).catch((error) => {
        this.logger.error('Error llamando al webhook simulado de FZR Cards', error as Error);
      });
    }, 5000);

    return Promise.resolve({ ok: true as const, order });
  }
}
