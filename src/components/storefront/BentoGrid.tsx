import Link from 'next/link';
import { ArrowRight, MessageCircle, Truck, Zap } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';
import { ProductImage } from '@/components/storefront/ProductImage';

import { Badge } from '@/components/ui/badge';

interface BentoGridProps {
  products: Product[];
}

function ProductVisual({
  product,
  className = '',
  imageClassName = '',
}: {
  product: Product;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-muted dark:from-primary/25 dark:via-zinc-900 dark:to-zinc-900 ${className}`}
    >
      {product.images[0] && (
        <ProductImage
          src={product.images[0]}
          alt={product.title}
          letter={product.title.charAt(0)}
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageClassName}`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
    </div>
  );
}

export function BentoGrid({ products }: BentoGridProps) {
  const featured = products.filter((p) => p.is_featured);
  const heroProduct = featured[0] ?? products[0];
  const homeShowcase =
    featured[1] ?? products.find((p) => p.category_id === 'cat-home') ?? products[1];

  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
    STORE_CONFIG.whatsapp.defaultMessage,
  )}`;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[13rem]">
      {/* Card 1 — Large 2x2 featured product */}
      {heroProduct ? (
        <Link
          href={`/product/${heroProduct.slug}`}
          className="group relative col-span-1 row-span-1 overflow-hidden rounded-2xl border border-zinc-200/80 shadow-sm transition-all duration-300 hover:shadow-md md:col-span-2 md:row-span-2"
        >
          <ProductVisual
            product={heroProduct}
            className="h-full rounded-2xl"
          />
          <div className="absolute inset-x-0 bottom-0 z-10 p-6">
            <div className="flex items-center gap-2">
              <Badge className="gap-1 bg-emerald-600 px-2.5 py-1 text-white">
                <Zap className="size-3" />
                Featured
              </Badge>
              {heroProduct.original_price &&
                heroProduct.original_price > heroProduct.price && (
                  <Badge className="gap-1 bg-red-600 px-2.5 py-1 text-white">
                    -
                    {Math.round(
                      (1 - heroProduct.price / heroProduct.original_price) * 100,
                    )}
                    %
                  </Badge>
                )}
            </div>
            <h3 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
              {heroProduct.title}
            </h3>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-semibold text-white tabular-nums">
                {formatPrice(heroProduct.price)}
              </span>
              {heroProduct.original_price &&
                heroProduct.original_price > heroProduct.price && (
                  <span className="text-sm text-white/60 line-through tabular-nums">
                    {formatPrice(heroProduct.original_price)}
                  </span>
                )}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              Shop Now
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ) : (
        <div className="col-span-1 row-span-1 flex items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-muted/30 p-8 text-center md:col-span-2 md:row-span-2">
          <p className="text-sm text-zinc-500">
            Catalog coming soon —
            <br />
            add products from the admin panel.
          </p>
        </div>
      )}

      {/* Card 2 — 1x1 COD pitch */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
        <Badge variant="outline" className="w-fit gap-1 border-emerald-600/40 text-emerald-700">
          <Truck className="size-3" />
          COD
        </Badge>
        <div>
          <p className="text-3xl font-bold tracking-tight text-zinc-900">
            {formatPrice(STORE_CONFIG.shipping.flatRateFee)}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Flat COD nationwide —
            <br />
            pay at your doorstep.
          </p>
        </div>
      </div>

      {/* Card 3 — 1x2 trending secondary product */}
      {homeShowcase && (
        <Link
          href={`/product/${homeShowcase.slug}`}
          className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 shadow-sm transition-all duration-300 hover:shadow-md md:row-span-2"
        >
          <ProductVisual
            product={homeShowcase}
            className="h-full rounded-2xl"
            imageClassName="opacity-80 group-hover:opacity-100"
          />
          <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-1.5 p-4">
            <Zap className="size-4 text-emerald-500" />
            <span className="text-[11px] font-semibold tracking-widest text-white uppercase">
              Trending
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 p-4">
            <h3 className="text-sm font-semibold text-white">
              {homeShowcase.title}
            </h3>
            <span className="text-xs text-white/70 tabular-nums">
              {formatPrice(homeShowcase.price)}
            </span>
          </div>
        </Link>
      )}

      {/* Card 4 — 2-col free delivery chip */}
      <div className="flex flex-col justify-between gap-2 rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-md md:col-span-1">
        <Badge className="w-fit bg-emerald-600 text-white">
          Free Delivery
        </Badge>
        <p className="text-sm leading-snug text-zinc-600">
          Orders above{' '}
          <span className="font-semibold text-zinc-900">
            {formatPrice(STORE_CONFIG.shipping.freeShippingThreshold)}
          </span>{' '}
          ship free across Pakistan.
        </p>
      </div>

      {/* Card 5 — 1x1 WhatsApp order pitch */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col justify-between gap-2 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md"
      >
        <Badge className="w-fit gap-1 bg-emerald-600 text-white">
          <MessageCircle className="size-3" />
          WhatsApp Orders
        </Badge>
        <p className="text-sm leading-snug text-zinc-600">
          Prefer to chat? Place your order directly on WhatsApp — we confirm
          instantly.
        </p>
      </a>
    </section>
  );
}