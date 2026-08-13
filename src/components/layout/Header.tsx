'use client';

import Link from 'next/link';
import { MessageCircle, Search, ShoppingBag } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { selectCartCount, useCartStore } from '@/lib/cart-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CartDrawer } from '@/components/layout/cart-drawer';

export function Header() {
  const count = useCartStore(selectCartCount);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
    STORE_CONFIG.whatsapp.defaultMessage,
  )}`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            {STORE_CONFIG.brand.name}
            <span className="text-primary">.</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Search products"
              title="Search"
            >
              <Search />
            </Button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex"
            >
              <Badge variant="outline" className="gap-1.5 py-1 text-xs">
                <MessageCircle className="size-3" />
                WhatsApp
              </Badge>
            </a>

            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Open cart"
              onClick={openDrawer}
              className="relative"
            >
              <ShoppingBag />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums">
                  {count}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}