'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  LogOut,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Paintbrush,
  ShoppingBag,
  User as UserIcon,
  X,
} from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { CUSTOMIZED_CATEGORY } from '@/lib/backend-demo';
import { selectCartCount, useCartStore } from '@/lib/cart-store';
import { useAuth } from '@/lib/auth-context';
import { signOutAction } from '@/app/actions/auth';
import { SearchBox } from '@/components/layout/SearchBox';
import { CartDrawer } from '@/components/layout/cart-drawer';
import { AccountButton } from '@/components/layout/AccountButton';

export interface NavCategory {
  slug: string;
  name: string;
}

export function Navbar({ categories }: { categories: NavCategory[] }) {
  const count = useCartStore(selectCartCount);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { user, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
    STORE_CONFIG.whatsapp.defaultMessage,
  )}`;

  async function handleMobileLogout() {
    await signOutAction();
    await signOut();
    setMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand */}
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
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

              <Link
                href={`/?cat=${CUSTOMIZED_CATEGORY.slug}#catalog`}
                onClick={() => setMenuOpen(false)}
                className="hidden items-center gap-1.5 rounded-xl border border-[color:var(--accent-emerald)]/40 bg-[color:var(--accent-emerald)]/5 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-[color:var(--accent-emerald)]/10 lg:inline-flex"
              >
                <Paintbrush className="size-4 text-[color:var(--accent-emerald)]" />
                Custom Orders
              </Link>

              <AccountButton />

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

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Open menu"
                className="flex size-10 items-center justify-center rounded-xl text-zinc-900 transition-colors hover:bg-zinc-100 lg:hidden"
              >
                {menuOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}
              </button>
            </div>
          </div>

          {/* Search — mobile */}
          <div className="pb-3 sm:hidden">
            <SearchBox />
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-zinc-200/70 bg-white lg:hidden">
            <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
              {profile && (
                <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-900 text-zinc-100">
                    <UserIcon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-zinc-900">
                      {profile.full_name ?? user?.email}
                    </span>
                    <span className="block truncate text-xs text-zinc-500">
                      {user?.email}
                    </span>
                  </span>
                </div>
              )}

              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                <UserIcon className="size-4 text-zinc-400" />
                {user ? 'My Account' : 'Sign in'}
              </Link>

              <div className="pt-1">
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Categories
                </p>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/?cat=${category.slug}#catalog`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
                    >
                      <MapPin className="size-4 text-zinc-400" />
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <Link
                    href="/#catalog"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-700 hover:bg-zinc-100"
                  >
                    <MapPin className="size-4 text-zinc-400" />
                    Browse Products
                  </Link>
                )}
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>

              {user && (
                <button
                  type="button"
                  onClick={handleMobileLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              )}
            </nav>
          </div>
        )}
      </header>
      <CartDrawer />
    </>
  );
}