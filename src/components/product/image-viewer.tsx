'use client';

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';

import type { Product } from '@/types/database';

const THUMB_GRADIENTS = [
  'from-primary/25 via-muted to-muted',
  'from-sky-500/20 via-muted to-muted',
  'from-emerald-500/15 via-muted to-muted',
];

export function ImageViewer({ product }: { product: Product }) {
  const views: { src?: string }[] = useMemo(() => {
    if (product.images.length >= 2) {
      return product.images.map((src) => ({ src }));
    }
    return product.images.length === 1
      ? [{ src: product.images[0] }, { src: product.images[0] }, { src: product.images[0] }]
      : [{}, {}, {}];
  }, [product.images]);

  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const activeView = views[active]?.src;
  const activeFailed = activeView ? Boolean(failed[activeView]) : false;

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }, []);

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/20 via-muted to-muted"
        onMouseEnter={() => activeView && setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMove}
      >
        {activeView && !activeFailed ? (
          <Image
            src={activeView}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            priority
            onError={() => setFailed((f) => ({ ...f, [activeView]: true }))}
            className="object-cover transition-transform duration-300 ease-out"
            style={{
              transform: zoomed ? 'scale(1.6)' : 'scale(1)',
              transformOrigin: origin,
            }}
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center transition-transform duration-300 ease-out"
            style={{
              transform: zoomed ? 'scale(1.6)' : 'scale(1)',
              transformOrigin: origin,
            }}
          >
            <span className="text-8xl font-bold tracking-tight text-foreground/15 select-none">
              {product.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute top-3 right-3 rounded-full bg-background/70 p-1.5 backdrop-blur">
          <ZoomIn className="size-3.5 text-muted-foreground" />
        </div>
      </div>

      <div className="flex gap-2.5">
        {views.map((view, index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            aria-label={`View image ${index + 1}`}
            className={`relative h-20 w-20 overflow-hidden rounded-xl border bg-gradient-to-br transition-all ${
              THUMB_GRADIENTS[index % THUMB_GRADIENTS.length]
            } ${
              active === index
                ? 'border-primary ring-2 ring-primary/60'
                : 'border-border/60 opacity-60 hover:opacity-100'
            }`}
          >
            {view.src && !failed[view.src] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={view.src}
                alt=""
                onError={() => setFailed((f) => ({ ...f, [view.src!]: true }))}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="grid h-full w-full place-items-center text-lg font-semibold text-foreground/20">
                {index + 1}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}