import { formatPrice } from '@/lib/format';
import type { Order, OrderItem } from '@/types/database';

export const SHIPPED_NOTIFICATION_BRAND = 'Awan Collection';

export function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  if (digits.startsWith('92')) return digits;
  return `92${digits}`;
}

export function buildShippedWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${normalizeWhatsAppPhone(
    phone,
  )}?text=${encodeURIComponent(message)}`;
}

export function buildShippedMessage(opts: {
  order: Order;
  items: OrderItem[];
  productFor: (
    productId: string | null,
  ) => { title: string; image?: string } | null;
}): string {
  const { order, items, productFor } = opts;
  const subtotal = order.total_amount - order.shipping_fee;
  const orderedOn = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const itemLines = items
    .map((item, index) => {
      const product = productFor(item.product_id);
      const title = product?.title || 'Custom item';
      const line = `${index + 1}. ${title} x${item.quantity} - ${formatPrice(
        item.unit_price * item.quantity,
      )}`;
      const suffix = item.is_customized ? ' (Customized)' : '';
      const photo = item.is_customized
        ? item.custom_images?.[0]
        : product?.image;
      return photo ? `${line}${suffix}\n   Photo: ${photo}` : `${line}${suffix}`;
    })
    .join('\n');

  const paymentLabel =
    order.payment_method === 'COD'
      ? 'Cash on Delivery'
      : order.payment_method === 'ONLINE_CARD'
        ? 'Card / Wallet (paid online)'
        : 'Mobile Wallet';

  const shipTo = [order.customer_name, order.address, order.city]
    .filter(Boolean)
    .join(', ');

  return [
    `Order Shipped - ${SHIPPED_NOTIFICATION_BRAND}`,
    '',
    `Hi ${order.customer_name},`,
    '',
    'Great news! Your order has been shipped and is on its way.',
    '',
    `Order #${order.order_number} | Placed on ${orderedOn}`,
    '',
    'Items:',
    itemLines,
    '',
    `Subtotal: ${formatPrice(subtotal)}`,
    `Delivery: ${formatPrice(order.shipping_fee)}`,
    `Total: ${formatPrice(order.total_amount)}`,
    `Payment: ${paymentLabel}`,
    `Ship to: ${shipTo}`,
    `Phone: ${order.phone_whatsapp}`,
    '',
    `Thank you for shopping with ${SHIPPED_NOTIFICATION_BRAND}!`,
  ].join('\n');
}