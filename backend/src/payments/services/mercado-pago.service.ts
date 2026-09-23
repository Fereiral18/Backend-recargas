import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Recharge } from '../../recharges/entities/recharge.entity';

interface MockPayment {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  external_reference: string;
  transaction_amount: number;
  currency_id: string;
}

/**
 * Thin wrapper around the Mercado Pago SDK (Checkout Pro).
 * Checkout Pro is used instead of Checkout API/Bricks because it's the mode
 * that shows the buyer's own Mercado Pago account balance as a payment
 * option alongside cards/transferencia — which is the point here: resellers
 * and B2C users paying with money they already hold in Mercado Pago.
 *
 * Set MP_MOCK_MODE=true (no MP_ACCESS_TOKEN needed) to test the whole
 * automatic pipeline end-to-end without a real Mercado Pago account: it
 * serves a fake checkout page and, when "approved", calls back into our own
 * real /payments/mercadopago/webhook endpoint — the exact same code path a
 * real Mercado Pago notification would hit.
 */
@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly client: MercadoPagoConfig;
  private readonly mockPayments = new Map<string, MockPayment>();

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');

    if (
      this.configService.get<string>('MP_MOCK_MODE') === 'true' &&
      this.configService.get<string>('NODE_ENV') === 'production'
    ) {
      this.logger.error('MP_MOCK_MODE=true se ignora en producción: el checkout simulado queda deshabilitado.');
    }

    if (!accessToken && !this.isMockMode()) {
      this.logger.warn(
        'MP_ACCESS_TOKEN no está configurado: los pagos con Mercado Pago fallarán hasta que se cargue.',
      );
    }

    this.client = new MercadoPagoConfig({ accessToken: accessToken || '' });
  }

  /**
   * Never true in production, even if MP_MOCK_MODE=true leaks into that env:
   * the mock checkout endpoints are public and approve any payment, so being
   * reachable in prod would let anyone get recharges for free.
   */
  isMockMode(): boolean {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      return false;
    }

    return this.configService.get<string>('MP_MOCK_MODE') === 'true';
  }

  /**
   * Creates a Checkout Pro preference for a pending recharge and returns the
   * URL the frontend should redirect the user to.
   * external_reference is set to the recharge UUID so the webhook can find
   * the order back without guessing/parsing free-text references.
   */
  async createPreference(recharge: Recharge) {
    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000';
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    if (this.isMockMode()) {
      const paymentId = `mock-${recharge.uuid}`;
      this.mockPayments.set(paymentId, {
        id: paymentId,
        status: 'pending',
        external_reference: recharge.uuid,
        transaction_amount: Number(recharge.total),
        currency_id: 'ARS',
      });

      this.logger.warn(`MP_MOCK_MODE activo: checkout simulado para la recarga ${recharge.uuid}`);

      return {
        preference_id: paymentId,
        init_point: `${backendUrl}/payments/mercadopago/mock-checkout/${paymentId}`,
        sandbox_init_point: undefined,
      };
    }

    const preferenceClient = new Preference(this.client);

    try {
      const preference = await preferenceClient.create({
        body: {
          items: [
            {
              id: recharge.uuid,
              title: `Recarga ${recharge.operator} - ${recharge.type}`,
              quantity: 1,
              unit_price: Number(recharge.total),
              currency_id: 'ARS',
            },
          ],
          external_reference: recharge.uuid,
          notification_url: `${backendUrl}/payments/mercadopago/webhook`,
          back_urls: {
            success: `${frontendUrl}/recharges?mp_status=success`,
            failure: `${frontendUrl}/recharges?mp_status=failure`,
            pending: `${frontendUrl}/recharges?mp_status=pending`,
          },
          auto_return: 'approved',
          statement_descriptor: 'RECARGAS',
        },
      });

      return {
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error('Error creando preferencia de Mercado Pago', error as Error);
      throw new InternalServerErrorException('No se pudo iniciar el pago con Mercado Pago');
    }
  }

  /**
   * Fetches a payment by id from Mercado Pago's API. Webhook notifications
   * only carry the payment id — the actual status must always be re-fetched
   * from MP directly, never trusted from the webhook body itself.
   */
  async getPayment(paymentId: string | number) {
    if (this.isMockMode()) {
      const mock = this.mockPayments.get(String(paymentId));

      if (!mock) {
        throw new NotFoundException(`Pago simulado ${paymentId} no encontrado`);
      }

      return mock as any;
    }

    const paymentClient = new Payment(this.client);
    return paymentClient.get({ id: paymentId });
  }

  /** Used only by the mock checkout endpoints to flip a fake payment's status. */
  setMockPaymentStatus(paymentId: string, status: 'approved' | 'rejected') {
    const mock = this.mockPayments.get(paymentId);

    if (mock) {
      mock.status = status;
    }

    return mock;
  }
}
