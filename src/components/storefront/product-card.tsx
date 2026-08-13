'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Star } from 'lucide-react';

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100"
      >
        {product.images[0] && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.title}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-5xl font-bold tracking-tight text-zinc-400/30 transition-transform duration-300 group-hover:scale-110">
            {product.title.charAt(0)}
          </span>
        )}
        {discount && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
            -{discount}% OFF
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2.5 right-2.5 rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-white">
            Out of Stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900 transition-colors hover:text-zinc-600">
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
          className="mt-3 w-full rounded-xl"
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
    </motion.div>
  );
}