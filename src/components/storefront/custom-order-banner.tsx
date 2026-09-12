import Link from 'next/link';
import { ArrowRight, PenLine } from 'lucide-react';
import { CUSTOMIZED_CATEGORY } from '@/lib/backend-demo';

export function CustomOrderBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
      <div className="grid gap-8 bg-[#22231f] px-7 py-10 text-[#faf7f0] sm:px-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="brand-eyebrow text-[#d5b976]"><PenLine className="size-4" /> SOMETHING ONLY YOU COULD GIVE</p>
          <h2 className="brand-display mt-4 text-4xl sm:text-5xl">Ordinary things.<br /><span className="italic text-[#d5b976]">Your personal touch.</span></h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-stone-300">A name, a photo, a memory. Turn a piece from our customizable collection into something that feels truly yours.</p>
          <Link href={`/?cat=${CUSTOMIZED_CATEGORY.slug}#catalog`} className="mt-6 inline-flex items-center gap-3 border-b border-[#d5b976] pb-2 text-sm text-[#e7d19d]">Explore personalized pieces <ArrowRight className="size-4" /></Link>
        </div>
        <div className="space-y-5 lg:border-l lg:border-white/15 lg:pl-12">
          {[
            ['01', 'Choose your piece', 'Browse products with a personalization option.'],
            ['02', 'Make it yours', 'Add your notes and reference photos.'],
            ['03', 'Pay & share your receipt', 'Pay with Easypaisa and upload a PNG screenshot at checkout.'],
          ].map(([number, title, copy]) => <div key={number} className="flex gap-5"><span className="brand-display text-3xl text-[#d5b976]">{number}</span><div><h3 className="text-sm font-medium">{title}</h3><p className="mt-1 text-xs leading-6 text-stone-400">{copy}</p></div></div>)}
        </div>
      </div>
    </section>
  );
}
