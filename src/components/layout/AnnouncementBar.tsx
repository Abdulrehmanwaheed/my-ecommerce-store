import { ShieldCheck } from 'lucide-react';

const CALLOUTS = [
  {
    icon: ShieldCheck,
    text: `100% Original Products — Guaranteed`,
  },
];

export function AnnouncementBar() {
  return (
    <div className="bg-[#22231f] text-[#f1e7d1]">
      <div className="mx-auto flex min-h-9 max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 sm:px-6">
        {CALLOUTS.map((callout) => (
          <span
            key={callout.text}
            className="flex items-center justify-center gap-2 text-[11px] font-medium tracking-wide whitespace-nowrap sm:text-xs"
          >
            <callout.icon className="size-3.5 text-[#d5b976]" />
            {callout.text}
          </span>
        ))}
        <a href="tel:03110268033" className="text-[11px] font-medium tracking-wide whitespace-nowrap hover:underline sm:text-xs">
          0311-0268033
        </a>
      </div>
    </div>
  );
}
