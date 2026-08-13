import { STORE_CONFIG } from '@/store.config';

export function formatPrice(amount: number): string {
  return `${STORE_CONFIG.region.currencySymbol} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}