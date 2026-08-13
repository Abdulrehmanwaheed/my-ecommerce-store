'use client';

import { useState } from 'react';
import { MessagesSquare, Minus, Plus, ShoppingBag } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';

import { Button } from '@/components/ui/button';

export function BuyActions({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const outOfStock = product.stock === 0;

  const whatsappUrl = `https://wa.me/${
    STORE_CONFIG.whatsapp.phoneNumber
  }?text=${encodeURIComponent(
    `Hello ${STORE_CONFIG.brand.name}! I'd like to order *${qty} × ${product.title}* at ${formatPrice(
      product.price,
    )} (total ${formatPrice(product.price * qty)}). Please confirm availability.`,
  )}`;

  return (
    <div className="flex flex-col gap-3">
      {/* Quantity selector */}
      <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-2 pl-4 shadow-sm">
        <span className="text-sm text-zinc-600">Quantity</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="rounded-lg"
          >
            <Minus />
          </Button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums">
            {qty}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setQty((q) => Math.min(Math.max(product.stock, 1), q + 1))}
            aria-label="Increase quantity"
            className="rounded-lg"
          >
            <Plus />
          </Button>
        </div>
      </div>

      {/* Add to cart — solid black, full width */}
      <Button
        size="lg"
        disabled={outOfStock}
        className="h-12 w-full rounded-xl bg-zinc-900 py-3.5 text-base font-semibold hover:bg-zinc-800"
        onClick={() => {
          addItem(product, qty);
          openDrawer();
        }}
      >
        <ShoppingBag className="size-4" />
        {outOfStock
          ? 'Out of Stock'
          : `Add ${qty > 1 ? `${qty} ` : ''}to Cart — ${formatPrice(product.price * qty)}`}
      </Button>

      {/* WhatsApp 1-click — emerald */}
      <Button
        size="lg"
        className="h-12 w-full rounded-xl border-emerald-600/40 bg-emerald-600 py-3.5 text-base font-semibold text-white hover:bg-emerald-500 hover:text-white"
        render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
      >
        <MessagesSquare className="size-4" />
        Order via WhatsApp in 1-Click
      </Button>
    </div>
  );
}