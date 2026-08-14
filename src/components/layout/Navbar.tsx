'use client';

import Link from 'next/link';
import { ChevronDown, MessageCircle, ShoppingBag } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { selectCartCount, useCartStore } from '@/lib/cart-store';
import { SearchBox } from '@/components/layout/SearchBox';
import { CartDrawer } from '@/components/layout/cart-drawer';

export interface NavCategory {
  slug: string;
  name: string;
}

export function Navbar({ categories }: { categories: NavCategory[] }) {
  const count = useCartStore(selectCartCount);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
    STORE_CONFIG.whatsapp.defaultMessage,
  )}`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand */}
            <Link
              href="/"
              className="flex shrink-0 flex-col leading-tight transition-opacity hover:opacity-80"
            >
              <span className="flex items-baseline text-lg font-bold tracking-tight text-zinc-900">
                {STORE_CONFIG.brand.name}
                <span className="text-emerald-600">.</span>
              </span>
              <span className="hidden text-[11px] font-medium text-zinc-500 md:block">
                {STORE_CONFIG.brand.tagline}
              </span>
            </Link>

            {/* Search — desktop */}
            <div className="hidden max-w-xl flex-1 sm:block">
              <SearchBox />
            </div>

            {/* Right rail */}
            <div className="flex shrink-0 items-center gap-1.5">
              {categories.length > 0 && (
                <div className="group relative hidden lg:block">
                  <button
                    type="button"
                    className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                  >
                    Categories
                    <ChevronDown className="size-3.5 text-zinc-400 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute top-full right-0 z-50 w-52 translate-y-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl shadow-black/5 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/?cat=${category.slug}#catalog`}
                        className="block rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 md:inline-flex"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>

              <button
                type="button"
                onClick={openDrawer}
                aria-label="Open cart"
                className="relative flex size-10 items-center justify-center rounded-xl text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                <ShoppingBag className="size-5" />
                {count > 0 && (
                  <span className="absolute top-0.5 right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white tabular-nums">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search — mobile */}
          <div className="pb-3 sm:hidden">
            <SearchBox />
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}