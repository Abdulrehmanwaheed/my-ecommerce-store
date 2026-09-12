'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowUpRight, Check, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [imgFailed, setImgFailed] = useState(false);
  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100) : null;

  return (
    <article className="group flex min-w-0 flex-col">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-[#eeeae2]">
        {product.images[0] && !imgFailed ? <img src={product.images[0]} alt={product.title} loading="lazy" onError={() => setImgFailed(true)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          : <span className="grid h-full place-items-center text-stone-400"><ShoppingBag className="size-12" strokeWidth={1} /><span className="sr-only">{product.title}</span></span>}
        {discount && <span className="absolute left-3 top-3 bg-[#faf8f3] px-2 py-1 text-[10px] font-semibold tracking-wide text-[#775a28]">SAVE {discount}%</span>}
        {product.stock <= 0 && <span className="absolute inset-x-0 bottom-0 bg-black/70 py-2 text-center text-xs text-white">Sold out</span>}
        <span className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full bg-white/90 text-stone-800 transition-transform group-hover:-rotate-12"><ArrowUpRight className="size-4" /></span>
      </Link>
      <div className="flex flex-1 flex-col py-4">
        <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.16em] text-[#8a692e]">{product.allow_customization ? 'MAKE IT PERSONAL' : 'AWAN COLLECTION'}</p>
        <Link href={`/product/${product.slug}`} className="text-sm font-medium leading-6 text-stone-900 hover:underline"><h3 className="line-clamp-2">{product.title}</h3></Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1"><span className="text-sm font-semibold tabular-nums">{formatPrice(product.price)}</span>{product.original_price && product.original_price > product.price && <span className="text-xs text-stone-400 line-through">{formatPrice(product.original_price)}</span>}</div>
        <div className="mt-auto pt-4">
          {product.allow_customization ? (
            <Link href={`/product/${product.slug}`} className="flex min-h-10 w-full items-center justify-between gap-1 border border-[#d8cfbf] px-3 text-xs font-medium transition-colors hover:border-stone-900 hover:bg-stone-900 hover:text-white">View & personalize <ArrowUpRight className="size-4 shrink-0" /></Link>
          ) : (
            <button type="button" disabled={product.stock <= 0} onClick={() => { addItem(product, 1); openDrawer(); }} className="flex min-h-10 w-full items-center justify-between gap-1 border border-[#d8cfbf] px-3 text-xs font-medium transition-colors hover:border-stone-900 hover:bg-stone-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">{product.stock > 0 ? 'Add to bag' : 'Sold out'} <Plus className="size-4 shrink-0" /></button>
          )}
          {product.stock > 0 && <p className="mt-2 flex items-center gap-1 text-[10px] text-stone-500"><Check className="size-3" />{product.allow_customization ? 'Personalized for you' : 'Cash on Delivery available'}</p>}
        </div>
      </div>
    </article>
  );
}
