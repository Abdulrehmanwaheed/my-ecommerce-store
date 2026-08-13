import { MockPaymentGateway } from './mock-gateway';

export interface InitiatePaymentParams {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  description?: string;
}

export interface InitiatePaymentResult {
  checkoutUrl: string;
  gatewayTransactionId?: string;
}

export type GatewayWebhookStatus = 'success' | 'failed' | 'pending';

export interface WebhookVerificationResult {
  verified: boolean;
  status: GatewayWebhookStatus;
  orderId?: string;
  transactionId?: string;
  error?: string;
}

/**
 * Contract every payment provider must implement so that
 * PayFast, Safepay, JazzCash etc. can be dropped in via
 * the registry below without touching the API routes.
 */
export interface PaymentGatewayHandler {
  readonly id: string;
  initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult>;
  verifyWebhook(rawPayload: string): Promise<WebhookVerificationResult>;
}

/**
 * Registry: selects the active provider from env var PAYMENT_GATEWAY_PROVIDER
 * ('mock' | 'payfast' | 'safepay' | 'jazzcash'), defaulting to 'mock'.
 */
export function getActiveGateway(): PaymentGatewayHandler {
  const provider = (process.env.PAYMENT_GATEWAY_PROVIDER ?? 'mock').toLowerCase();

  switch (provider) {
    case 'payfast':
    case 'safepay':
    case 'jazzcash':
      // TODO: implement a class per provider implementing PaymentGatewayHandler
      // and return it here (e.g. `return new PayfastGateway()`).
      console.warn(
        `[payments] Gateway "${provider}" is not implemented yet. Falling back to the mock gateway.`,
      );
      return new MockPaymentGateway();
    case 'mock':
    default:
      return new MockPaymentGateway();
  }
}