import { NextResponse } from 'next/server';
import { processWebhook } from '@/lib/payments/process-webhook';

/**
 * GET /api/payments/mock-checkout?orderId=...&ref=...&amount=...
 * Simulates the gateway redirecting the customer back after payment,
 * then fires the same webhook pipeline a real gateway would call.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const transactionId =
    searchParams.get('ref') ??
    `mock_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

  if (!orderId) {
    return NextResponse.json(
      { ok: false, message: 'Missing orderId' },
      { status: 400 },
    );
  }

  const mockPayload = JSON.stringify({
    event: 'payment.completed',
    orderId,
    transactionId,
    status: 'success',
  });

  const result = await processWebhook(mockPayload);

  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.redirect(new URL(`/order-success/${orderId}`, request.url));
}