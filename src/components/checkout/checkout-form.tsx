'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Banknote, CreditCard, Loader2, ShoppingBag, Truck } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { selectSubtotal, useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import { createOrder, type CreateOrderResult } from '@/app/actions/create-order';
import type { PaymentMethod } from '@/types/database';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export function CheckoutForm() {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore(selectSubtotal);

  const [mounted, setMounted] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { cod, cardPayment } = STORE_CONFIG.paymentMethods;
  const paymentOptions = useMemo<PaymentOption[]>(
    () =>
      [
        cod && {
          id: 'COD' as const,
          label: 'Cash on Delivery',
          description: 'Pay in cash when your order arrives.',
          icon: <Banknote className="size-4" />,
        },
        cardPayment && {
          id: 'ONLINE_CARD' as const,
          label: 'Card / Mobile Wallet',
          description: 'Debit, credit card or mobile wallet online.',
          icon: <CreditCard className="size-4" />,
        },
      ].filter(Boolean) as PaymentOption[],
    [cod, cardPayment],
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  useEffect(() => {
    setMounted(true);
    const fallback = paymentOptions[0]?.id ?? 'COD';
    setPaymentMethod(fallback);
  }, [paymentOptions]);

  const shippingFee =
    subtotal >= STORE_CONFIG.shipping.freeShippingThreshold ? 0 : STORE_CONFIG.shipping.flatRateFee;
  const totalPayable = subtotal + shippingFee;

  function validatePhone(raw: string): boolean {
    const digits = raw.replace(/[\s-]/g, '');
    return /^03\d{9}$/.test(digits);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!validatePhone(phone)) {
      setPhoneError('Enter a valid 11-digit WhatsApp number, e.g. 03001234567');
      return;
    }
    if (!city) {
      setError('Please select your city.');
      return;
    }
    if (!address.trim()) {
      setError('Please enter your delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      const result: CreateOrderResult = await createOrder({
        customer_name: customerName.trim(),
        phone_whatsapp: phone.replace(/[\s-]/g, ''),
        city,
        address: address.trim(),
        payment_method: paymentMethod,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      });

      if (!result.success || !result.orderId) {
        setError(result.error ?? 'Order could not be placed.');
        return;
      }

      clearCart();

      if (result.redirectUrl) {
        router.push(result.redirectUrl);
        return;
      }

      if (result.requiresPayment && result.gatewayUrl) {
        const res = await fetch(result.gatewayUrl);
        const data = await res.json();
        router.push(data.checkoutUrl ?? '/');
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) {
    return (
      <div className="grid animate-pulse gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="h-[28rem] rounded-3xl bg-muted" />
        <div className="h-[24rem] rounded-3xl bg-muted" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-border/60 bg-card px-8 py-16 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-muted">
          <ShoppingBag className="size-7 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Your cart is empty</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add some items before heading to checkout.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push('/#catalog')}
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      {/* Left — form */}
      <div className="space-y-8">
        <section className="rounded-3xl border border-border/60 bg-card p-6">
          <h2 className="text-base font-semibold">Shipping Details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="full-name" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Full Name
              </label>
              <Input
                id="full-name"
                placeholder="e.g. Ali Khan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                WhatsApp Number
              </label>
              <Input
                id="phone"
                placeholder="03XX XXXXXXX"
                inputMode="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError(null);
                }}
              />
              {phoneError && (
                <p className="mt-1.5 text-xs text-destructive">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                City
              </label>
              <Select
                value={city}
                onValueChange={(value) => setCity(value ?? '')}
              >
                <SelectTrigger className="w-full" data-placeholder>
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {STORE_CONFIG.shipping.cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Delivery Address
              </label>
              <Input
                id="address"
                placeholder="House, street, area"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-6">
          <h2 className="text-base font-semibold">Payment Method</h2>
          <div className="mt-4 grid gap-2.5">
            {paymentOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => setPaymentMethod(option.id)}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                  paymentMethod === option.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                    : 'border-border/60 hover:border-border'
                }`}
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                    paymentMethod === option.id
                      ? 'border-primary'
                      : 'border-muted-foreground/40'
                  }`}
                >
                  {paymentMethod === option.id && (
                    <span className="size-2.5 rounded-full bg-primary" />
                  )}
                </span>
                <span className="grid size-9 place-items-center rounded-xl bg-muted">
                  {option.icon}
                </span>
                <span>
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Right — summary */}
      <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6 lg:sticky lg:top-24">
        <h2 className="text-base font-semibold">Order Summary</h2>

        <ul className="mt-4 space-y-3">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {quantity} × {product.title}
              </span>
              <span className="font-medium tabular-nums">
                {formatPrice(product.price * quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-2 border-t border-border/60 pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shipping</span>
            {shippingFee === 0 ? (
              <Badge variant="secondary" className="gap-1">
                <Truck className="size-3" />
                Free
              </Badge>
            ) : (
              <span className="tabular-nums">{formatPrice(shippingFee)}</span>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <span className="font-semibold">Total Payable</span>
            <span className="text-xl font-bold tabular-nums">
              {formatPrice(totalPayable)}
            </span>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="mt-5 h-12 w-full rounded-xl"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Placing your order…
            </>
          ) : paymentMethod === 'COD' ? (
            'Place COD Order'
          ) : (
            'Proceed to Payment'
          )}
        </Button>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to cart
        </button>
      </aside>
    </form>
  );
}