import type {
  InitiatePaymentParams,
  InitiatePaymentResult,
  PaymentGatewayHandler,
  WebhookVerificationResult,
} from './gateway';

/**
 * Local gateway for development/demo.
 * - initiate() returns a URL to /api/payments/mock-checkout which simulates
 *   the gateway redirecting the customer back after payment.
 * - verifyWebhook() treats a payload with status 'success'/'payment.completed'
 *   as a successful charge, mirroring what a real provider webhook would send.
 *
 * Swap `getActiveGateway()` in gateway.ts to use a real provider.
 */
export class MockPaymentGateway implements PaymentGatewayHandler {
  readonly id = 'mock';

  async initiate({
    orderId,
    amount,
  }: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const gatewayTransactionId = `mock_${crypto
      .randomUUID()
      .replace(/-/g, '')
      .slice(0, 12)}`;

    return {
      gatewayTransactionId,
      checkoutUrl: `/api/payments/mock-checkout?orderId=${orderId}&ref=${gatewayTransactionId}&amount=${amount}`,
    };
  }

  async verifyWebhook(rawPayload: string): Promise<WebhookVerificationResult> {
    let payload: Record<string, any>;
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      return { verified: false, status: 'failed', error: 'Invalid JSON payload' };
    }

    const orderId = payload?.orderId ?? payload?.order_id;
    const transactionId = payload?.transactionId ?? payload?.paymentRef;

    const mockSecret = process.env.MOCK_PAYMENT_SECRET;
    if (mockSecret && payload?.secret !== mockSecret) {
      return {
        verified: false,
        status: 'failed',
        orderId,
        error: 'Invalid webhook secret',
      };
    }

    if (
      payload?.status === 'success' ||
      payload?.status === 'Paid' ||
      payload?.event === 'payment.completed'
    ) {
      return { verified: true, status: 'success', orderId, transactionId };
    }

    if (payload?.status === 'failed' || payload?.status === 'Failed') {
      return { verified: true, status: 'failed', orderId, transactionId };
    }

    return { verified: true, status: 'pending', orderId, transactionId };
  }
}