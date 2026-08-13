'use client';

import { MessagesSquare, ShoppingBag } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';

import { Button } from '@/components/ui/button';

export function BuyActions({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const whatsappUrl = `https://wa.me/${
    STORE_CONFIG.whatsapp.phoneNumber
  }?text=${encodeURIComponent(
    `Hello ${STORE_CONFIG.brand.name}! I'd like to order *${product.title}* at ${formatPrice(
      product.price,
    )}. Please confirm availability.`,
  )}`;

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row">
      <Button
        size="lg"
        className="h-12 flex-1 rounded-xl"
        onClick={() => {
          addItem(product, 1);
          openDrawer();
        }}
      >
        <ShoppingBag className="size-4" />
        Add to Bag
      </Button>

      <Button
        size="lg"
        variant="outline"
        className="h-12 flex-1 rounded-xl border-emerald-600/40 bg-emerald-600 text-white hover:bg-emerald-500 hover:text-white"
        render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
      >
        <MessagesSquare className="size-4" />
        One-Click WhatsApp Purchase
      </Button>
    </div>
  );
}