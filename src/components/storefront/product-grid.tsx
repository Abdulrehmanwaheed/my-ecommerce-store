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
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            {categoryName}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {products.length} of {total} products — nationwide COD.
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-[color:var(--bg-card)] p-12 text-center">
          <p className="text-sm text-zinc-500">
            No products in this category yet — add some from the admin panel.
          </p>
        </div>
      ) : (
        <div className="fade-in-up grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}