import { createAdminClient } from '@/lib/supabase/admin';
import { getActiveGateway } from '@/lib/payments/gateway';

export interface WebhookProcessResult {
  ok: boolean;
  status: 'ok' | 'bad_request' | 'unauthorized' | 'server_error';
  message: string;
  orderId?: string;
  transactionId?: string;
}

/**
 * Shared webhook pipeline, used by /api/payments/webhook (real provider
 * callbacks) and the mock checkout redirect.
 */
export async function processWebhook(rawPayload: string): Promise<WebhookProcessResult> {
  const gateway = getActiveGateway();
  const supabase = createAdminClient();

  let parsedPayload: Record<string, any> = {};
  try {
    parsedPayload = JSON.parse(rawPayload);
  } catch {
    // raw payload is still logged below for auditing
  }

  const verification = await gateway.verifyWebhook(rawPayload);
  const orderId = verification.orderId ?? parsedPayload?.orderId ?? parsedPayload?.order_id;

  if (!orderId) {
    await logPaymentEvent(supabase, null, gateway.id, parsedPayload, 'bad_request');
    return { ok: false, status: 'bad_request', message: 'Missing orderId in payload' };
  }

  await logPaymentEvent(supabase, orderId, gateway.id, parsedPayload, verification.status);

  if (!verification.verified) {
    return {
      ok: false,
      status: 'unauthorized',
      message: verification.error ?? 'Webhook verification failed',
    };
  }

  if (verification.status === 'success' && verification.transactionId) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'Paid',
        payment_gateway_ref: verification.transactionId,
        order_status: 'Processing',
      })
      .eq('id', orderId)
      .eq('payment_status', 'Unpaid')
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('[payments/webhook] Failed to update order:', error);
      return { ok: false, status: 'server_error', message: error.message, orderId };
    }

    if (!data) {
      // Already paid (duplicate/delayed webhook) — treat as success.
      return {
        ok: true,
        status: 'ok',
        message: 'Payment already recorded',
        orderId,
        transactionId: verification.transactionId,
      };
    }

    return {
      ok: true,
      status: 'ok',
      message: 'Payment recorded',
      orderId,
      transactionId: verification.transactionId,
    };
  }

  if (verification.status === 'failed') {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'Failed' })
      .eq('id', orderId)
      .eq('payment_status', 'Unpaid');

    if (error) {
      console.error('[payments/webhook] Failed to mark order as failed:', error);
      return { ok: false, status: 'server_error', message: error.message, orderId };
    }

    return {
      ok: true,
      status: 'ok',
      message: 'Payment failed, order marked accordingly',
      orderId,
      transactionId: verification.transactionId,
    };
  }

  // 'pending' — acknowledged, no order mutation.
  return {
    ok: true,
    status: 'ok',
    message: 'Payment pending, no action taken',
    orderId,
    transactionId: verification.transactionId,
  };
}

async function logPaymentEvent(
  supabase: ReturnType<typeof createAdminClient>,
  orderId: string | null,
  gateway: string,
  payload: Record<string, any>,
  status: string,
): Promise<void> {
  try {
    await supabase.from('payment_logs').insert({
      order_id: orderId,
      gateway,
      payload,
      status,
    });
  } catch (err) {
    // Webhook handling must never fail because auditing failed.
    console.warn('[payments/webhook] Failed to write payment_log:', err);
  }
}