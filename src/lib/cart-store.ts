'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/database';

export interface CartCustomization {
  isCustomized: boolean;
  customNotes?: string;
  customImages?: string[];
}

export interface CartItem {
  key: string;
  product: Product;
  quantity: number;
  isCustomized: boolean;
  customNotes?: string;
  customImages?: string[];
}

export function cartItemKey(productId: string, isCustomized: boolean): string {
  return `${productId}|${isCustomized ? 'custom' : 'standard'}`;
}

export function unitPriceOf(item: CartItem): number {
  return item.isCustomized
    ? (item.product.custom_price ?? item.product.price)
    : item.product.price;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (
    product: Product,
    quantity?: number,
    customization?: CartCustomization,
  ) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (product, quantity = 1, customization) =>
        set((state) => {
          const isCustomized = customization?.isCustomized ?? false;
          const key = cartItemKey(product.id, isCustomized);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + quantity, product.stock),
                      customNotes:
                        customization?.customNotes ?? i.customNotes,
                      customImages:
                        customization?.customImages ?? i.customImages,
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                key,
                product,
                quantity: Math.min(quantity, product.stock),
                isCustomized,
                customNotes: customization?.customNotes,
                customImages: customization?.customImages,
              },
            ],
          };
        }),

      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((i) => i.key !== key),
        })),

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.key === key
                ? {
                    ...i,
                    quantity: Math.min(Math.max(0, quantity), i.product.stock),
                  }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: 'ecommerce-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const selectCartCount = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectSubtotal = (state: CartState): number =>
  state.items.reduce(
    (total, item) => total + unitPriceOf(item) * item.quantity,
    0,
  );