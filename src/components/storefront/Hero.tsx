import Link from 'next/link';
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from 'lucide-react';

import { site } from '@/config/site';
import { STORE_CONFIG } from '@/store.config';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';
import { Button } from '@/components/ui/button';

const TRUST_ITEMS = [
  { icon: Truck, label: 'Fast Nationwide Shipping' },
  { icon: ShieldCheck, label: '100% Authentic Guarantee' },
];

interface StackItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  original_price: number | null;
  images: string[];
}

const FALLBACK_STACK: StackItem[] = [
  {
    id: 'fb-dress',
    slug: 'ladies-fancy-dress',
    title: 'Ladies Fancy Dress',
    price: 3499,
    original_price: 4999,
    images: ['https://picsum.photos/seed/ladies-fancy-dress/900/900'],
  },
  {
    id: 'fb-bag',
    slug: 'womens-bag',
    title: "Women's Bag",
    price: 2499,
    original_price: 3499,
    images: ['https://picsum.photos/seed/womens-bag/900/900'],
  },
  {
    id: 'fb-watch',
    slug: 'watch',
    title: 'Watch',
    price: 1899,
    original_price: null,
    images: ['https://picsum.photos/seed/watch/900/900'],
  },
];

function buildStack(products: Product[]): StackItem[] {
  if (products.length === 0) return FALLBACK_STACK;

  const featured = products.filter((p) => p.is_featured);
  const picked: (Product | undefined)[] = [
    featured[0] ?? products[0],
    featured[1] ?? products.find((p) => p.id !== (featured[0] ?? products[0])?.id) ?? products[1],
    products.find(
      (p) =>
        p.id !== (featured[0] ?? products[0])?.id &&
        p.id !== (featured[1] ?? products[1])?.id,
    ) ?? products[2],
  ];

  return picked
    .filter((p): p is Product => Boolean(p))
    .slice(0, 3)
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      original_price: product.original_price,
      images: product.images,
    }));
}

function discountOf(item: StackItem): number {
  return item.original_price && item.original_price > item.price
    ? Math.round((1 - item.price / item.original_price) * 100)
    : 0;
}

export function Hero({ products }: { products: Product[] }) {
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
    STORE_CONFIG.whatsapp.defaultMessage,
  )}`;

  const stack = buildStack(products);
  const [head, second, third] = stack;

  const cardTilt = [
    '-rotate-6 -translate-x-3 lg:-translate-x-8',
    'rotate-0 z-10',
    'rotate-6 translate-x-3 lg:translate-x-8',
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 text-white shadow-2xl shadow-zinc-900/30">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-10 -right-10 size-96 rounded-full bg-[color:var(--accent-emerald)]/15 blur-3xl" />
        <div className="hero-blob pointer-events-none absolute -bottom-24 -left-16 size-96 rounded-full bg-[color:var(--primary)]/10 blur-3xl" />

        <div className="relative grid grid-cols-1 items-center gap-12 p-8 md:p-12 lg:grid-cols-12">
          {/* Left — welcome banner (7 cols) */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--accent-emerald)]/40 bg-[color:var(--accent-emerald)]/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider shadow-[0_0_24px_rgba(5,150,105,0.35)]">
              <Zap className="size-3.5" />
              Nationwide Delivery Available
            </span>

            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {site.name} — Quality You Trust
              <span className="mt-2 block text-2xl font-semibold text-white/60 sm:text-3xl">
                Style You Desire
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              Shop Footwear, Men&apos;s &amp; Kids Wear, Fancy Dresses, Bags,
              Jewelry, Cosmetics &amp; Household Items.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-[color:var(--primary)] px-7 text-base font-semibold text-zinc-950 shadow-lg shadow-[color:var(--primary)]/25 hover:bg-[color:var(--primary-hover)] hover:text-zinc-950"
                render={<Link href="#catalog" />}
              >
                Explore Catalog
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                className="h-12 rounded-xl border-emerald-600/40 bg-[color:var(--accent-emerald)] px-7 text-base font-semibold text-white hover:bg-emerald-700 hover:text-white"
                render={
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />
                }
              >
                <MessageCircle className="size-4" />
                Instant WhatsApp Order
              </Button>
            </div>

            {/* Trust ticks */}
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-white/60">
              {TRUST_ITEMS.map((item) => (
                <span key={item.label} className="flex items-center gap-2">
                  <item.icon className="size-3.5 text-[color:var(--primary)]" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — 3D layered card stack (5 cols) */}
          <div className="relative mx-auto h-[420px] w-full max-w-sm sm:h-[460px] lg:col-span-5">
            {[head, second, third].map((item, index) =>
              item ? (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  className={`hover-lift group absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/15 bg-[color:var(--bg-card)] shadow-2xl shadow-black/40 ${cardTilt[index]} ${
                    index === 1
                      ? 'z-10 hover:z-30'
                      : 'z-0 opacity-80 hover:z-30 hover:opacity-100'
                  }`}
                  style={{ height: index === 1 ? '78%' : '64%' }}
                >
                  {item.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-6xl font-bold text-zinc-300">
                      {item.title.charAt(0)}
                    </span>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />

                  {discountOf(item) > 0 && (
                    <span className="absolute top-3 right-3 rounded-full bg-[color:var(--accent-emerald)] px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
                      -{discountOf(item)}% OFF
                    </span>
                  )}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-zinc-950/50 px-2 py-1 text-[11px] font-semibold text-amber-400 backdrop-blur">
                    <Star className="size-3 fill-current" />
                    4.9
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="mt-1 flex items-baseline gap-2">
                      <span className="font-bold text-[color:var(--primary)] tabular-nums">
                        {formatPrice(item.price)}
                      </span>
                      {item.original_price &&
                        item.original_price > item.price && (
                          <span className="text-xs text-white/50 line-through tabular-nums">
                            {formatPrice(item.original_price)}
                          </span>
                        )}
                    </p>
                  </div>
                </Link>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </section>
  );
}