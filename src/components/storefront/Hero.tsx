import Link from 'next/link';
import {
  ArrowRight,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';
import { Button } from '@/components/ui/button';

const TRUST_ITEMS = [
  { icon: Truck, label: 'Fast COD Shipping' },
  { icon: ShieldCheck, label: '100% Authentic Guarantee' },
  { icon: RotateCcw, label: '7-Day Hassle-Free Returns' },
];

interface ShowcaseItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  original_price: number | null;
  images: string[];
}

const FALLBACK_SHOWCASE: ShowcaseItem[] = [
  {
    id: 'fb-sonicx',
    slug: 'sonicx-pro-anc',
    title: 'SonicX Pro ANC',
    price: 4999,
    original_price: 7690,
    images: ['https://picsum.photos/seed/sonicx-pro-anc/900/900'],
  },
  {
    id: 'fb-aerofit',
    slug: 'aerofit-series-7',
    title: 'AeroFit Series 7',
    price: 8499,
    original_price: null,
    images: ['https://picsum.photos/seed/aerofit-series-7/900/900'],
  },
  {
    id: 'fb-tehzeeb',
    slug: 'tehzeeb-hafi-collection',
    title: 'Tehzeeb Hafi Collection',
    price: 1499,
    original_price: null,
    images: ['https://picsum.photos/seed/tehzeeb-hafi-collection/900/900'],
  },
];

function buildShowcase(products: Product[]): ShowcaseItem[] {
  if (products.length === 0) return FALLBACK_SHOWCASE;

  const featured = products.filter((p) => p.is_featured);
  const picked: (Product | undefined)[] = [
    featured[0] ?? products[0],
    featured[1] ?? products.find((p) => p.id !== (featured[0] ?? products[0])?.id) ?? products[1],
    products.find((p) => p.id !== (featured[0] ?? products[0])?.id && p.id !== products[1]?.id) ?? undefined,
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

export function Hero({ products }: { products: Product[] }) {
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
    STORE_CONFIG.whatsapp.defaultMessage,
  )}`;

  const showcase = buildShowcase(products);
  const [head, ...rest] = showcase;
  const [second, third] = rest;

  const headDiscount =
    head.original_price && head.original_price > head.price
      ? Math.round((1 - head.price / head.original_price) * 100)
      : 35;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 text-white shadow-2xl shadow-zinc-900/30">
        {/* Ambient glow spheres */}
        <div className="pointer-events-none absolute -top-10 -right-10 size-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="hero-blob pointer-events-none absolute -bottom-24 -left-16 size-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative grid grid-cols-1 items-center gap-10 p-8 md:p-12 lg:grid-cols-12 lg:gap-12">
          {/* Left — copy (6 cols) */}
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Zap className="size-3.5" />
              Top Featured Gear 2026
            </span>

            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Discover Premium Tech &amp; Lifestyle Essentials
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              Fast Cash on Delivery across Pakistan | 100% Guaranteed
              Authentic.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-white px-7 text-base font-semibold text-zinc-950 hover:bg-zinc-100"
                render={<Link href="#catalog" />}
              >
                Explore Catalog
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                className="h-12 rounded-xl border-emerald-600/40 bg-emerald-600 px-7 text-base font-semibold text-white hover:bg-emerald-500 hover:text-white"
                render={
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />
                }
              >
                <MessageCircle className="size-4" />
                Chat on WhatsApp
              </Button>
            </div>
          </div>

          {/* Right — multi-product showcase (6 cols) */}
          {head && (
            <div className="grid gap-4 lg:col-span-6">
              {/* Top featured card */}
              <Link
                href={`/product/${head.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-zinc-700/50 bg-zinc-900/80 p-3 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                  {head.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={head.images[0]}
                      alt={head.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-6xl font-bold tracking-tight text-white/15">
                      {head.title.charAt(0)}
                    </span>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-transparent" />
                  <span className="absolute -left-1 top-4 -rotate-3 rounded-r-lg bg-red-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-red-600/40">
                    -{headDiscount}% OFF
                  </span>
                </div>
                <div className="flex items-end justify-between gap-3 px-2 pt-3.5 pb-1">
                  <div>
                    <p className="text-lg font-bold tracking-tight">
                      {head.title}
                    </p>
                    <p className="mt-1 flex items-baseline gap-2">
                      <span className="font-semibold text-emerald-400 tabular-nums">
                        {formatPrice(head.price)}
                      </span>
                      {head.original_price &&
                        head.original_price > head.price && (
                          <span className="text-xs text-white/40 line-through tabular-nums">
                            {formatPrice(head.original_price)}
                          </span>
                        )}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-amber-400 backdrop-blur">
                    <Star className="size-3 fill-current" />
                    4.9 · 214
                  </span>
                </div>
              </Link>

              {/* Secondary + mini cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(second ? [second, third ?? second] : []).map((item) => (
                  <Link
                    key={item.id}
                    href={`/product/${item.slug}`}
                    className="group flex items-center gap-3 rounded-2xl border border-zinc-700/50 bg-zinc-900/80 p-3 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.03]"
                  >
                    <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-zinc-800">
                      {item.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white/20">
                          {item.title.charAt(0)}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block font-semibold text-emerald-400 tabular-nums">
                        {formatPrice(item.price)}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-white/40">
                        ★ 4.9 · COD available
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trust bar */}
        <div className="relative grid grid-cols-1 divide-y divide-white/10 border-t border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-center gap-2.5 px-4 py-4 text-xs font-medium text-white/70 sm:text-sm"
            >
              <item.icon className="size-4 shrink-0 text-emerald-500" />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}