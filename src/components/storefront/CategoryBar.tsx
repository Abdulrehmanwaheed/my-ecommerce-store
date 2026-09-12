'use client';

import {
  Baby,
  Footprints,
  Gem,
  Home,
  Package,
  Paintbrush,
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
  customized: { icon: Paintbrush, label: 'Customized Items' },
  'customized-items': { icon: Paintbrush, label: 'Customized Items' },
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-3 lg:flex-wrap" aria-label="Product categories">
        {filters.map((filter) => {
          const { icon: Icon } = iconFor(filter);
          const isActive = active === filter.slug;
          return (
            <button key={filter.slug} type="button" onClick={() => onSelect(filter.slug)} aria-pressed={isActive}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-medium transition-colors ${isActive ? 'border-[#25231f] bg-[#25231f] text-white' : 'border-[#ded7cb] bg-transparent text-stone-600 hover:border-[#9b7730] hover:text-stone-950'}`}>
              <Icon className="size-3.5" strokeWidth={1.5} />{filter.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
