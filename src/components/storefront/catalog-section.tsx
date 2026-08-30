'use client';

import { useMemo, useState } from 'react';
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
}: {
  products: Product[];
  categories: CatalogFilter[];
  initialCategory?: string;
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

  const activeId = slugToId.get(active) ?? active;

const visible = useMemo(() => {
    if (active === 'all') return products;
    if (active === CUSTOMIZED_CATEGORY.slug) {
      return products.filter((product) => product.allow_customization);
    }
    return products.filter((product) => product.category_id === activeId);
  }, [products, active, activeId]);

  function handleSelect(slug: string) {
    setActive(slug);
    const url = slug === 'all' ? '/' : `/?cat=${slug}`;
    router.replace(url, { scroll: false });
  }

  return (
    <section id="catalog" className="scroll-mt-24">
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