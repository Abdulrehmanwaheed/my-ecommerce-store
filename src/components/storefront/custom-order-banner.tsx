import Link from 'next/link';
import {
  ArrowRight,
  MessageCircle,
  Paintbrush,
  Sparkles,
} from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { CUSTOMIZED_CATEGORY } from '@/lib/backend-demo';
import { Button } from '@/components/ui/button';

const CUSTOMIZABLE_TYPES = [
  "Fancy Dresses",
  "Women's Bags",
  "Footwear",
  "Watches & Jewelry",
  "Cosmetics",
];

export function CustomOrderBanner() {
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
    STORE_CONFIG.whatsapp.defaultMessage,
  )}`;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-3xl border border-[color:var(--accent-emerald)]/30 bg-gradient-to-br from-[color:var(--accent-emerald)]/10 via-zinc-900 to-zinc-950 p-7 text-white shadow-xl shadow-zinc-900/20 sm:p-9">
        <div className="pointer-events-none absolute -top-12 -right-12 size-64 rounded-full bg-[color:var(--accent-emerald)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 size-64 rounded-full bg-[color:var(--primary)]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--accent-emerald)]/40 bg-[color:var(--accent-emerald)]/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Paintbrush className="size-3.5" />
              Made Only-For-You
            </span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
              We Customize It — Your Style, Your Name, Your Way
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
              Custom name prints, photo embossing, color swaps, size tailoring
              &amp; gemstone details on items like{' '}
              {CUSTOMIZABLE_TYPES.join(', ')}.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-white/70">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-[color:var(--accent-emerald)]" />
                Name engraving &amp; prints
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-[color:var(--accent-emerald)]" />
                Colors &amp; sizes your way
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-[color:var(--accent-emerald)]" />
                Daily delivery nationwide
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-12 rounded-xl bg-[color:var(--primary)] px-7 text-base font-semibold text-zinc-950 shadow-lg shadow-[color:var(--primary)]/25 hover:bg-[color:var(--primary-hover)] hover:text-zinc-950"
              render={
                <Link href={`/?cat=${CUSTOMIZED_CATEGORY.slug}#catalog`} />
              }
            >
              Browse Customizable Items
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              className="h-12 rounded-xl border-emerald-600/40 bg-[color:var(--accent-emerald)] px-7 text-base font-semibold text-white hover:bg-emerald-700 hover:text-white"
              render={
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />
              }
            >
              <MessageCircle className="size-4" />
              Order on WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}