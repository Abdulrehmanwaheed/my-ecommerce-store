'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, SearchX } from 'lucide-react';

import type { Product } from '@/types/database';
import { formatPrice } from '@/lib/format';

export function SearchBox() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/products')
      .then((res) => res.json())
      .then((data: Product[]) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setMounted(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trimmed = query.trim().toLowerCase();
  const suggestions = trimmed
    ? products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(trimmed) ||
            (p.description ?? '').toLowerCase().includes(trimmed),
        )
        .slice(0, 6)
    : [];

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products…"
          aria-label="Search products"
          className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pr-4 pl-9 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/10"
        />
      </div>

      {open && trimmed && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-black/5">
          {suggestions.length === 0 ? (
            <Link
              href={`/?q=${encodeURIComponent(trimmed)}#catalog`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3.5 text-sm text-muted-foreground hover:bg-zinc-50"
            >
              <SearchX className="size-4 shrink-0" />
              No matches in catalog — view all products
            </Link>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {suggestions.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery('');
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-zinc-50"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-500">
                      {product.title.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-zinc-900">
                        {product.title}
                      </span>
                      <span className="block text-[11px] text-zinc-500">
                        {formatPrice(product.price)}
                        {product.original_price &&
                          product.original_price > product.price && (
                            <span className="ml-1.5 line-through opacity-70">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!mounted && (
        <span className="sr-only" aria-live="polite">
          Loading search…
        </span>
      )}
    </div>
  );
}