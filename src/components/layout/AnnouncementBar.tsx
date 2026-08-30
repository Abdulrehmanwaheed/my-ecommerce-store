import { ShieldCheck, Truck } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';

const CALLOUTS = [
  {
    icon: ShieldCheck,
    text: `100% Original Products — Guaranteed`,
  },
  {
    icon: Truck,
    text: `Flat ${STORE_CONFIG.region.currencySymbol} ${STORE_CONFIG.shipping.flatRateFee} Delivery Nationwide`,
  },
];

export function AnnouncementBar() {
  return (
    <div className="bg-zinc-900 text-white">
      <div className="relative mx-auto flex h-9 max-w-7xl items-center justify-center overflow-hidden px-4 sm:px-6">
        {CALLOUTS.map((callout, index) => (
          <span
            key={callout.text}
            className="announce-item absolute inset-0 flex items-center justify-center gap-2 text-[11px] font-medium tracking-wide whitespace-nowrap sm:text-xs"
            style={{ animationDelay: `${index * 3}s` }}
          >
            <callout.icon className="size-3.5 text-emerald-400" />
            {callout.text}
          </span>
        ))}
      </div>
    </div>
  );
}