import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { CheckoutForm } from '@/components/checkout/checkout-form';

export const metadata: Metadata = {
  title: `Checkout — ${STORE_CONFIG.brand.name}`,
  description: 'Secure checkout with Cash on Delivery or online payment.',};

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fast, secure and flexible payment options.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <Zap className="size-3.5 text-primary" />
          Same-day dispatch on orders before 4 PM
        </span>
      </div>

      <CheckoutForm />

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Need help?{' '}
        <Link
          href={`https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
            STORE_CONFIG.whatsapp.defaultMessage,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          Chat on WhatsApp
        </Link>
      </p>
    </main>
  );
}