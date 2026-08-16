'use client';

import { useState } from 'react';
import {
  ExternalLink,
  ImageIcon,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { formatPrice } from '@/lib/format';
import type { Order, OrderItem, OrderStatus, Product } from '@/types/database';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const statusChip: Record<OrderStatus, string> = {
  Pending: 'bg-amber-500/15 text-amber-400',
  Processing: 'bg-sky-500/15 text-sky-400',
  Shipped: 'bg-indigo-500/15 text-indigo-400',
  Delivered: 'bg-emerald-500/15 text-emerald-400',
  Cancelled: 'bg-red-500/15 text-red-400',
};

const statusBar: Record<OrderStatus, string> = {
  Pending: 'bg-amber-500',
  Processing: 'bg-sky-500',
  Shipped: 'bg-indigo-500',
  Delivered: 'bg-emerald-500',
  Cancelled: 'bg-red-500',
};

function variantOf(product: Product | undefined): string | null {
  if (!product) return null;
  const color = Array.isArray(product.attributes?.colors)
    ? product.attributes.colors[0]
    : product.attributes?.color;
  const size = product.attributes?.size;
  if (color && size) return `${color} / ${size}`;
  if (color) return String(color);
  if (size) return String(size);
  return null;
}

export function OrderDetailsModal({
  order,
  items,
  productsById,
  onClose,
  onStatusChange,
}: {
  order: Order;
  items: OrderItem[];
  productsById: Map<string, Product>;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  const isCod = order.payment_method === 'COD';
  const itemsTotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
  const hasCustomized = items.some((item) => item.is_customized);

  const whatsappUrl = `https://wa.me/${
    order.phone_whatsapp.replace(/^0/, '92')
  }?text=${encodeURIComponent(
    [
      `Hi ${order.customer_name}! Regarding your order #${order.order_number} from ${STORE_CONFIG.brand.name}:`,
      '',
      `Status: ${order.order_status}`,
      `Total: ${formatPrice(order.total_amount)} (${isCod ? 'Cash on Delivery' : order.payment_method})`,
      '',
      'Items:',
      ...items.map((item) => {
        const product = productsById.get(item.product_id ?? '');
        const line = `• ${item.quantity} × ${product?.title ?? `Item #${item.id.slice(0, 6)}`} — ${formatPrice(item.unit_price * item.quantity)}`;
        if (item.is_customized) {
          const customLines = [`   ✨ CUSTOMIZED`];
          if (item.custom_notes) customLines.push(`   📝 ${item.custom_notes}`);
          if (item.custom_images?.length) {
            customLines.push(`   🖼️ ${item.custom_images.join(', ')}`);
          }
          return `${line}\n${customLines.join('\n')}`;
        }
        return line;
      }),
    ].join('\n'),
  )}`;

  async function handleStatusChange(status: OrderStatus) {
    setBusy(true);
    try {
      await onStatusChange(order.id, status);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto border-zinc-800 bg-zinc-950 p-0 text-white sm:max-w-xl">
        <SheetHeader className="border-b border-zinc-800 p-5">
          <SheetTitle className="text-zinc-100">
            Order #{order.order_number}
            {hasCustomized && (
              <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                ✨ CUSTOM ORDER
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Order details and management
          </SheetDescription>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                statusChip[order.order_status]
              }`}
            >
              {order.order_status}
            </span>
            <span className="text-xs text-zinc-500">
              {new Date(order.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}{' '}
              · {order.payment_status}
            </span>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 p-5">
          {/* Customer & shipping */}
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Customer &amp; Shipping Details
            </h3>
            <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {order.customer_name}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                    <Phone className="size-3" />
                    {order.phone_whatsapp}
                  </p>
                  <p className="mt-1 flex items-start gap-1.5 text-xs text-zinc-400">
                    <MapPin className="mt-0.5 size-3 shrink-0" />
                    {order.address ?? 'Address on file'}
                    {order.city ? `, ${order.city}` : ''}
                  </p>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
                >
                  <MessageCircle className="size-3.5" />
                  Contact on WhatsApp
                </a>
              </div>
            </div>
          </section>

          {/* Itemized summary */}
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              What to Ship
            </h3>
            <ul className="mt-3 space-y-3">
              {items.map((item, index) => {
                const product = productsById.get(item.product_id ?? '');
                const variant = variantOf(product);
                return (
                  <li
                    key={item.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3.5"
                  >
                    <div className="flex gap-3">
                      <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-zinc-800 text-lg font-bold text-zinc-500">
                        {product?.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          product?.title.charAt(0) ?? `#${index + 1}`
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-zinc-100">
                            {product?.title ?? `Item ${index + 1}`}
                          </p>
                          <p className="shrink-0 text-sm font-bold text-amber-400 tabular-nums">
                            {formatPrice(item.unit_price * item.quantity)}
                          </p>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {item.quantity} × {formatPrice(item.unit_price)}
                          {variant ? ` · Variant: ${variant}` : ''}
                        </p>
                        {item.is_customized && (
                          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                            <Sparkles className="size-3" />
                            CUSTOM ORDER ITEM
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customization details */}
                    {item.is_customized && (
                      <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                          ✨ Customization details
                        </p>
                        {item.custom_notes && (
                          <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                            {item.custom_notes}
                          </p>
                        )}
                        {item.custom_images && item.custom_images.length > 0 && (
                          <div className="mt-2.5">
                            <p className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500">
                              <ImageIcon className="size-3" />
                              Reference photos
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-2">
                              {item.custom_images.map((url, urlIndex) => (
                                <a
                                  key={url}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative grid size-16 place-items-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={url}
                                    alt={`Reference ${urlIndex + 1}`}
                                    className="h-full w-full object-cover transition-opacity group-hover:opacity-60"
                                  />
                                  <ExternalLink className="absolute size-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Totals */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Items Total</span>
                <span className="font-mono text-xs tabular-nums text-zinc-300">
                  {formatPrice(itemsTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Shipping Fee</span>
                <span className="font-mono text-xs tabular-nums text-zinc-300">
                  {order.shipping_fee === 0
                    ? 'Free'
                    : formatPrice(order.shipping_fee)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-800 pt-2.5">
                <span className="font-semibold text-zinc-100">
                  Grand Total
                </span>
                <span className="text-lg font-extrabold text-emerald-400 tabular-nums">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                {isCod ? 'Cash on Delivery' : order.payment_method}
                {order.payment_gateway_ref
                  ? ` · Txn: ${order.payment_gateway_ref}`
                  : ''}
              </p>
            </div>
          </section>

          {/* Status management */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Order Status
                </h3>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  Pending → Processing → Shipped → Delivered (Completed)
                </p>
              </div>
              <div className="flex items-center gap-2">
                {busy && <Loader2 className="size-4 animate-spin text-zinc-500" />}
                <Select
                  value={order.order_status}
                  onValueChange={(value) => {
                    if (value) handleStatusChange(value as OrderStatus);
                  }}
                  disabled={busy}
                >
                  <SelectTrigger className="w-40 border-zinc-700 bg-zinc-800 text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUS_FLOW.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === 'Delivered'
                          ? 'Delivered (Completed)'
                          : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {ORDER_STATUS_FLOW.map((status, index) => (
                <span
                  key={status}
                  className={`h-1.5 flex-1 rounded-full ${
                    ORDER_STATUS_FLOW.indexOf(order.order_status) >= index
                      ? statusBar[status]
                      : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="border-t border-zinc-800 p-5">
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white"
            onClick={onClose}
          >
            Close Details
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}