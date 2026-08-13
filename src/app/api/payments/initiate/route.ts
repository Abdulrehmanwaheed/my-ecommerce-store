import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getActiveGateway } from '@/lib/payments/gateway';
import { STORE_CONFIG } from '@/store.config';

interface OrderForInitiate {
  id: string;
  order_number: number;
  customer_name: string;
  phone_whatsapp: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
}

async function handleInitiate(orderId: string | null) {
  if (!orderId) {
    return NextResponse.json(
      { success: false, error: 'orderId is required' },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const gateway = getActiveGateway();

  const { data: order, error } = await supabase
    .from('orders')
    .select(
      'id, order_number, customer_name, phone_whatsapp, total_amount, payment_method, payment_status',
    )
    .eq('id', orderId)
    .maybeSingle<OrderForInitiate>();

  if (error || !order) {
    return NextResponse.json(
      { success: false, error: 'Order not found' },
      { status: 404 },
    );
  }

  if (order.payment_method === 'COD') {
    return NextResponse.json(
      { success: false, error: 'COD orders do not require a payment gateway' },
      { status: 400 },
    );
  }

  if (order.payment_status !== 'Unpaid') {
    return NextResponse.json(
      { success: false, error: 'Order is not eligible for payment' },
      { status: 400 },
    );
  }

  const { checkoutUrl, gatewayTransactionId } = await gateway.initiate({
    orderId: order.id,
    amount: Number(order.total_amount),
    currency: STORE_CONFIG.region.currencyCode,
    customerName: order.customer_name,
    customerPhone: order.phone_whatsapp,
    description: `Order #${order.order_number}`,
  });

  try {
    await supabase.from('payment_logs').insert({
      order_id: order.id,
      gateway: gateway.id,
      payload: {
        orderId: order.id,
        orderNumber: order.order_number,
        amount: Number(order.total_amount),
        currency: STORE_CONFIG.region.currencyCode,
        gatewayTransactionId,
        checkoutUrl,
      },
      status: 'initiated',
    });
  } catch (logError) {
    console.warn('[payments/initiate] Failed to write payment_log:', logError);
  }

  return NextResponse.json({
    success: true,
    gateway: gateway.id,
    checkoutUrl,
    gatewayTransactionId,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return handleInitiate(searchParams.get('orderId'));
}

export async function POST(request: Request) {
  let orderId: string | null = null;
  try {
    const body = await request.json();
    orderId = body?.orderId ?? null;
  } catch {
    // No/invalid JSON body — handled by handleInitiate's guard.
  }
  return handleInitiate(orderId);
}