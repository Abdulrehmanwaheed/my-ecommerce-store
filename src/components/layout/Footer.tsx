import Link from 'next/link';
import { ArrowUpRight, Truck, ShieldCheck, MessageCircle } from 'lucide-react';
import { STORE_CONFIG } from '@/store.config';
import type { NavCategory } from '@/components/layout/Navbar';

const TRUST_ITEMS = [
  { icon: Truck, label: 'Fast Nationwide Shipping' },
  { icon: ShieldCheck, label: '100% Original Products' },
  { icon: null, label: '0311-0268033' },
];

export function Footer({ categories }: { categories: NavCategory[] }) {
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}`;
  return (
    <footer className="mt-16 bg-[#22231f] text-[#f5efe4]">
      <div className="overflow-hidden border-b border-white/10 py-5">
        <div className="marquee-track flex w-max items-center gap-12">
          {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map((item, index) => <span key={index} className="flex shrink-0 items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[#d5b976]">{item.icon && <item.icon className="size-4" strokeWidth={1.4} />}{item.label}<span className="ml-7 text-[#88713e]" aria-hidden="true">✦</span></span>)}
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.8fr_1.1fr]">
        <div><Link href="/"><img src={STORE_CONFIG.brand.logoUrl} alt="Awan Collection" className="h-auto w-56 max-w-full" /></Link><p className="mt-5 max-w-xs text-sm leading-7 text-stone-400">{STORE_CONFIG.brand.tagline}.<br />A collection for your everyday, and the moments that matter.</p><p className="mt-6 text-[10px] uppercase tracking-[0.18em] text-[#d5b976]">FASHION · LIFESTYLE · PERSONALIZED GIFTS</p></div>
        <div><h3 className="text-xs font-medium uppercase tracking-[0.16em] text-[#d5b976]">Explore the collection</h3><ul className="mt-5 space-y-3 text-sm text-stone-300">{categories.filter((category) => /dress|bags|footwear|jewelry|men.*wear|custom/i.test(category.name)).slice(0, 6).map((category) => <li key={category.slug}><Link href={`/?cat=${category.slug}#catalog`} className="hover:text-[#d5b976]">{category.name}</Link></li>)}<li><Link href="/#catalog" className="inline-flex items-center gap-2 text-[#d5b976]">View all collections <ArrowUpRight className="size-3" /></Link></li></ul></div>
        <div><h3 className="text-xs font-medium uppercase tracking-[0.16em] text-[#d5b976]">Here to help</h3><ul className="mt-5 space-y-3 text-sm text-stone-300"><li><Link href="/account">My account</Link></li><li><Link href="/checkout">Checkout</Link></li><li><a href={`${whatsappUrl}?text=${encodeURIComponent('Hi! I would like an update on my order.')}`} target="_blank" rel="noopener noreferrer">Track my order</a></li><li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Contact us</a></li><li><a href={`mailto:${STORE_CONFIG.brand.supportEmail}`}>Email support</a></li></ul></div>
        <div><h3 className="brand-display text-3xl">Let’s find your favourite.</h3><p className="mt-3 text-sm leading-7 text-stone-400">Need a hand choosing? Talk to us about products or a personal touch.</p><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-3 border-b border-[#d5b976]/50 pb-2 text-sm text-[#d5b976]"><MessageCircle className="size-4" />0311-0268033 <ArrowUpRight className="size-4" /></a><p className="mt-6 text-xs leading-6 text-stone-400">Cash on Delivery for standard orders.<br />Easypaisa for personalized orders.</p></div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-6 text-[11px] text-stone-400"><p>© {new Date().getFullYear()} {STORE_CONFIG.brand.name}. All rights reserved.</p><p>Made with care in Pakistan.</p></div>
    </footer>
  );
}
