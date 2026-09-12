import type { Metadata } from 'next';
import Link from 'next/link';

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
          <h1 className="brand-display text-4xl tracking-tight sm:text-5xl">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A few details, and your favourites are on their way.
          </p>
        </div>
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
