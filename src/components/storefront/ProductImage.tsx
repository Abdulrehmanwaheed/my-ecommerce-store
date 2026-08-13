'use client';

import { useState } from 'react';

export function ProductImage({
  src,
  alt,
  letter,
  className = '',
}: {
  src?: string;
  alt: string;
  letter: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className={`grid place-items-center font-bold tracking-tight text-foreground/15 ${className}`}
      >
        {letter.charAt(0).toUpperCase()}
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}