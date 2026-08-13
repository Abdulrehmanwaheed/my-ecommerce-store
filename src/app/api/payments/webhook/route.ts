import { NextResponse } from 'next/server';
import { processWebhook } from '@/lib/payments/process-webhook';

/**
 * POST /api/payments/webhook
 * Receives callbacks from the payment gateway.
 */
export async function POST(request: Request) {
  const rawPayload = await request.text();
  const result = await processWebhook(rawPayload);

  const statusMap = {
    ok: 200,
    bad_request: 400,
    unauthorized: 401,
    server_error: 500,
  } as const;

  return NextResponse.json(result, {
    status: statusMap[result.status],
  });
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 },
  );
}