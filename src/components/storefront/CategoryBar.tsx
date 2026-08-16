'use client';

import {
  Baby,
  Footprints,
  Gem,
  Home,
  Package,
  Palette,
  Shirt,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

import type { CatalogFilter } from '@/components/storefront/product-grid';

const CATEGORY_ICONS: Record<string, { icon: typeof Package; label: string }> = {
  footwear: { icon: Footprints, label: 'Footwear' },
  'mens-wear': { icon: Shirt, label: "Men's Wear" },
  'kids-wear': { icon: Baby, label: "Kids Wear" },
  dresses: { icon: Sparkles, label: 'Fancy Dresses' },
  'fancy-dresses': { icon: Sparkles, label: 'Fancy Dresses' },
  Bags: { icon: ShoppingBag, label: "Women's Bags" },
  bags: { icon: ShoppingBag, label: "Women's Bags" },
  'women-bags': { icon: ShoppingBag, label: "Women's Bags" },
  jewelry: { icon: Gem, label: 'Watches & Jewelry' },
  'watches-jewelry': { icon: Gem, label: 'Watches & Jewelry' },
  household: { icon: Home, label: 'Household' },
  'household-items': { icon: Home, label: 'Household' },
  cosmetics: { icon: Palette, label: 'Cosmetics' },
  'cosmetics-beauty': { icon: Palette, label: 'Cosmetics' },
};

function iconFor(category: CatalogFilter) {
  const key = category.slug.toLowerCase().replace(/\s+/g, '-');
  return (
    CATEGORY_ICONS[key] ??
    CATEGORY_ICONS[category.name.toLowerCase().replace(/\s+/g, '-')] ?? {
      icon: Package,
      label: category.name,
    }
  );
}

export function CategoryBar({
  categories,
  active,
  onSelect,
}: {
  categories: CatalogFilter[];
  active: string;
  onSelect: (slug: string) => void;
}) {
  const filters: CatalogFilter[] = [
    { id: 'all', slug: 'all', name: 'All Items' },
    ...categories,
  ];

  return (
    <div className="w-full max-w-7xl mx-auto mt-6 px-4 py-4 sm:py-6">
      <div className="scrollbar-none flex flex-nowrap items-center justify-between gap-4 overflow-x-auto sm:gap-6 lg:grid lg:grid-cols-9 lg:gap-4">
        {filters.map((filter) => {
          const { icon: Icon, label } = iconFor(filter);
          const isActive = active === filter.slug;

          return (
            <button
              key={filter.slug}
              type="button"
              onClick={() => onSelect(filter.slug)}
              className="story-bounce group flex shrink-0 flex-col items-center justify-center"
              aria-label={`Filter by ${filter.name}`}
            >
                <span
                className={`story-ring grid size-16 sm:size-20 place-items-center rounded-full bg-[color:var(--bg-card)] shadow-md transition-shadow ${
                  isActive ? 'shadow-[0_0_18px_var(--border-glow)]' : ''
                }`}
              >
                <span className="grid size-full place-items-center rounded-full bg-[color:var(--bg-card)] transition-colors group-hover:bg-white">
                  <Icon
                    className={`size-8 transition-colors ${
                      isActive
                        ? 'text-[color:var(--primary)]'
                        : 'text-zinc-600 group-hover:text-[color:var(--primary)]'
                    }`}
                  />
                </span>
              </span>
              <span
                className={`mt-2 max-w-[100px] text-center text-xs font-semibold tracking-wide whitespace-nowrap ${
                  isActive
                    ? 'text-[color:var(--primary)]'
                    : 'text-zinc-600 group-hover:text-zinc-900'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}