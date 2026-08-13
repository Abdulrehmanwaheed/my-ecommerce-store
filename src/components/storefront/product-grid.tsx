'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import type { Product } from '@/types/database';
import { ProductCard } from '@/components/storefront/product-card';

type FilterId = 'all' | 'cat-tech' | 'cat-home';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All Items' },
  { id: 'cat-tech', label: 'Smart Tech' },
  { id: 'cat-home', label: 'Home & Utility' },
];

export function ProductGrid({ products }: { products: Product[] }) {
  const [active, setActive] = useState<FilterId>('all');

  const visible = useMemo(
    () =>
      active === 'all'
        ? products
        : products.filter((p) => p.category_id === active),
    [products, active],
  );

  return (
    <section id="catalog" className="scroll-mt-24">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">The Catalog</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Minimal picks, honest pricing.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 p-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActive(filter.id)}
              className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                active === filter.id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {active === filter.id && (
                <motion.span
                  layoutId="catalog-tab-pill"
                  className="absolute inset-0 rounded-full bg-background shadow-sm ring-1 ring-border/60"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
    </section>
  );
}