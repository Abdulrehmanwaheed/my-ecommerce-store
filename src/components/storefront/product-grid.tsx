'use client';

import { useState } from 'react';

import type { Product } from '@/types/database';
import { ProductCard } from '@/components/storefront/product-card';

export interface CatalogFilter {
  id: string;
  slug: string;
  name: string;
}

export function ProductGrid({
  products,
  total,
  categoryName,
}: {
  products: Product[];
  total: number;
  categoryName: string;
}) {
  const [limit, setLimit] = useState(12);
  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-2 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium tracking-tight text-zinc-900">
            {categoryName}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {products.length} of {total} products — nationwide delivery.
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-[color:var(--bg-card)] p-12 text-center">
          <p className="text-sm text-zinc-500">
            No pieces found. Try another category or a different search.
          </p>
        </div>
      ) : (
        <div className="fade-in-up grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {products.slice(0, limit).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {products.length > limit && <div className="mt-9 text-center"><button type="button" onClick={() => setLimit((value) => value + 12)} className="boutique-button bg-transparent! text-stone-900! border border-stone-300 hover:border-stone-900">Discover more pieces</button><p className="mt-3 text-xs text-stone-500">Showing {Math.min(limit, products.length)} of {products.length}</p></div>}
    </div>
  );
}