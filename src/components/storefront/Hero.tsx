import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Banknote, MessageCircle, Truck } from 'lucide-react';
import { STORE_CONFIG } from '@/store.config';
import { CUSTOMIZED_CATEGORY } from '@/lib/backend-demo';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';

export function Hero({ products }: { products: Product[] }) {
  const available = products.filter((p) => p.stock > 0 && p.images?.[0]);
  const main = available.find((p) => /embroidered chiffon|organza|fancy dress/i.test(p.title)) ?? available[0];
  const accessory = available.find((p) => /shoulder handbag|quilted crossbody|satchel/i.test(p.title) && p.id !== main?.id)
    ?? available.find((p) => p.id !== main?.id);

  return (
    <>
      <section className="boutique-hero mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="grid overflow-hidden rounded-sm bg-[#eee7db] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center px-5 py-8 sm:px-12 sm:py-14 lg:py-20">
            <p className="brand-eyebrow"><span className="inline-block h-px w-8 bg-[#9b7730]" /> THE AWAN COLLECTION</p>
            <h1 className="brand-display mt-6 text-[2.65rem] leading-[1.04] tracking-[-0.045em] text-[#25231f] sm:text-7xl">
              A little everyday.<br /><span className="italic text-[#8a692e]">A little extraordinary.</span>
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#686155] sm:text-base">
              Find your next favourite. Discover fashion, finishing touches and thoughtful gifts, all in one collection.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="#catalog" className="boutique-button">Shop the collection <ArrowRight className="size-4" /></Link>
              <Link href={`/?cat=${CUSTOMIZED_CATEGORY.slug}#catalog`} className="text-sm font-medium underline decoration-[#b69b65] underline-offset-8">Make it personal</Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-[#686155]"><Truck className="size-4" /> From our collection to your doorstep, across Pakistan.</p>
          </div>
          <div className="relative grid min-h-[370px] grid-cols-[1.2fr_0.8fr] gap-3 p-4 pt-0 sm:min-h-[470px] sm:gap-4 sm:p-7 lg:pl-0 lg:pt-7">
            {main && (
              <Link href={`/product/${main.slug}`} className="group relative mt-5 overflow-hidden rounded-t-[140px] bg-[#d7cebf] lg:mt-6">
                <img src={main.images[0]} alt={main.title} fetchPriority="high" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-6 pt-20 text-white">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/80">IN THE COLLECTION</p>
                  <p className="mt-2 text-sm font-medium">{main.title}</p>
                  <p className="mt-1 text-xs">{formatPrice(main.price)} <ArrowUpRight className="float-right size-5" /></p>
                </div>
              </Link>
            )}
            <div className="flex min-w-0 flex-col justify-center gap-5">
              <div className="px-1 text-center">
                <span className="brand-display text-4xl italic text-[#8a692e]">ac.</span>
                <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-[#686155]">DETAILS MAKE THE DIFFERENCE</p>
              </div>
              {accessory && <Link href={`/product/${accessory.slug}`} className="group block bg-[#f8f5ef] p-2 pb-4">
                <div className="aspect-[4/5] overflow-hidden"><img src={accessory.images[0]} alt={accessory.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                <p className="mt-3 px-1 text-[10px] uppercase tracking-widest text-[#8a692e]">THE FINISHING TOUCH</p>
                <p className="mt-1 px-1 text-xs font-medium text-[#25231f]">{accessory.title}</p>
                <p className="mt-2 px-1 text-xs text-[#686155]">{formatPrice(accessory.price)} <ArrowUpRight className="float-right size-4" /></p>
              </Link>}
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#e5ded2] border-b border-[#e5ded2] px-6 py-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-6">
        {[{icon: Truck, title: 'Delivered nationwide', copy: 'Your favourites, wherever you are.'}, {icon: Banknote, title: 'Cash on Delivery', copy: 'Available on standard orders.'}, {icon: MessageCircle, title: 'A real person to help', copy: STORE_CONFIG.brand.supportPhone}].map(({icon: Icon, title, copy}) => (
          <div key={title} className="flex items-center justify-center gap-3 py-3 sm:py-0"><Icon className="size-5 shrink-0 text-[#8a692e]" strokeWidth={1.4} /><div><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-[11px] text-stone-500">{copy}</p></div></div>
        ))}
      </div>
    </>
  );
}
