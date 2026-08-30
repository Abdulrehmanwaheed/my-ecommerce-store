import type { Metadata } from 'next';

import { STORE_CONFIG } from '@/store.config';
import { fetchAllCategories } from '@/lib/backend-demo';
import { Providers } from '@/components/providers';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar, type NavCategory } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import './globals.css';

export const metadata: Metadata = {
  title: `${STORE_CONFIG.brand.name} — ${STORE_CONFIG.brand.tagline}`,
  description: STORE_CONFIG.brand.tagline,
};

function distinctCategories(categories: NavCategory[]): NavCategory[] {
  const seen = new Set<string>();
  const distinct: NavCategory[] = [];
  for (const category of categories) {
    const key = category.name.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      distinct.push(category);
    }
  }
  return distinct;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: NavCategory[] = [];
  try {
    const fetched = await fetchAllCategories();
    categories = distinctCategories(
      fetched.map((category) => ({
        slug: category.slug,
        name: category.name,
      })),
    );
  } catch (error) {
    console.error('Failed to load categories for layout:', error);
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 font-sans antialiased">
        <Providers>
          <AnnouncementBar />
          <Navbar categories={categories} />
          {children}
          <Footer categories={categories} />
          <FloatingWhatsApp />
        </Providers>
      </body>
    </html>
  );
}