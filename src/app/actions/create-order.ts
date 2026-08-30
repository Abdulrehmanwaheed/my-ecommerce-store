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
      .select('id, title, price, allow_customization, custom_price, stock')
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
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for "${product.title}". Only ${product.stock} left.`);
      }
      const isCustomized = item.is_customized === true;
      if (isCustomized && !product.allow_customization) {
        throw new Error(
          `"${product.title}" does not support customization.`,
        );
      }
      const unitPrice = Number(
        isCustomized
          ? (product.custom_price ?? product.price)
          : product.price,
      );
      subtotal += unitPrice * item.quantity;
      return {
        product_id: product.id,
        quantity: item.quantity,
        unit_price: unitPrice,
        is_customized: isCustomized,
        custom_notes: isCustomized ? (item.custom_notes ?? null) : null,
        custom_images: isCustomized ? (item.custom_images ?? []) : [],
      };
    });

    const shippingFee =
      subtotal >= shipping.freeShippingThreshold ? 0 : shipping.flatRateFee;
    const totalAmount = subtotal + shippingFee;

    let customerId = input.customer_id ?? null;

    // For guest checkout, upsert a customer by phone as before.
    // For signed-up customers, keep using their existing customer row.
    if (!customerId) {
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
      customerId = customer.id;
    } else {
      // Update the signed-up customer's details (latest order info) only if
      // they are placing on their own account. Use admin to bypass RLS.
      const { createAdminClient } = await import('@/lib/supabase/admin');
      await createAdminClient()
        .from('customers')
        .upsert({
          id: customerId,
          full_name: input.customer_name.trim(),
          city: input.city ?? null,
          address: input.address ?? null,
        });
    }

    const { data: orderData, error: rpcError } = await supabase
      .rpc('create_order_with_stock_update', {
        p_customer_id: customerId,
        p_customer_name: input.customer_name.trim(),
        p_phone_whatsapp: input.phone_whatsapp.trim(),
        p_city: input.city ?? null,
        p_address: input.address ?? null,
        p_total_amount: totalAmount,
        p_shipping_fee: shippingFee,
        p_payment_method: input.payment_method,
        p_notes: input.notes ?? null,
        p_items: items,
      });

    if (rpcError) {
      const message = rpcError.message.includes('Not enough stock')
        ? 'One or more items in your cart are out of stock.'
        : `Failed to create order: ${rpcError.message}`;
      return { success: false, error: message };
    }

    const row = Array.isArray(orderData) ? orderData[0] : orderData;
    if (!row) {
      return { success: false, error: 'Order creation returned no data.' };
    }
    const createdOrder = { id: row.p_order_id, order_number: row.p_order_number };

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
      orderNumber: createdOrder.order_number,
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