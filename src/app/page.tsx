import Link from 'next/link';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { fetchProducts } from '@/lib/backend-demo';
import type { Product } from '@/types/database';
import { BentoGrid } from '@/components/storefront/BentoGrid';
import { ProductGrid } from '@/components/storefront/product-grid';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
  STORE_CONFIG.whatsapp.defaultMessage,
)}`;

export default async function HomePage() {
  let products: Product[] = [];

  try {
    products = await fetchProducts();
  } catch (error) {
    console.error('Failed to load products on homepage:', error);
    products = [];
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="hero-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_75%_70%_at_50%_35%,black,transparent)]" />
        <div className="hero-blob pointer-events-none absolute -top-32 -left-24 size-[28rem] rounded-full bg-primary/25 blur-[120px]" />
        <div
          className="hero-blob pointer-events-none absolute -right-24 -bottom-32 size-[28rem] rounded-full bg-sky-500/20 blur-[120px]"
          style={{ animationDelay: '-6s' }}
        />

        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-white/70 backdrop-blur">
            <Sparkles className="size-3.5 text-primary" />
            {STORE_CONFIG.region.currencyCode} · Nationwide COD
          </span>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Next-Gen Essentials.{' '}
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Instant COD Shipping.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            {STORE_CONFIG.brand.tagline}. Flat Rs. {STORE_CONFIG.shipping.flatRateFee} delivery
            nationwide — pay only when it lands at your door.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="h-11 rounded-xl bg-white px-6 text-zinc-950 hover:bg-white/90"
              render={<Link href="#catalog" />}
            >
              Explore Catalog
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 rounded-xl border-white/20 bg-white/5 px-6 text-white hover:bg-white/10"
              render={
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />
              }
            >
              <MessageCircle className="size-4" />
              WhatsApp Order
            </Button>
          </div>
        </div>
      </section>

      {/* Bento spotlight */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <BentoGrid products={products} />
      </section>

      {/* Catalog */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <ProductGrid products={products} />
      </section>
    </main>
  );
}