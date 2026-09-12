'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Product } from '@/types/database';
import { CUSTOMIZED_CATEGORY } from '@/lib/backend-demo';
import { CategoryBar } from '@/components/storefront/CategoryBar';
import {
  ProductGrid,
  type CatalogFilter,
} from '@/components/storefront/product-grid';

export function CatalogSection({
  products,
  categories,
  initialCategory = 'all',
  query = '',
}: {
  products: Product[];
  categories: CatalogFilter[];
  initialCategory?: string;
  query?: string;
}) {
  const router = useRouter();

  const slugToId = useMemo(
    () => new Map(categories.map((category) => [category.slug, category.id])),
    [categories],
  );

  const [active, setActive] = useState(
    categories.some((category) => category.slug === initialCategory)
      ? initialCategory
      : 'all',
  );

  useEffect(() => {
    setActive(categories.some((category) => category.slug === initialCategory) ? initialCategory : 'all');
  }, [initialCategory, categories]);

  const [sort, setSort] = useState('featured');
  const activeId = slugToId.get(active) ?? active;

  const visible = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory = active === 'all' || (active === CUSTOMIZED_CATEGORY.slug ? product.allow_customization : product.category_id === activeId);
      const matchesQuery = !query || `${product.title} ${product.description ?? ''}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
    if (sort === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'featured') result = [...result].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    return result;
  }, [products, active, activeId, query, sort]);

  function handleSelect(slug: string) {
    setActive(slug);
    const params = new URLSearchParams();
    if (slug !== 'all') params.set('cat', slug);
    if (query) params.set('q', query);
    const url = `/${params.size ? `?${params}` : ''}`;
    router.replace(url, { scroll: false });
  }

  return (
    <section id="catalog" className="scroll-mt-40 pt-12 sm:pt-16">
      <div className="mx-auto mb-7 flex max-w-7xl flex-wrap items-end justify-between gap-5 px-4 sm:px-6">
        <div><p className="brand-eyebrow">FIND SOMETHING YOU LOVE</p><h2 className="brand-display mt-3 text-4xl sm:text-5xl">The collection</h2></div>
        <label className="flex items-center gap-3 text-xs text-stone-500">Sort by
          <select aria-label="Sort products" value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-10 rounded-sm border border-[#ded7cb] bg-transparent px-3 text-stone-800">
            <option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>
      {query && <p className="mx-auto mb-5 max-w-7xl px-6 text-sm text-stone-600">Search results for “{query}”</p>}
      <CategoryBar
        categories={categories}
        active={active}
        onSelect={handleSelect}
      />
      <ProductGrid
        key={active}
        products={visible}
        total={products.length}
        categoryName={
          active === 'all'
            ? 'All Collections'
            : (categories.find((category) => category.slug === active)?.name ??
              'Collection')
        }
      />
    </section>
  );
}