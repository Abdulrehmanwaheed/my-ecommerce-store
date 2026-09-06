'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';

import { Button } from '@/components/ui/button';

type Mode = 'standard' | 'custom';

export function CustomizationOptions({ product }: { product: Product }) {
  const [mode, setMode] = useState<Mode>('standard');
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const designImages = product.design_images ?? [];
  const [selectedDesignIndex, setSelectedDesignIndex] = useState(
    designImages.length > 0 ? 0 : -1,
  );
  const [hoveredDesignIndex, setHoveredDesignIndex] = useState<number | null>(null);
  const thumbRowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    updateThumbArrows();
  }, [designImages.length]);

  useEffect(() => {
    if (!thumbRowRef.current) return;
    const el = thumbRowRef.current;
    el.scrollBy({ left: 80, behavior: 'instant' });
    el.scrollTo({ left: 0 });
    updateThumbArrows();
  }, []);

  function updateThumbArrows() {
    const el = thumbRowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(
      el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
    );
  }

  function scrollThumbs(dir: 'left' | 'right') {
    const el = thumbRowRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.8, 90);
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  }

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const outOfStock = product.stock === 0;
  const customPrice = product.custom_price ?? product.price;
  const activePrice = mode === 'custom' ? customPrice : product.price;
  const isCustom = mode === 'custom';
  const selectedDesign = designImages[selectedDesignIndex] ?? '';

  const whatsappUrl = `https://wa.me/${
    STORE_CONFIG.whatsapp.phoneNumber
  }?text=${encodeURIComponent(
    [
      `Hello ${STORE_CONFIG.brand.name}! I'd like to order *${qty} × ${product.title}*`,
      isCustom
        ? `✨ CUSTOMIZED version — ${formatPrice(activePrice)} each (total ${formatPrice(
            activePrice * qty,
          )})`
        : `— standard version at ${formatPrice(product.price)} each (total ${formatPrice(
            product.price * qty,
          )})`,
      notes.trim()
        ? `📝 Custom instructions: ${notes.trim()}`
        : isCustom
          ? '📝 Custom instructions: (will share in chat)'
          : null,
      isCustom && selectedDesign
        ? `🎨 Selected design: ${selectedDesign}`
        : null,
      'Please confirm availability.',
    ]
      .filter(Boolean)
      .join('\n'),
  )}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Dynamic price header */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-4xl font-extrabold text-zinc-900 tabular-nums">
            {formatPrice(activePrice)}
          </span>
          {isCustom ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700">
              <Sparkles className="size-3" />
              Tailored / Personalized
            </span>
          ) : (
            product.original_price &&
            product.original_price > product.price && (
              <>
                <span className="text-lg text-zinc-400 line-through tabular-nums">
                  {formatPrice(product.original_price)}
                </span>
                <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                  Save{' '}
                  {Math.round(
                    (1 - product.price / product.original_price) * 100,
                  )}
                  %
                </span>
              </>
            )
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-zinc-500">
          {isCustom
            ? 'Custom price applies when you choose a tailored version.'
            : 'Inclusive of all taxes · Flat delivery nationwide.'}
        </p>
      </div>

      {/* Dual option cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode('standard')}
          className={`group rounded-2xl border-2 p-4 text-left transition-all ${
            !isCustom
              ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
              : 'border-zinc-200 bg-white hover:border-zinc-400'
          }`}
        >
          <span className="flex items-center gap-2">
            <Package
              className={`size-4 ${
                !isCustom ? 'text-white' : 'text-zinc-500'
              }`}
            />
            <span className="text-sm font-bold">Standard Order</span>
          </span>
          <span
            className={`mt-2 block text-2xl font-extrabold tabular-nums ${
              !isCustom ? 'text-white' : 'text-zinc-900'
            }`}
          >
            {formatPrice(product.price)}
          </span>
          <span
            className={`mt-1 block text-[11px] ${
              !isCustom ? 'text-white/60' : 'text-zinc-500'
            }`}
          >
            Ready-made, ships immediately
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`group relative rounded-2xl border-2 p-4 text-left transition-all ${
            isCustom
              ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/10'
              : 'border-zinc-200 bg-white hover:border-amber-400'
          }`}
        >
          <span className="absolute -top-2.5 right-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            ✨ Tailored / Personalized
          </span>
          <span className="flex items-center gap-2">
            <Sparkles
              className={`size-4 ${isCustom ? 'text-amber-600' : 'text-zinc-500'}`}
            />
            <span
              className={`text-sm font-bold ${
                isCustom ? 'text-amber-800' : 'text-zinc-900'
              }`}
            >
              Customize This Product
            </span>
          </span>
          <span
            className={`mt-2 block text-2xl font-extrabold tabular-nums ${
              isCustom ? 'text-amber-800' : 'text-zinc-900'
            }`}
          >
            {formatPrice(customPrice)}
          </span>
          <span
            className={`mt-1 block text-[11px] ${
              isCustom ? 'text-amber-700/70' : 'text-zinc-500'
            }`}
          >
            Your measurements, print &amp; design
          </span>
        </button>
      </div>

      {/* Customization inputs */}
      {isCustom && (
        <div className="fade-in-up space-y-3 rounded-2xl border border-amber-500/30 bg-white p-4 shadow-sm">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
              Custom Instructions / Measurements / Text to Print
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Size M, embroider name in gold on the back, delivery to Lahore"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-20 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {designImages.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
                Choose a Design
              </label>
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    designImages[hoveredDesignIndex ?? selectedDesignIndex] ??
                    designImages[0]
                  }
                  alt={`Design ${(hoveredDesignIndex ?? selectedDesignIndex) + 1}`}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="relative mt-2.5">
                {canScrollLeft && (
                  <button
                    type="button"
                    aria-label="Previous designs"
                    onClick={() => scrollThumbs('left')}
                    className="absolute top-1/2 -left-3 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-md transition-colors hover:bg-zinc-50"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                )}
                <div
                  ref={thumbRowRef}
                  onScroll={updateThumbArrows}
                  className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {designImages.map((url, index) => {
                    const isActive = index === selectedDesignIndex;
                    return (
                      <button
                        key={url}
                        type="button"
                        onMouseEnter={() => setHoveredDesignIndex(index)}
                        onMouseLeave={() => setHoveredDesignIndex(null)}
                        onClick={() => setSelectedDesignIndex(index)}
                        aria-pressed={isActive}
                        aria-label={`Design ${index + 1}`}
                        className={`relative w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                          isActive
                            ? 'border-amber-500 ring-2 ring-amber-500/30'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Design ${index + 1}`}
                          className="aspect-square size-full object-cover"
                        />
                        {isActive && (
                          <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-amber-500 text-white shadow">
                            <Check className="size-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {canScrollRight && (
                  <button
                    type="button"
                    aria-label="More designs"
                    onClick={() => scrollThumbs('right')}
                    className="absolute top-1/2 -right-3 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-md transition-colors hover:bg-zinc-50"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quantity */}
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
            onClick={() =>
              setQty((q) => Math.min(Math.max(product.stock, 1), q + 1))
            }
            aria-label="Increase quantity"
            className="rounded-lg"
          >
            <Plus />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <Button
        size="lg"
        disabled={outOfStock}
        className="h-12 w-full rounded-xl bg-zinc-900 py-3.5 text-base font-semibold hover:bg-zinc-800"
        onClick={() => {
          addItem(product, qty, {
            isCustomized: isCustom,
            customNotes: notes.trim() || undefined,
            customImages: selectedDesign ? [selectedDesign] : [],
          });
          openDrawer();
        }}
      >
        <ShoppingBag className="size-4" />
        {outOfStock
          ? 'Out of Stock'
          : `${isCustom ? 'Add Customized' : 'Add'} ${qty > 1 ? `${qty} ` : ''}to Cart — ${formatPrice(activePrice * qty)}`}
      </Button>

      <Button
        size="lg"
        className="h-12 w-full rounded-xl border-emerald-600/40 bg-emerald-600 py-3.5 text-base font-semibold text-white hover:bg-emerald-500 hover:text-white"
        render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
      >
        <MessageCircle className="size-4" />
        Order via WhatsApp in 1-Click
      </Button>
    </div>
  );
}