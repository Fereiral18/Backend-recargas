import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { FzrCardsService } from './fzr-cards.service';
import { SupplierTopUpMappingsService } from './supplier-topup-mappings.service';
import { RechargesService } from '../../recharges/services/recharges.service';

/**
 * Places the actual order with FZR Cards once a recharge's payment has been
 * confirmed (status PROCESSING). Only wired to the automatic Mercado Pago
 * path for now (see PaymentsController) — reseller orders keep being
 * fulfilled outside this pipeline until that's explicitly requested.
 */
@Injectable()
export class SupplierFulfillmentService {
  private readonly logger = new Logger(SupplierFulfillmentService.name);

  constructor(
    private readonly fzrCardsService: FzrCardsService,
    private readonly mappingsService: SupplierTopUpMappingsService,
    private readonly rechargesService: RechargesService,
  ) {}

  async fulfillRecharge(rechargeUuid: string) {
    const recharge = await this.rechargesService.findOne(rechargeUuid);

    const mapping = await this.mappingsService.findMapping(recharge.operator, recharge.package);

    if (!mapping) {
      throw new BadRequestException(
        `No hay un mapeo de proveedor configurado para ${recharge.operator}/${recharge.package || '(sin paquete)'}`,
      );
    }

    const fields = { [mapping.fzr_player_id_field_key]: recharge.phone_number };

    // Idempotency key = our recharge uuid, so a retried call (our own retry,
    // or FZR replaying) never places (and charges) a duplicate order.
    const result = await this.fzrCardsService.placeTopupOrder(
      mapping.fzr_category_id,
      mapping.fzr_offer_id,
      fields,
      recharge.uuid,
    );

    const supplierOrderId = result?.order?.id ?? result?.order?.order_id;

    if (!supplierOrderId) {
      this.logger.error(
        `FZR Cards no devolvió un id de orden reconocible para la recarga ${recharge.uuid}: ${JSON.stringify(result)}`,
      );
    }

    return this.rechargesService.recordSupplierOrder(
      recharge.uuid,
      String(supplierOrderId ?? ''),
      result,
    );
  }
}
