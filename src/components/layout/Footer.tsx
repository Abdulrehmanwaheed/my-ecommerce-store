import Link from 'next/link';
import {
  AtSign,
  Banknote,
  CreditCard,
  Globe,
  Mail,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Truck,
  Wallet,
} from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { NewsletterForm } from '@/components/layout/newsletter-form';
import type { NavCategory } from '@/components/layout/Navbar';

const TRUST_ITEMS = [
  { icon: Truck, label: 'Fast Nationwide Shipping' },
  { icon: ShieldCheck, label: '100% Original Products' },
  { icon: RotateCcw, label: '7-Day Easy Returns' },
  { icon: Banknote, label: 'Cash on Delivery' },
];

const SOCIALS = [
  { icon: Globe, label: 'Website', href: '/' },
  { icon: AtSign, label: 'Instagram', href: '#' },
  { icon: Mail, label: 'Email', href: `mailto:${STORE_CONFIG.brand.supportEmail}` },
  { icon: MessageCircle, label: 'WhatsApp', href: `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}` },
];

export function Footer({ categories }: { categories: NavCategory[] }) {
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
    STORE_CONFIG.whatsapp.defaultMessage,
  )}`;

  return (
    <footer className="mt-20 bg-zinc-950 text-zinc-300">
      {/* Trust ticker */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl overflow-hidden px-4 py-5 sm:px-6">
          <div className="marquee-track flex w-max items-center gap-10">
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, index) => (
              <span
                key={`${item.label}-${index}`}
                className="flex shrink-0 items-center gap-2 text-xs font-medium tracking-wide text-zinc-400"
              >
                <item.icon className="size-4 text-emerald-500" />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white"
          >
            {STORE_CONFIG.brand.name}
            <span className="text-emerald-500">.</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
            {STORE_CONFIG.brand.tagline}. Flat{' '}
            {STORE_CONFIG.region.currencySymbol}{' '}
            {STORE_CONFIG.shipping.flatRateFee} delivery nationwide — pay only
            when it lands at your door.
          </p>
          <div className="mt-4 space-y-1.5 text-sm">
            <a
              href={`mailto:${STORE_CONFIG.brand.supportEmail}`}
              className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
            >
              <Mail className="size-3.5" />
              {STORE_CONFIG.brand.supportEmail}
            </a>
            <a
              href={`tel:${STORE_CONFIG.brand.supportPhone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
            >
              <MessageCircle className="size-3.5" />
              {STORE_CONFIG.brand.supportPhone}
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            Categories
          </h3>
          <ul className="mt-4 space-y-2.5">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/?cat=${category.slug}#catalog`}
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/#catalog" className="text-zinc-400 transition-colors hover:text-white">
                Shop All Products
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="text-zinc-400 transition-colors hover:text-white">
                Checkout
              </Link>
            </li>
            <li>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition-colors hover:text-white"
              >
                Track Order on WhatsApp
              </a>
            </li>
            <li>
              <Link href="/admin" className="text-zinc-400 transition-colors hover:text-white">
                Admin Panel
              </Link>
            </li>
          </ul>
          <h3 className="mt-7 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            Follow Us
          </h3>
          <div className="mt-4 flex gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="grid size-9 place-items-center rounded-xl bg-white/5 text-zinc-400 transition-colors hover:bg-emerald-600 hover:text-white"
              >
                <social.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            Get Deals First
          </h3>
          <p className="mt-4 text-sm text-zinc-500">
            New arrivals, restocks and exclusive offers — straight to your inbox.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
          <h3 className="mt-7 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            We Accept
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300">
              <Banknote className="size-3.5 text-emerald-500" />
              Cash on Delivery
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300">
              <CreditCard className="size-3.5 text-emerald-500" />
              Debit / Credit Card
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300">
              <Wallet className="size-3.5 text-emerald-500" />
              JazzCash / Easypaisa
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-zinc-600 sm:px-6">
          <p>
            © {new Date().getFullYear()} {STORE_CONFIG.brand.name}. All rights reserved.
          </p>
          <p>Made with care in Pakistan 🇵🇰</p>
        </div>
      </div>
    </footer>
  );
}