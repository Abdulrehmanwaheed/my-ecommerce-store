'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

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
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const autoPlay = views.length >= 3;

  useEffect(() => {
    if (!autoPlay || paused) return;
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % views.length);
    }, 3500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, paused, views.length]);

  function goTo(index: number) {
    const size = views.length;
    setActive(((index % size) + size) % size);
  }

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
        onMouseEnter={() => {
          if (activeView) {
            setZoomed(true);
            setPaused(true);
          }
        }}
        onMouseLeave={() => {
          setZoomed(false);
          setPaused(false);
        }}
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

        {autoPlay && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                goTo(active - 1);
              }}
              className="absolute top-1/2 left-3 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border/60 bg-background/70 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-background"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                goTo(active + 1);
              }}
              className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border/60 bg-background/70 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-background"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {views.map((_v, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to image ${index + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(index);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    active === index
                      ? 'w-5 bg-primary'
                      : 'w-1.5 bg-foreground/30 hover:bg-foreground/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
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