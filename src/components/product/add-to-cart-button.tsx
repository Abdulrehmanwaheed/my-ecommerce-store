'use client';

import { Check } from 'lucide-react';

import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';
import { Button } from '@/components/ui/button';

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  return (
    <Button
      className="w-full"
      onClick={() => {
        addItem(product, 1);
        openDrawer();
      }}
    >
      <Check className="size-4" />
      Add to Cart
    </Button>
  );
}