'use server';

import { STORE_CONFIG } from '@/store.config';
import { createClient } from '@/lib/supabase/server';
import type { CreateOrderInput, Order } from '@/types/database';

export interface CreateOrderResult {
  success: boolean;
  error?: string;
  orderId?: string;
  orderNumber?: number;
  redirectUrl?: string;
  requiresPayment?: boolean;
  gatewayUrl?: string;
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  try {
    if (!input.customer_name?.trim()) {
      return { success: false, error: 'Customer name is required.' };
    }
    if (!input.phone_whatsapp?.trim()) {
      return { success: false, error: 'Phone number is required.' };
    }
    if (!input.items || input.items.length === 0) {
      return { success: false, error: 'Cart is empty.' };
    }
    if (!input.payment_method) {
      return { success: false, error: 'Payment method is required.' };
    }

    const { paymentMethods, shipping } = STORE_CONFIG;

    if (input.payment_method === 'COD' && !paymentMethods.cod) {
      return { success: false, error: 'Cash on Delivery is currently disabled.' };
    }
    if (input.payment_method === 'ONLINE_CARD' && !paymentMethods.cardPayment) {
      return { success: false, error: 'Online card payment is currently disabled.' };
    }

    const supabase = await createClient();

    const productIds = input.items.map((item) => item.product_id);

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, price')
      .in('id', productIds);

    if (productsError) {
      throw new Error(`Failed to load products: ${productsError.message}`);
    }

    if (!products || products.length !== productIds.length) {
      return { success: false, error: 'One or more products in your cart are no longer available.' };
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const items = input.items.map((item) => {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new Error(`Product not found: ${item.product_id}`);
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error(`Invalid quantity for product: ${product.title}`);
      }
      const unitPrice = Number(product.price);
      subtotal += unitPrice * item.quantity;
      return { product_id: product.id, quantity: item.quantity, unit_price: unitPrice };
    });

    const shippingFee =
      subtotal >= shipping.freeShippingThreshold ? 0 : shipping.flatRateFee;
    const totalAmount = subtotal + shippingFee;

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert(
        {
          full_name: input.customer_name.trim(),
          phone_whatsapp: input.phone_whatsapp.trim(),
          city: input.city ?? null,
          address: input.address ?? null,
        },
        { onConflict: 'phone_whatsapp' },
      )
      .select('id')
      .single();

    if (customerError) {
      throw new Error(`Failed to save customer: ${customerError.message}`);
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id,
        customer_name: input.customer_name.trim(),
        phone_whatsapp: input.phone_whatsapp.trim(),
        city: input.city ?? null,
        address: input.address ?? null,
        total_amount: totalAmount,
        shipping_fee: shippingFee,
        payment_method: input.payment_method,
        payment_status: 'Unpaid',
        order_status: 'Pending',
        notes: input.notes ?? null,
      })
      .select('id, order_number')
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items.map((item) => ({ ...item, order_id: order.id })));
      if (itemsError) {
        throw new Error(`Failed to save order items: ${itemsError.message}`);
      }
    }

    const createdOrder = order as Pick<Order, 'id' | 'order_number'>;

    if (input.payment_method === 'COD') {
      return {
        success: true,
        orderId: createdOrder.id,
        orderNumber: createdOrder.order_number,
        redirectUrl: `/order-success/${createdOrder.id}`,
      };
    }

    return {
      success: true,
      orderId: createdOrder.id,
      requiresPayment: true,
      gatewayUrl: `/api/payments/initiate?orderId=${createdOrder.id}`,
    };
  } catch (error) {
    console.error('[create-order] Order creation failed:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Something went wrong while placing your order.',
    };
  }
}