import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Flame,
  Package,
  ShieldCheck,
  Truck,
} from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import {
  fetchAllCategories,
  fetchProductBySlug,
  fetchProducts,
} from '@/lib/backend-demo';
import { formatPrice } from '@/lib/format';

import { Badge } from '@/components/ui/badge';
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
        <div className="lg:sticky lg:top-40 lg:self-start">
          <ImageViewer product={product} />
        </div>

        {/* Right — conversion panel */}
        <div className="flex flex-col">
          {/* Category + status */}
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <Badge className="gap-1 border-[#ded7cb] bg-[#eee7db] text-[#785a20]">
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
          <h1 className="brand-display mt-4 text-4xl leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            {product.title}
          </h1>
          {product.allow_customization ? (
            <div className="mt-5">
              <CustomizationOptions product={product} />
            </div>
          ) : (
            <>
              {/* Price box */}
              <div className="mt-5 border-y border-[#ded7cb] py-5">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-semibold text-zinc-900 tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price &&
                    product.original_price > product.price && (
                      <>
                        <span className="text-lg text-zinc-400 line-through tabular-nums">
                          {formatPrice(product.original_price)}
                        </span>
                        <span className="rounded-sm bg-[#785a20] px-2.5 py-1 text-xs font-bold text-white">
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
                      className="h-full rounded-sm bg-[#785a20] transition-all"
                      style={{ width: `${lowStock}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-xs text-zinc-500">
                  In stock and available to order.
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
            <div className="flex items-center gap-2 border-t border-[#ded7cb] py-4">
              <Truck className="size-4 shrink-0 text-[#8a692e]" />
              Fast Nationwide Delivery
            </div>
            <div className="flex items-center gap-2 border-t border-[#ded7cb] py-4">
              <ShieldCheck className="size-4 shrink-0 text-[#8a692e]" />
              100% Original Guarantee
            </div>
            <div className="flex items-center gap-2 border-t border-[#ded7cb] py-4">
              <CreditCard className="size-4 shrink-0 text-[#8a692e]" />
              {product.allow_customization ? 'Easypaisa transfer' : 'Cash on Delivery'}
            </div>
          </div>
        </div>
      </div>

      {/* Product information */}
      <section aria-labelledby="product-details-heading" className="mt-12 border-t border-[#ded7cb] pt-8 sm:mt-16 sm:pt-10">
        <p className="brand-eyebrow uppercase">A closer look</p>
        <h2 id="product-details-heading" className="brand-display mt-3 text-3xl tracking-tight sm:text-4xl">
          The finer details
        </h2>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <div className="min-w-0">
            {hasDescription && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#785a20]">
                  About this piece
                </h3>
                <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-[#625c52] sm:text-base sm:leading-8">
                  {product.description}
                </p>
              </div>
            )}

            {hasSpecs && (
              <div className={hasDescription ? 'mt-8' : ''}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#785a20]">
                  Product details
                </h3>
                <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
                  {specs.map(([key, value]) => (
                    <div key={key} className="flex items-baseline justify-between gap-5 border-b border-[#e5ded2] py-3.5 text-sm">
                      <dt className="text-[#756d60]">{prettyKey(key)}</dt>
                      <dd className="min-w-0 break-words text-right font-medium text-[#25231f]">
                        {prettyValue(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {!hasDescription && !hasSpecs && (
              <p className="text-sm leading-7 text-[#625c52]">
                Have a question about this piece? Get in touch and we’ll help you with the details.
              </p>
            )}
          </div>

          <aside aria-label="Delivery information" className="self-start border border-[#e5ded2] bg-[#f2ede4] p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <Truck aria-hidden="true" className="size-5 text-[#8a692e]" />
              <h3 className="brand-display text-2xl">Delivered to your door</h3>
            </div>
            <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-[#ded7cb] pb-4">
              <span className="text-sm text-[#625c52]">Nationwide delivery</span>
              <span className="text-lg font-semibold text-[#785a20]">
                {formatPrice(STORE_CONFIG.shipping.flatRateFee)}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#625c52]">
              We deliver to {STORE_CONFIG.shipping.cities.slice(0, 3).join(', ')} and all major cities across Pakistan.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#625c52]">
              <CreditCard aria-hidden="true" className="size-4 shrink-0 text-[#8a692e]" />
              {product.allow_customization ? 'Payment via Easypaisa transfer' : 'Cash on delivery available'}
            </div>
            <a
              href={`https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(`Hello! I have a question about ${product.title}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex border-b border-[#99752e]/40 pb-1 text-sm font-medium text-[#785a20] transition-colors hover:border-[#785a20] hover:text-[#25231f]"
            >
              Questions? Chat with us ↗
            </a>
          </aside>
        </div>
      </section>

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