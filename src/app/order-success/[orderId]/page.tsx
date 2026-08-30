import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessagesSquare, ShoppingBag } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { DEMO_PRODUCTS, fetchOrderById } from '@/lib/backend-demo';
import { formatPrice } from '@/lib/format';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OrderSuccessPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({
  params,
}: OrderSuccessPageProps): Promise<Metadata> {
  const { orderId } = await params;
  const result = await fetchOrderById(orderId);
  return {
    title: result
      ? `Order #${result.order.order_number} Confirmed — ${STORE_CONFIG.brand.name}`
      : 'Order Confirmed',
  };
}

function titleFor(item: { product_id: string | null; product_title?: string }, index: number): string {
  if (item.product_title) return item.product_title;
  if (!item.product_id) return `Item ${index + 1}`;
  const match = DEMO_PRODUCTS.find((p) => p.id === item.product_id);
  return match?.title ?? `Item ${index + 1}`;
}

export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
  const { orderId } = await params;
  const result = await fetchOrderById(orderId);

  if (!result) notFound();

  const { order, items } = result;
  const subtotal = order.total_amount - order.shipping_fee;
  const isCod = order.payment_method === 'COD';

  const trackUrl = `https://wa.me/${
    STORE_CONFIG.whatsapp.phoneNumber
  }?text=${encodeURIComponent(
    `Hi! I placed order #${order.order_number}. Please update me on courier tracking.`,
  )}`;

  return (
    <main className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      {/* Animated success header */}
      <div className="flex flex-col items-center text-center">
        <div
          className="grid size-24 place-items-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30"
          style={{ animation: 'success-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both' }}
        >
          <svg viewBox="0 0 52 52" className="size-12" aria-hidden="true">
            <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2.5" className="check-circle" />
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 27 l8 8 l15 -16"
              className="check-mark"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
          Order Confirmed
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you, {order.customer_name.split(' ')[0]}! We are preparing your
          order for dispatch.
        </p>
      </div>

      {/* Receipt card */}
      <div className="mt-9 overflow-hidden rounded-3xl border border-border/60 bg-zinc-950 text-white shadow-2xl shadow-black/20">
        <div className="border-b border-dashed border-white/15 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold tracking-tight">
              {STORE_CONFIG.brand.name}.
            </span>
            <span className="text-[11px] uppercase tracking-widest text-white/40">
              Invoice
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/40">
                Order ID
              </p>
              <p className="mt-0.5 font-mono text-xs text-white/90">
                #{order.order_number}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/40">
                Date
              </p>
              <p className="mt-0.5 text-xs text-white/90">
                {new Date(order.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/40">
                Status
              </p>
              <p className="mt-0.5 text-xs text-white/90">
                {order.order_status} · {order.payment_status}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/40">
                Payment
              </p>
              <p className="mt-0.5 text-xs text-white/90">
                {isCod ? 'Cash on Delivery' : 'Online Payment'}
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-dashed border-white/15 p-6">
          <p className="text-[11px] uppercase tracking-wider text-white/40">
            Deliver To
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {order.customer_name}
            <span className="ml-2 text-xs font-normal text-white/50">
              {order.phone_whatsapp}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-white/60">
            {order.address ?? 'Address on file'}
            {order.city ? `, ${order.city}` : ''}
          </p>
        </div>

        <div className="border-b border-dashed border-white/15 p-6">
          <p className="text-[11px] uppercase tracking-wider text-white/40">
            Items
          </p>
          <ul className="mt-3 space-y-2.5">
            {items.map((item, index) => (
              <li key={item.id}>
                <div className="flex items-center gap-3 text-sm">
                  {item.product_images?.[0] && (
                    <img
                      src={item.product_images[0]}
                      alt={titleFor(item, index)}
                      className="size-12 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex flex-1 items-baseline justify-between gap-4">
                    <span className="text-white/85">
                      {item.quantity} × {titleFor(item, index)}
                    {item.is_customized && (
                      <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                        ✨ Customized
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-white/90">
                    {formatPrice(item.unit_price * item.quantity)}
                   </span>
                  </div>
                </div>
                {item.is_customized && (
                  <div className="mt-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60">
                    {item.custom_notes && (
                      <p className="leading-relaxed">
                        <span className="font-semibold text-white/80">
                          Instructions:
                        </span>{' '}
                        {item.custom_notes}
                      </p>
                    )}
                    {item.custom_images && item.custom_images.length > 0 && (
                      <p className="mt-1">
                        <span className="font-semibold text-white/80">
                          Reference photos:
                        </span>{' '}
                        {item.custom_images.map((url, urlIndex) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-300 underline underline-offset-2 hover:text-amber-200"
                          >
                            Photo {urlIndex + 1}
                            {urlIndex < item.custom_images!.length - 1
                              ? ', '
                              : ''}
                          </a>
                        ))}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6">
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-white/60">
              <span>Subtotal</span>
              <span className="font-mono text-xs tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-white/60">
              <span>Shipping</span>
              <span className="font-mono text-xs tabular-nums">
                {order.shipping_fee === 0 ? 'Free' : formatPrice(order.shipping_fee)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3.5">
            <span className="text-xs font-medium uppercase tracking-widest text-white/60">
              {isCod ? 'COD Amount Payable' : 'Amount Paid'}
            </span>
            <span className="text-xl font-bold tabular-nums">
              {formatPrice(order.total_amount)}
            </span>
          </div>

          {isCod && order.payment_status === 'Unpaid' && (
            <p className="mt-3 text-center text-[11px] text-white/40">
              Keep exact cash ready — our rider will collect it at delivery.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-7 flex flex-col gap-2.5">
        <Button
          size="lg"
          className="h-12 w-full rounded-xl border-emerald-600/40 bg-emerald-600 text-white hover:bg-emerald-500 hover:text-white"
          variant="outline"
          render={<a href={trackUrl} target="_blank" rel="noopener noreferrer" />}
        >
          <MessagesSquare className="size-4" />
          Track Order Status on WhatsApp
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="h-12 w-full rounded-xl"
          render={<Link href="/#catalog" />}
        >
          <ShoppingBag className="size-4" />
          Continue Shopping
        </Button>
      </div>

      <div className="mt-8 text-center">
        <Badge variant="secondary">
          Questions? Call {STORE_CONFIG.brand.supportPhone}
        </Badge>
      </div>
    </main>
  );
}