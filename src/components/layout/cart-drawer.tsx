'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ImageIcon,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
} from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import {
  selectSubtotal,
  unitPriceOf,
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

  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectSubtotal);

  const shippingFee = STORE_CONFIG.shipping.flatRateFee;

  const whatsappOrderUrl = `https://wa.me/${
    STORE_CONFIG.whatsapp.phoneNumber
  }?text=${encodeURIComponent(
    `Hi ${STORE_CONFIG.brand.name}! I want to confirm my order:\n\n${items
      .map((item) => {
        const unit = unitPriceOf(item);
        const lines = [
          `• ${item.quantity} × ${item.product.title} — ${formatPrice(unit * item.quantity)}`,
        ];
        if (item.isCustomized) {
          lines.push(`   ✨ CUSTOMIZED (${formatPrice(unit)} each)`);
          if (item.customNotes) {
            lines.push(`   📝 Instructions: ${item.customNotes}`);
          }
          if (item.customImages?.length) {
            lines.push(
              `   🖼️ Reference photos: ${item.customImages.join(', ')}`,
            );
          }
        }
        return lines.join('\n');
      })
      .join('\n\n')}\n\nSubtotal: ${formatPrice(
      subtotal,
    )} + ${formatPrice(shippingFee)} shipping = ${formatPrice(subtotal + shippingFee)}`,
  )}`;

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
              <p className="text-xs text-zinc-500">
                {count} item{count === 1 ? '' : 's'} ·{' '}
                {formatPrice(shippingFee)} flat delivery
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {items.map((item) => {
                const unit = unitPriceOf(item);
                return (
                  <div
                    key={item.key}
                    className="flex gap-3 rounded-xl border border-border/60 p-2.5"
                  >
                    <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-muted">
                      <Store className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-medium leading-tight">
                        {item.product.title}
                      </p>
                      {item.isCustomized && (
                        <p className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          <Sparkles className="size-3" />
                          Customized
                        </p>
                      )}
                      {item.isCustomized && item.customNotes && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                          📝 {item.customNotes}
                        </p>
                      )}
                      {item.isCustomized &&
                        !!item.customImages?.length && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <ImageIcon className="size-3" />
                            {item.customImages.length} reference photo
                            {item.customImages.length > 1 ? 's' : ''}
                          </p>
                        )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatPrice(unit)} each
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-1.5">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              updateQuantity(item.key, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus />
                          </Button>
                          <span className="w-6 text-center text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              updateQuantity(item.key, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium tabular-nums">
                            {formatPrice(unit * item.quantity)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => removeItem(item.key)}
                            aria-label="Remove item"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                onClick={() => {
                  closeDrawer();
                  router.push('/checkout');
                }}
              >
                Proceed to Checkout
                <ArrowRight className="size-4" />
              </Button>

              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <MessageCircle className="size-4" />
                Confirm Order via WhatsApp
              </a>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}