import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Validates the `x-signature` header Mercado Pago sends on every webhook
 * call, per https://www.mercadopago.com/developers/en/docs/checkout-api/webhooks#editor_5.
 * Without this check anyone who guesses the webhook URL could POST a fake
 * "approved" notification and get a recharge marked COMPLETED for free.
 */
export function verifyMercadoPagoSignature(params: {
  xSignature: string | undefined;
  xRequestId: string | undefined;
  dataId: string | undefined;
  secret: string;
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = params;

  if (!xSignature || !xRequestId || !dataId) {
    return false;
  }

  const parts = Object.fromEntries(
    xSignature.split(',').map((part) => {
      const [key, value] = part.split('=');
      return [key?.trim(), value?.trim()];
    }),
  );

  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1) {
    return false;
  }

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const expected = Buffer.from(createHmac('sha256', secret).update(manifest).digest('hex'));
  const received = Buffer.from(v1);

  // Constant-time comparison, so response timing can't leak how many
  // leading characters of a forged signature were correct.
  return expected.length === received.length && timingSafeEqual(expected, received);
}
