'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, MessageCircle, Plus, Star } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';

import { Button } from '@/components/ui/button';

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [imgFailed, setImgFailed] = useState(false);

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : null;

  const whatsappUrl = `https://wa.me/${
    STORE_CONFIG.whatsapp.phoneNumber
  }?text=${encodeURIComponent(
    `Hi ${STORE_CONFIG.brand.name}, I want to order *${product.title}* (${formatPrice(
      product.price,
    )})`,
  )}`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-0 block"
        >
          {product.images[0] && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.title}
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <span className="grid h-full w-full place-items-center text-5xl font-bold tracking-tight text-zinc-400/30 transition-transform duration-500 group-hover:scale-110">
              {product.title.charAt(0)}
            </span>
          )}
        </Link>

        {/* Live badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1.5">
          {discount && (
            <span className="rounded-full bg-[color:var(--accent-emerald)] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>
        {product.stock === 0 ? (
          <span className="absolute top-2.5 right-2.5 z-10 rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-white">
            Out of Stock
          </span>
        ) : (
          <span className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[color:var(--accent-emerald)] shadow-sm backdrop-blur">
            <span className="size-1.5 animate-pulse rounded-full bg-[color:var(--accent-emerald)]" />
            In Stock
          </span>
        )}

        {/* Quick actions overlay — slides up on hover */}
        <div className="absolute inset-x-2 bottom-2 z-10 translate-y-[120%] opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <Link
              href={`/product/${product.slug}`}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/95 text-xs font-semibold text-zinc-900 shadow-lg backdrop-blur transition-colors hover:bg-white"
            >
              <Eye className="size-3.5" />
              Quick View
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[color:var(--accent-emerald)] text-xs font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700"
            >
              <MessageCircle className="size-3.5" />
              WhatsApp Buy
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900 transition-colors hover:text-[color:var(--primary)]">
            {product.title}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs">
          <span className="flex items-center gap-0.5 text-amber-500">
            <Star className="size-3.5 fill-current" />
            <span className="font-semibold text-zinc-700">4.9</span>
          </span>
          <span className="text-zinc-400">(214 reviews)</span>
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
          {product.description}
        </p>

        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-zinc-900 tabular-nums">
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-zinc-400 line-through tabular-nums">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        <Button
          className="mt-3 w-full rounded-xl bg-zinc-900 hover:bg-zinc-800"
          disabled={product.stock === 0}
          onClick={() => {
            addItem(product, 1);
            openDrawer();
          }}
        >
          <Plus className="size-4" />
          Add to Cart
        </Button>
      </div>
    </motion.article>
  );
}