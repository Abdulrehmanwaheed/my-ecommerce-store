import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Package, RotateCcw, Star, Truck } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { fetchProductBySlug } from '@/lib/backend-demo';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ImageViewer } from '@/components/product/image-viewer';
import { BuyActions } from '@/components/product/buy-actions';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  return {
    title: product ? `${product.title} — ${STORE_CONFIG.brand.name}` : 'Product',
    description: product?.description ?? undefined,
  };
}

function prettyKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase());
}

function prettyValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(' · ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value ?? '—');
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : null;

  const specs = Object.entries(product.attributes);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to store
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Left — sticky viewer */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ImageViewer product={product} />
        </div>

        {/* Right — details */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Star className="size-3 fill-current" />
              4.8 · 214 ratings
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CheckCircle2
                className={`size-3 ${
                  product.stock > 0 ? 'text-emerald-500' : 'text-muted-foreground'
                }`}
              />
              {product.stock > 0
                ? 'In Stock — Same Day Dispatch'
                : 'Out of Stock'}
            </Badge>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-2.5">
            <span className="text-3xl font-semibold tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through tabular-nums">
                  {formatPrice(product.original_price)}
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {specs.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Key Specs
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {specs.map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl border border-border/60 bg-muted/40 px-3 py-1.5"
                  >
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                      {prettyKey(key)}
                    </span>
                    <span className="text-sm font-medium">
                      {prettyValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7">
            <BuyActions product={product} />
          </div>

          <div className="mt-7 grid grid-cols-1 gap-2.5 text-xs text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-xl border border-border/60 p-3">
              <Truck className="size-4 shrink-0 text-primary" />
              Flat {formatPrice(STORE_CONFIG.shipping.flatRateFee)} COD nationwide
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 p-3">
              <Package className="size-4 shrink-0 text-primary" />
              Free delivery over{' '}
              {formatPrice(STORE_CONFIG.shipping.freeShippingThreshold)}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 p-3">
              <RotateCcw className="size-4 shrink-0 text-primary" />
              7-day replacement window
            </div>
          </div>

          <div className="mt-8 border-t border-border/60">
            <Accordion>
              <AccordionItem value="specs">
                <AccordionTrigger>Detailed Specifications</AccordionTrigger>
                <AccordionContent>
                  <p>{product.description}</p>
                  <dl className="mt-2 space-y-1.5">
                    {specs.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-baseline justify-between gap-4 border-b border-border/40 pb-1.5"
                      >
                        <dt className="text-muted-foreground">{prettyKey(key)}</dt>
                        <dd className="font-medium">{prettyValue(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping &amp; Delivery</AccordionTrigger>
                <AccordionContent>
                  <p>
                    We ship to{' '}
                    {STORE_CONFIG.shipping.cities.slice(0, 9).join(', ')} and all
                    major cities across Pakistan.
                  </p>
                  <p>
                    Delivery charges are a flat{' '}
                    {formatPrice(STORE_CONFIG.shipping.flatRateFee)} nationwide.
                    Orders above{' '}
                    {formatPrice(STORE_CONFIG.shipping.freeShippingThreshold)}{' '}
                    qualify for free delivery. Same-day dispatch for orders placed
                    before 4 PM.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment">
                <AccordionTrigger>Payment Methods</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Pay via Cash on Delivery at your doorstep, or pay online with
                    your debit/credit card through secure payment gateways.
                  </p>
                  <p>
                    Need a different arrangement? Message us on WhatsApp and we
                    will sort it out.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </main>
  );
}