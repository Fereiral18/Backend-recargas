import { createHmac } from 'crypto';
import { verifyMercadoPagoSignature } from './verify-mercadopago-signature';

describe('verifyMercadoPagoSignature', () => {
  const secret = 'test-secret';
  const dataId = '123456789';
  const xRequestId = 'req-abc-123';
  const ts = '1704908010';

  function signatureFor(id: string, requestId: string, timestamp: string, key: string) {
    const manifest = `id:${id.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
    return createHmac('sha256', key).update(manifest).digest('hex');
  }

  it('should accept a correctly signed notification', () => {
    const v1 = signatureFor(dataId, xRequestId, ts, secret);

    const result = verifyMercadoPagoSignature({
      xSignature: `ts=${ts},v1=${v1}`,
      xRequestId,
      dataId,
      secret,
    });

    expect(result).toBe(true);
  });

  it('should reject a signature computed with the wrong secret', () => {
    const v1 = signatureFor(dataId, xRequestId, ts, 'wrong-secret');

    const result = verifyMercadoPagoSignature({
      xSignature: `ts=${ts},v1=${v1}`,
      xRequestId,
      dataId,
      secret,
    });

    expect(result).toBe(false);
  });

  it('should reject a tampered dataId even if the signature looks otherwise valid', () => {
    const v1 = signatureFor(dataId, xRequestId, ts, secret);

    const result = verifyMercadoPagoSignature({
      xSignature: `ts=${ts},v1=${v1}`,
      xRequestId,
      dataId: 'another-payment-id',
      secret,
    });

    expect(result).toBe(false);
  });

  it('should reject when headers are missing', () => {
    expect(
      verifyMercadoPagoSignature({ xSignature: undefined, xRequestId, dataId, secret }),
    ).toBe(false);
    expect(
      verifyMercadoPagoSignature({ xSignature: `ts=${ts},v1=abc`, xRequestId: undefined, dataId, secret }),
    ).toBe(false);
  });

  it('should reject a malformed x-signature header', () => {
    const result = verifyMercadoPagoSignature({
      xSignature: 'not-a-valid-header',
      xRequestId,
      dataId,
      secret,
    });

    expect(result).toBe(false);
  });
});
