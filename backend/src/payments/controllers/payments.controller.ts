import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Headers,
  Body,
  Res,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { MercadoPagoService } from '../services/mercado-pago.service';
import { RechargesService } from '../../recharges/services/recharges.service';
import { SupplierFulfillmentService } from '../../supplier/services/supplier-fulfillment.service';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, RechargeStatus } from '../../common/enums';
import { verifyMercadoPagoSignature } from '../utils/verify-mercadopago-signature';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@ApiTags('payments')
@Controller('payments/mercadopago')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly rechargesService: RechargesService,
    private readonly supplierFulfillmentService: SupplierFulfillmentService,
    private readonly configService: ConfigService,
  ) {}

  @Post('preference/:rechargeUuid')
  @ApiOperation({ summary: 'Create a Mercado Pago Checkout Pro preference for a pending recharge' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createPreference(
    @Param('rechargeUuid') rechargeUuid: string,
    @CurrentUser() user: { uuid: string; role: UserRole },
  ) {
    const recharge = await this.rechargesService.findOne(rechargeUuid);

    // El dueño del pedido o un admin pueden generar el link de pago; nunca
    // un tercero, para no poder redirigir el cobro de la recarga de otro.
    if (recharge.user_id !== user.uuid && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tenés permiso para pagar esta recarga');
    }

    if (recharge.status !== RechargeStatus.PENDING) {
      throw new BadRequestException('Solo se puede pagar una recarga pendiente');
    }

    // Mercado Pago es exclusivo del flujo B2C: las órdenes de resellers ya se
    // debitan de su balance prepago al crearse (ver RechargesService.create),
    // así que pagarlas de nuevo con MP duplicaría el cobro.
    if (recharge.paid_from_balance) {
      throw new BadRequestException(
        'Las órdenes de resellers se pagan desde el balance prepago, no con Mercado Pago',
      );
    }

    const preference = await this.mercadoPagoService.createPreference(recharge);

    return {
      message: 'Preferencia de pago creada',
      data: preference,
    };
  }

  /**
   * Fake Checkout Pro page, only reachable when MP_MOCK_MODE=true. Lets you
   * click through the entire automatic B2C pipeline (payment → supplier
   * fulfillment → COMPLETED) without a real Mercado Pago account: approving
   * here calls the real /webhook endpoint below, same as MP itself would.
   */
  @Get('mock-checkout/:paymentId')
  @ApiExcludeEndpoint()
  mockCheckoutPage(@Param('paymentId') paymentId: string, @Res() res: Response) {
    if (!this.mercadoPagoService.isMockMode()) {
      throw new NotFoundException();
    }

    // paymentId viene de la URL: escaparlo evita XSS reflejado en esta página.
    const safeId = escapeHtml(paymentId);
    const urlId = encodeURIComponent(paymentId);

    res.type('html').send(`
      <html>
        <head><title>Mercado Pago (simulado)</title></head>
        <body style="font-family: sans-serif; max-width: 420px; margin: 80px auto; text-align: center;">
          <h2>Checkout simulado</h2>
          <p>Pago <code>${safeId}</code> — MP_MOCK_MODE está activo, no se está llamando a Mercado Pago real.</p>
          <p>
            <a href="/payments/mercadopago/mock-checkout/${urlId}/approve"
               style="display:inline-block;margin:8px;padding:12px 24px;background:#22c55e;color:#fff;border-radius:8px;text-decoration:none;">
              Aprobar pago
            </a>
            <a href="/payments/mercadopago/mock-checkout/${urlId}/reject"
               style="display:inline-block;margin:8px;padding:12px 24px;background:#ef4444;color:#fff;border-radius:8px;text-decoration:none;">
              Rechazar pago
            </a>
          </p>
        </body>
      </html>
    `);
  }

  @Get('mock-checkout/:paymentId/approve')
  @ApiExcludeEndpoint()
  async mockApprove(@Param('paymentId') paymentId: string, @Res() res: Response) {
    if (!this.mercadoPagoService.isMockMode()) {
      throw new NotFoundException();
    }

    this.mercadoPagoService.setMockPaymentStatus(paymentId, 'approved');
    await this.callOwnWebhook(paymentId);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/recharges?mp_status=success`);
  }

  @Get('mock-checkout/:paymentId/reject')
  @ApiExcludeEndpoint()
  async mockReject(@Param('paymentId') paymentId: string, @Res() res: Response) {
    if (!this.mercadoPagoService.isMockMode()) {
      throw new NotFoundException();
    }

    this.mercadoPagoService.setMockPaymentStatus(paymentId, 'rejected');
    await this.callOwnWebhook(paymentId);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/recharges?mp_status=failure`);
  }

  /** Loops back into our own real webhook, exactly like Mercado Pago would. */
  private async callOwnWebhook(paymentId: string) {
    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000';

    try {
      await fetch(
        `${backendUrl}/payments/mercadopago/webhook?type=payment&data.id=${encodeURIComponent(paymentId)}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
      );
    } catch (error) {
      this.logger.error('Error llamando al webhook simulado de Mercado Pago', error as Error);
    }
  }

  /**
   * Public endpoint: Mercado Pago calls this directly, so it can't sit
   * behind JwtAuthGuard. The x-signature header is what actually
   * authenticates the caller — see verifyMercadoPagoSignature.
   */
  @Post('webhook')
  // Lo llama el proveedor (con reintentos en ráfaga), no un usuario: sin rate limit.
  @SkipThrottle()
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Query('data.id') dataIdQuery: string | undefined,
    @Query('type') type: string | undefined,
    @Headers('x-signature') xSignature: string | undefined,
    @Headers('x-request-id') xRequestId: string | undefined,
    @Body() body: { action?: string; data?: { id?: string } },
  ) {
    const paymentId = body?.data?.id || dataIdQuery;
    const notificationType = body?.action?.split('.')[0] || type;

    if (notificationType !== 'payment' || !paymentId) {
      // Mercado Pago also sends non-payment topics (merchant_order, etc.);
      // ack them without processing so it stops retrying.
      return { received: true };
    }

    const webhookSecret = this.configService.get<string>('MP_WEBHOOK_SECRET');

    if (webhookSecret) {
      const isValid = verifyMercadoPagoSignature({
        xSignature,
        xRequestId,
        dataId: paymentId,
        secret: webhookSecret,
      });

      if (!isValid) {
        this.logger.warn(`Firma de webhook de Mercado Pago inválida para payment ${paymentId}`);
        throw new ForbiddenException('Invalid signature');
      }
    } else if (this.configService.get<string>('NODE_ENV') === 'production') {
      // En producción la firma es obligatoria: sin secreto no hay forma de
      // saber que la notificación viene realmente de Mercado Pago.
      this.logger.error('MP_WEBHOOK_SECRET no configurado en producción: webhook rechazado.');
      throw new ForbiddenException('Webhook signature verification is not configured');
    } else {
      this.logger.warn(
        'MP_WEBHOOK_SECRET no configurado: la firma del webhook no se está validando. Configurarlo antes de producción.',
      );
    }

    const payment = await this.mercadoPagoService.getPayment(paymentId);
    const rechargeUuid = payment.external_reference;

    if (!rechargeUuid) {
      this.logger.warn(`Payment ${paymentId} sin external_reference, se ignora`);
      return { received: true };
    }

    if (payment.status === 'approved') {
      // Doble chequeo de que lo cobrado corresponde a este pedido: monto y
      // moneda tienen que coincidir con el total de la recarga, y nunca se
      // acepta un pago de MP para una orden de revendedor (ya pagada con
      // balance). Si no cuadra, la recarga queda PENDING para que la revise
      // un admin, en vez de entregarse.
      const recharge = await this.rechargesService.findOne(rechargeUuid);
      const paidAmount = Number(payment.transaction_amount);
      const expectedAmount = Number(recharge.total);
      const amountMatches = Number.isFinite(paidAmount) && paidAmount + 0.01 >= expectedAmount;
      const currencyMatches = payment.currency_id === (recharge.currency || 'ARS');

      if (recharge.paid_from_balance || !amountMatches || !currencyMatches) {
        this.logger.error(
          `Pago ${payment.id} no coincide con la recarga ${rechargeUuid}: ` +
            `cobrado ${paidAmount} ${payment.currency_id}, esperado ${expectedAmount} ${recharge.currency}` +
            (recharge.paid_from_balance ? ' (orden de revendedor, no se paga con MP)' : '') +
            '. No se marca como pagada.',
        );
        return { received: true };
      }

      await this.rechargesService.markPaidByProvider(rechargeUuid, String(payment.id), payment);

      // B2C is the automatic path end-to-end: payment confirmed → place the
      // order with our supplier right away, no admin in the loop. If this
      // fails (missing mapping, FZR API error), the recharge just stays
      // PROCESSING with payment already booked, for an admin to fulfill
      // manually — it does NOT roll back the payment confirmation above.
      try {
        await this.supplierFulfillmentService.fulfillRecharge(rechargeUuid);
      } catch (error) {
        this.logger.error(
          `No se pudo cumplir automáticamente con el proveedor la recarga ${rechargeUuid}`,
          error as Error,
        );
      }
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      await this.rechargesService.markFailedByProvider(rechargeUuid, String(payment.id), payment);
    }
    // Otros estados (pending, in_process, etc.) no cambian nada: se espera
    // el próximo webhook cuando Mercado Pago resuelva el pago.

    return { received: true };
  }
}
