'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';

import { Button } from '@/components/ui/button';

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

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
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-lg hover:shadow-black/5"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-gradient-to-br from-muted via-background to-muted"
      >
        <span className="grid h-full w-full place-items-center text-5xl font-bold tracking-tight text-foreground/10 transition-transform duration-300 group-hover:scale-110">
          {product.title.charAt(0)}
        </span>
        {discount && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold tracking-tight transition-colors hover:text-primary">
            {product.title}
          </h3>
        </Link>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-base font-semibold tabular-nums">
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        <Button
          className="mt-3 w-full rounded-xl"
          onClick={() => {
            addItem(product, 1);
            openDrawer();
          }}
        >
          <Plus className="size-4" />
          Quick Add
        </Button>
      </div>
    </motion.div>
  );
}