'use client';

import { useRef, useState } from 'react';
import {
  ImagePlus,
  Loader2,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/database';

import { Button } from '@/components/ui/button';

const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type Mode = 'standard' | 'custom';

export function CustomizationOptions({ product }: { product: Product }) {
  const [mode, setMode] = useState<Mode>('standard');
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const outOfStock = product.stock === 0;
  const customPrice = product.custom_price ?? product.price;
  const activePrice = mode === 'custom' ? customPrice : product.price;
  const isCustom = mode === 'custom';

  function handleFiles(selected: FileList | null) {
    if (!selected) return;
    setUploadError(null);
    const incoming = Array.from(selected).filter((file) =>
      file.type.startsWith('image/'),
    );
    if (incoming.length === 0) {
      setUploadError('Please choose image files only.');
      return;
    }
    const combined = [...files, ...incoming].slice(0, MAX_FILES);
    if (combined.length < files.length + incoming.length) {
      setUploadError(`You can upload up to ${MAX_FILES} reference photos.`);
    }
    for (const file of incoming) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`"${file.name}" exceeds the 5MB limit.`);
        break;
      }
    }
    setFiles(combined);
    setPreviews((prev) =>
      [...prev, ...incoming.map((file) => URL.createObjectURL(file))].slice(
        0,
        MAX_FILES,
      ),
    );
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      for (const file of files) formData.append('files', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.urls) {
        setUploadError(data.error ?? 'Upload failed. Please try again.');
        return;
      }
      setUploadedUrls(data.urls);
      setFiles([]);
      setPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const whatsappUrl = `https://wa.me/${
    STORE_CONFIG.whatsapp.phoneNumber
  }?text=${encodeURIComponent(
    [
      `Hello ${STORE_CONFIG.brand.name}! I'd like to order *${qty} × ${product.title}*`,
      isCustom
        ? `✨ CUSTOMIZED version — ${formatPrice(activePrice)} each (total ${formatPrice(
            activePrice * qty,
          )})`
        : `— standard version at ${formatPrice(product.price)} each (total ${formatPrice(
            product.price * qty,
          )})`,
      notes.trim()
        ? `📝 Custom instructions: ${notes.trim()}`
        : isCustom
          ? '📝 Custom instructions: (will share in chat)'
          : null,
      uploadedUrls.length > 0
        ? `🖼️ Reference photos:\n${uploadedUrls.join('\n')}`
        : null,
      'Please confirm availability.',
    ]
      .filter(Boolean)
      .join('\n'),
  )}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Dynamic price header */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-4xl font-extrabold text-zinc-900 tabular-nums">
            {formatPrice(activePrice)}
          </span>
          {isCustom ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700">
              <Sparkles className="size-3" />
              Tailored / Personalized
            </span>
          ) : (
            product.original_price &&
            product.original_price > product.price && (
              <>
                <span className="text-lg text-zinc-400 line-through tabular-nums">
                  {formatPrice(product.original_price)}
                </span>
                <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                  Save{' '}
                  {Math.round(
                    (1 - product.price / product.original_price) * 100,
                  )}
                  %
                </span>
              </>
            )
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-zinc-500">
          {isCustom
            ? 'Custom price applies when you choose a tailored version.'
            : 'Inclusive of all taxes · Flat delivery nationwide.'}
        </p>
      </div>

      {/* Dual option cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode('standard')}
          className={`group rounded-2xl border-2 p-4 text-left transition-all ${
            !isCustom
              ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
              : 'border-zinc-200 bg-white hover:border-zinc-400'
          }`}
        >
          <span className="flex items-center gap-2">
            <Package
              className={`size-4 ${
                !isCustom ? 'text-white' : 'text-zinc-500'
              }`}
            />
            <span className="text-sm font-bold">Standard Order</span>
          </span>
          <span
            className={`mt-2 block text-2xl font-extrabold tabular-nums ${
              !isCustom ? 'text-white' : 'text-zinc-900'
            }`}
          >
            {formatPrice(product.price)}
          </span>
          <span
            className={`mt-1 block text-[11px] ${
              !isCustom ? 'text-white/60' : 'text-zinc-500'
            }`}
          >
            Ready-made, ships immediately
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`group relative rounded-2xl border-2 p-4 text-left transition-all ${
            isCustom
              ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/10'
              : 'border-zinc-200 bg-white hover:border-amber-400'
          }`}
        >
          <span className="absolute -top-2.5 right-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            ✨ Tailored / Personalized
          </span>
          <span className="flex items-center gap-2">
            <Sparkles
              className={`size-4 ${isCustom ? 'text-amber-600' : 'text-zinc-500'}`}
            />
            <span
              className={`text-sm font-bold ${
                isCustom ? 'text-amber-800' : 'text-zinc-900'
              }`}
            >
              Customize This Product
            </span>
          </span>
          <span
            className={`mt-2 block text-2xl font-extrabold tabular-nums ${
              isCustom ? 'text-amber-800' : 'text-zinc-900'
            }`}
          >
            {formatPrice(customPrice)}
          </span>
          <span
            className={`mt-1 block text-[11px] ${
              isCustom ? 'text-amber-700/70' : 'text-zinc-500'
            }`}
          >
            Your measurements, print &amp; design
          </span>
        </button>
      </div>

      {/* Customization inputs */}
      {isCustom && (
        <div className="fade-in-up space-y-3 rounded-2xl border border-amber-500/30 bg-white p-4 shadow-sm">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
              Custom Instructions / Measurements / Text to Print
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Size M, embroider name in gold on the back, delivery to Lahore"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-20 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Dropzone */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
              Reference Photos (up to {MAX_FILES})
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center transition-colors hover:border-amber-400 hover:bg-amber-50/40"
            >
              <ImagePlus className="size-6 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-600">
                Click to upload or drag &amp; drop
              </span>
              <span className="text-[11px] text-zinc-400">
                JPG, PNG, WebP — up to 5MB each
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />

            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {previews.map((preview, index) => (
                  <div key={preview} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={`Reference ${index + 1}`}
                      className="aspect-square w-full rounded-xl border border-zinc-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-zinc-900 text-white shadow"
                      aria-label={`Remove reference ${index + 1}`}
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadedUrls.length > 0 && (
              <div className="mt-3 rounded-xl bg-emerald-50 p-3">
                <p className="text-[11px] font-semibold text-emerald-700">
                  ✓ {uploadedUrls.length} photo
                  {uploadedUrls.length > 1 ? 's' : ''} uploaded &amp; attached to
                  your order
                </p>
                <ul className="mt-1.5 space-y-1">
                  {uploadedUrls.map((url, index) => (
                    <li key={url} className="flex items-center justify-between gap-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-[11px] text-emerald-700 underline underline-offset-2"
                      >
                        Reference {index + 1}
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setUploadedUrls((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        className="text-emerald-600 hover:text-emerald-800"
                        aria-label={`Remove reference link ${index + 1}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {files.length > 0 && (
              <Button
                type="button"
                className="mt-3 w-full rounded-xl bg-amber-500 hover:bg-amber-600"
                disabled={uploading}
                onClick={handleUpload}
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {uploading
                  ? 'Uploading…'
                  : `Upload ${files.length} Reference Photo${files.length > 1 ? 's' : ''}`}
              </Button>
            )}

            {uploadError && (
              <p className="mt-2 text-xs text-red-600">{uploadError}</p>
            )}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-2 pl-4 shadow-sm">
        <span className="text-sm text-zinc-600">Quantity</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="rounded-lg"
          >
            <Minus />
          </Button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums">
            {qty}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setQty((q) => Math.min(Math.max(product.stock, 1), q + 1))
            }
            aria-label="Increase quantity"
            className="rounded-lg"
          >
            <Plus />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <Button
        size="lg"
        disabled={outOfStock}
        className="h-12 w-full rounded-xl bg-zinc-900 py-3.5 text-base font-semibold hover:bg-zinc-800"
        onClick={() => {
          addItem(product, qty, {
            isCustomized: isCustom,
            customNotes: notes.trim() || undefined,
            customImages: uploadedUrls,
          });
          openDrawer();
        }}
      >
        <ShoppingBag className="size-4" />
        {outOfStock
          ? 'Out of Stock'
          : `${isCustom ? 'Add Customized' : 'Add'} ${qty > 1 ? `${qty} ` : ''}to Cart — ${formatPrice(activePrice * qty)}`}
      </Button>

      <Button
        size="lg"
        className="h-12 w-full rounded-xl border-emerald-600/40 bg-emerald-600 py-3.5 text-base font-semibold text-white hover:bg-emerald-500 hover:text-white"
        render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
      >
        <MessageCircle className="size-4" />
        Order via WhatsApp in 1-Click
      </Button>
    </div>
  );
}