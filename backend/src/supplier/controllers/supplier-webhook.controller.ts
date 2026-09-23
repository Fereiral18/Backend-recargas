import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { FzrCardsService } from '../services/fzr-cards.service';
import { RechargesService } from '../../recharges/services/recharges.service';

const DELIVERED_STATUSES = ['completed', 'success', 'done', 'fulfilled', 'delivered'];
const FAILED_STATUSES = ['failed', 'error', 'refunded', 'refund', 'cancelled', 'canceled'];

/**
 * Public endpoint FZR Cards calls when an order's status changes.
 *
 * Their docs don't specify a webhook signing scheme (unlike Mercado Pago's
 * x-signature), so this deliberately never trusts the webhook body for the
 * actual status — it only extracts a plausible order id from it, then
 * re-fetches that order from FZR's authenticated API (our own API key) as
 * the source of truth. A forged/garbage webhook call can at worst trigger
 * one extra authenticated lookup; it can't forge a status by itself.
 *
 * TODO once real credentials exist: hit POST /account/webhook/test to see a
 * real payload and confirm extractOrderId's field guesses are right.
 */
@ApiTags('supplier-webhook')
@Controller('supplier/fzr')
export class SupplierWebhookController {
  private readonly logger = new Logger(SupplierWebhookController.name);

  constructor(
    private readonly fzrCardsService: FzrCardsService,
    private readonly rechargesService: RechargesService,
  ) {}

  private extractOrderId(body: any): string | undefined {
    const candidate =
      body?.order?.id ?? body?.order_id ?? body?.data?.order?.id ?? body?.data?.id ?? body?.id;

    return candidate !== undefined && candidate !== null ? String(candidate) : undefined;
  }

  @Post('webhook')
  // Lo llama el proveedor (con reintentos en ráfaga), no un usuario: sin rate limit.
  @SkipThrottle()
  @ApiExcludeEndpoint()
  async handleWebhook(@Body() body: any) {
    this.logger.log(`FZR Cards webhook recibido: ${JSON.stringify(body)}`);

    const orderId = this.extractOrderId(body);

    if (!orderId) {
      this.logger.warn('Webhook de FZR Cards sin id de orden reconocible, se ignora');
      return { received: true };
    }

    const recharge = await this.rechargesService.findBySupplierOrderId(orderId);

    if (!recharge) {
      this.logger.warn(`Webhook de FZR Cards para una orden que no corresponde a ninguna recarga: ${orderId}`);
      return { received: true };
    }

    // Always re-fetch the authoritative order state — never trust the
    // webhook body's own status field.
    const { order } = await this.fzrCardsService.getOrder(orderId);
    const status = String(order?.status || '').toLowerCase();

    if (DELIVERED_STATUSES.includes(status)) {
      await this.rechargesService.completeFromSupplier(recharge.uuid, orderId, order);
    } else if (FAILED_STATUSES.includes(status)) {
      await this.rechargesService.failFromSupplier(recharge.uuid, orderId, order);
    } else {
      // Still processing on FZR's side — just refresh the stored snapshot.
      await this.rechargesService.recordSupplierOrder(recharge.uuid, orderId, order);
    }

    return { received: true };
  }
}
