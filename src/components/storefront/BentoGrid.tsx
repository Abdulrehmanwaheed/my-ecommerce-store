import Link from 'next/link';
import { ArrowRight, MessageCircle, Truck, Zap } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BentoGridProps {
  products: Product[];
}

function ProductVisual({
  product,
  className = '',
}: {
  product: Product;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col justify-end overflow-hidden bg-gradient-to-br from-primary/20 via-muted to-muted dark:from-primary/25 dark:via-zinc-900 dark:to-zinc-900 ${className}`}
    >
      <div className="absolute -top-10 -right-10 size-40 rounded-full bg-primary/20 blur-3xl" />
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-bold tracking-tight text-foreground/15 select-none">
        {product.title.charAt(0)}
      </span>
      <div className="relative z-10 p-5">
        <Badge variant="secondary" className="mb-2 bg-background/60 backdrop-blur">
          Featured
        </Badge>
        <h3 className="text-lg font-semibold tracking-tight">
          {product.title}
        </h3>
        <p className="mt-0.5 text-sm font-medium tabular-nums">
          {formatPrice(product.price)}
          {product.original_price && product.original_price > product.price && (
            <span className="ml-1.5 text-xs text-muted-foreground line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export function BentoGrid({ products }: BentoGridProps) {
  const featured = products.filter((p) => p.is_featured);
  const heroProduct = featured[0] ?? products[0];
  const homeShowcase = featured[1] ?? products.find((p) => p.category_id === 'cat-home');

  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
    STORE_CONFIG.whatsapp.defaultMessage,
  )}`;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[15rem]">
      {/* Card 1 — Large 2x2 featured tech */}
      <Link
        href={`/product/${heroProduct.slug}`}
        className="group relative col-span-1 row-span-1 overflow-hidden rounded-3xl border border-border/60 transition-colors md:col-span-2 md:row-span-2"
      >
        <ProductVisual product={heroProduct} className="h-full rounded-3xl" />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-100 transition-opacity duration-300 group-hover:opacity-90 md:opacity-0 md:group-hover:opacity-90">
          <div className="p-5 backdrop-blur-md md:bg-white/5">
            <p className="line-clamp-2 text-sm text-white/85">
              {heroProduct.description}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              Shop Now <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>

      {/* Card 2 — 1x1 COD pitch */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card p-5 transition-colors hover:border-border">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1">
            <Truck className="size-3" />
            COD
          </Badge>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight">
            {formatPrice(STORE_CONFIG.shipping.flatRateFee)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Flat COD nationwide —
            <br />
            pay at your doorstep.
          </p>
        </div>
      </div>

      {/* Card 3 — 1x2 trending kitchen/home */}
      {homeShowcase && (
        <Link
          href={`/product/${homeShowcase.slug}`}
          className="group relative overflow-hidden rounded-3xl border border-border/60 md:row-span-2"
        >
          <ProductVisual product={homeShowcase} className="h-full rounded-3xl" />
          <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 p-4">
            <Zap className="size-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Trending
            </span>
          </div>
        </Link>
      )}

      {/* Card 4 — 1x1 free delivery chip */}
      <div className="group flex flex-col justify-between gap-2 rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 to-muted p-5">
        <Badge variant="secondary" className="w-fit">
          Free Delivery
        </Badge>
        <p className="text-sm leading-snug text-muted-foreground">
          Orders above{' '}
          <span className="font-semibold text-foreground">
            {formatPrice(STORE_CONFIG.shipping.freeShippingThreshold)}
          </span>{' '}
          ship free across Pakistan.
        </p>
      </div>
    </section>
  );
}