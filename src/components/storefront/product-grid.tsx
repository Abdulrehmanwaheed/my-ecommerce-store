'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import type { Product } from '@/types/database';
import { ProductCard } from '@/components/storefront/product-card';

export interface CatalogFilter {
  id: string;
  slug: string;
  name: string;
}

export function ProductGrid({
  products,
  categories,
  initialCategory = 'all',
}: {
  products: Product[];
  categories: CatalogFilter[];
  initialCategory?: string;
}) {
  const slugToId = useMemo(
    () => new Map(categories.map((category) => [category.slug, category.id])),
    [categories],
  );

  const filters: CatalogFilter[] = useMemo(
    () => [{ id: 'all', slug: 'all', name: 'All Items' }, ...categories],
    [categories],
  );

  const [active, setActive] = useState(
    filters.some((filter) => filter.slug === initialCategory)
      ? initialCategory
      : 'all',
  );

  const activeId = slugToId.get(active) ?? active;

  const visible = useMemo(
    () =>
      active === 'all'
        ? products
        : products.filter((p) => p.category_id === activeId),
    [products, active, activeId],
  );

  return (
    <section id="catalog" className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            The Catalog
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Curated picks, honest pricing — nationwide COD.
          </p>
        </div>

        <div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white p-1.5 shadow-sm scrollbar-none">
          {filters.map((filter) => (
            <button
              key={filter.slug}
              onClick={() => setActive(filter.slug)}
              className={`relative shrink-0 rounded-xl px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                active === filter.slug
                  ? 'text-white'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {active === filter.slug && (
                <motion.span
                  layoutId="catalog-tab-pill"
                  className="absolute inset-0 rounded-xl bg-zinc-900 shadow-sm"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{filter.name}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-sm text-zinc-500">
            No products in this category yet — add some from the admin panel.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      )}
    </section>
  );
}