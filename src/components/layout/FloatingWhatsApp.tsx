import { MessageCircle } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';

export function FloatingWhatsApp() {
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(
    STORE_CONFIG.whatsapp.defaultMessage,
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed right-5 bottom-5 z-50 grid size-14 place-items-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-600/40 transition-transform duration-300 hover:scale-110"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
      <MessageCircle className="relative size-6" />
    </a>
  );
}