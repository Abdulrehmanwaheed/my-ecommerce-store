import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Flame,
  MessagesSquare,
  Package,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import {
  fetchAllCategories,
  fetchProductBySlug,
  fetchProducts,
} from '@/lib/backend-demo';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';

import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ImageViewer } from '@/components/product/image-viewer';
import { BuyActions } from '@/components/product/buy-actions';
import { CustomizationOptions } from '@/components/product/customization-options';
import { ProductCard } from '@/components/storefront/product-card';

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

  const [categories, allProducts] = await Promise.all([
    fetchAllCategories(),
    fetchProducts(),
  ]);

  const category =
    categories.find(
      (c) => c.id === product.category_id || c.slug === product.category_id,
    ) ?? null;

  const related = allProducts
    .filter(
      (p) => p.id !== product.id && p.category_id === product.category_id,
    )
    .slice(0, 10);

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : null;

  const specs = Object.entries(product.attributes);
  const lowStock =
    product.stock > 0 && product.stock <= 10
      ? Math.max(5, Math.round((product.stock / 10) * 100))
      : 100;

  const hasDescription = Boolean(product.description?.trim());
  const hasSpecs = specs.length > 0;
  // Reviews are placeholder-only for now (no reviews system yet), so hide the
  // empty reviews box until real review data is available.
  const hasReviews = false;

  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
    `Hello ${STORE_CONFIG.brand.name}! I ordered *${product.title}* and would like to leave a review.`,
  )}`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="size-4" />
        Back to store
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Left — media */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ImageViewer product={product} />
        </div>

        {/* Right — conversion panel */}
        <div className="flex flex-col">
          {/* Category + status */}
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <Badge className="gap-1 border-emerald-600/40 bg-emerald-50 text-emerald-700">
                {category.name}
              </Badge>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">
              <CheckCircle2
                className={`size-3 ${
                  product.stock > 0 ? 'text-emerald-500' : 'text-zinc-400'
                }`}
              />
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Title + rating */}
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            {product.title}
          </h1>
          <div className="mt-2 flex items-center gap-1.5 text-sm">
            <span className="flex items-center gap-0.5 text-amber-500">
              <Star className="size-4 fill-current" />
              <span className="font-bold text-zinc-900">4.9</span>
            </span>
            <span className="text-zinc-500">· 214 reviews</span>
          </div>

          {product.allow_customization ? (
            <div className="mt-5">
              <CustomizationOptions product={product} />
            </div>
          ) : (
            <>
              {/* Price box */}
              <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-zinc-900 tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price &&
                    product.original_price > product.price && (
                      <>
                        <span className="text-lg text-zinc-400 line-through tabular-nums">
                          {formatPrice(product.original_price)}
                        </span>
                        <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                          Save {discount}%
                        </span>
                      </>
                    )}
                </div>
                <p className="mt-1.5 text-[11px] text-zinc-500">
                  Inclusive of all taxes · Flat{' '}
                  {formatPrice(STORE_CONFIG.shipping.flatRateFee)} delivery
                  nationwide
                </p>
              </div>
            </>
          )}

          {/* Stock scarcity */}
          {product.stock > 0 ? (
            <div className="mt-4">
              {product.stock <= 10 ? (
                <>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                    <Flame className="size-3.5" />
                    Only {product.stock} left in stock — order soon!
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-red-600 transition-all"
                      style={{ width: `${lowStock}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-xs text-zinc-500">
                  In stock — same-day dispatch before 4 PM.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-xs font-semibold text-red-600">
              Out of stock — message us on WhatsApp for restock updates.
            </p>
          )}

          <p className="mt-5 text-sm leading-relaxed text-zinc-600">
            {product.description}
          </p>

          {/* Actions */}
          {!product.allow_customization && (
            <div className="mt-6">
              <BuyActions product={product} />
            </div>
          )}

          {/* Trust icons */}
          <div className="mt-6 grid grid-cols-1 gap-2.5 text-xs text-zinc-600 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <Truck className="size-4 shrink-0 text-emerald-600" />
              Fast Nationwide Delivery
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
              100% Original Guarantee
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <CreditCard className="size-4 shrink-0 text-emerald-600" />
              Secure Online Payment
            </div>
          </div>
        </div>
      </div>

      {/* Bottom tabs — only render tabs that have real content */}
      {(hasDescription || hasSpecs || hasReviews) && (
        <div className="mt-12">
          <Tabs defaultValue={hasDescription ? 'description' : hasSpecs ? 'specs' : 'reviews'}>
            <TabsList className="w-full justify-start rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm sm:w-fit">
              {hasDescription && (
                <TabsTrigger value="description">Description &amp; Details</TabsTrigger>
              )}
              {hasSpecs && <TabsTrigger value="specs">Specifications</TabsTrigger>}
              {hasReviews && <TabsTrigger value="reviews">Reviews</TabsTrigger>}
            </TabsList>

            {hasDescription && (
              <TabsContent
                value="description"
                className="mt-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-lg font-bold text-zinc-900">
                  About this product
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {product.description}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  We ship to {STORE_CONFIG.shipping.cities.slice(0, 9).join(', ')}{' '}
                  and all major cities across Pakistan. Delivery is a flat{' '}
                  {formatPrice(STORE_CONFIG.shipping.flatRateFee)} nationwide.
                  Same-day dispatch for orders placed before 4 PM.
                </p>
              </TabsContent>
            )}

            {hasSpecs && (
              <TabsContent
                value="specs"
                className="mt-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {specs.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-baseline justify-between gap-4 border-b border-zinc-100 pb-2"
                    >
                      <dt className="text-sm text-zinc-500">{prettyKey(key)}</dt>
                      <dd className="text-right text-sm font-medium text-zinc-900">
                        {prettyValue(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </TabsContent>
            )}

            {hasReviews && (
              <TabsContent
                value="reviews"
                className="mt-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-6">
                  <div className="text-center">
                    <p className="text-5xl font-extrabold text-zinc-900">4.9</p>
                    <p className="mt-1 flex items-center justify-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="size-4 fill-current" />
                      ))}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">214 verified reviews</p>
                  </div>
                  <div className="flex-1 text-sm text-zinc-600">
                    <p className="font-medium text-zinc-900">
                      Loved by customers across Pakistan
                    </p>
                    <p className="mt-1">
                      Written reviews load on this template. Share your experience
                      with us on WhatsApp when your order arrives.
                    </p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <MessagesSquare className="size-4" />
                      Leave a review on WhatsApp
                    </a>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-14">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              You may also like
            </h2>
            <Link
              href={`/?cat=${category?.slug ?? ''}#catalog`}
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              <Package className="size-4" />
              View all
            </Link>
          </div>
          <div className="scrollbar-none -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
            {related.map((relatedProduct) => (
              <div key={relatedProduct.id} className="w-52 shrink-0">
                <ProductCard product={relatedProduct} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}