import type { Metadata } from 'next';
import { STORE_CONFIG } from '@/store.config';
import { Header } from '@/components/layout/Header';
import './globals.css';

export const metadata: Metadata = {
  title: `${STORE_CONFIG.brand.name} — ${STORE_CONFIG.brand.tagline}`,
  description: STORE_CONFIG.brand.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}