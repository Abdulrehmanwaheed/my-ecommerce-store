'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Minus, Plus, ShoppingBag, Store, Trash2 } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import {
  selectSubtotal,
  useCartStore,
  selectCartCount,
} from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export function CartDrawer() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectSubtotal);

  const { freeShippingThreshold } = STORE_CONFIG.shipping;
  const remainingForFree = freeShippingThreshold - subtotal;
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}
    >
      <SheetContent className="flex w-full flex-col gap-0 bg-background p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60">
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription className="sr-only">
            Review items in your cart and checkout.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-muted">
              <ShoppingBag className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add products to get started.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={closeDrawer}
              className="rounded-xl"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-zinc-200/80 bg-white px-4 py-3">
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span className={remainingForFree > 0 ? '' : 'font-semibold text-emerald-600'}>
                  {remainingForFree > 0
                    ? `Add ${formatPrice(remainingForFree)} more for FREE Shipping!`
                    : '🎉 Free Shipping unlocked!'}
                </span>
                <span>{count} item{count === 1 ? '' : 's'}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    remainingForFree > 0 ? 'bg-zinc-900' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3 rounded-xl border border-border/60 p-2.5"
                >
                  <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-muted">
                    <Store className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-medium leading-tight">
                      {product.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatPrice(product.price)}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-1.5">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus />
                        </Button>
                        <span className="w-6 text-center text-sm tabular-nums">
                          {quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium tabular-nums">
                          {formatPrice(product.price * quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeItem(product.id)}
                          aria-label="Remove item"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter className="gap-2.5 border-t border-border/60">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <Button
                size="lg"
                className="h-10 w-full rounded-xl bg-zinc-900 hover:bg-zinc-800"
                disabled={items.length === 0}
                onClick={() => {
                  closeDrawer();
                  router.push('/checkout');
                }}
              >
                Proceed to Checkout
                <ArrowRight className="size-4" />
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}