import { fetchAllCategories, fetchProducts } from '@/lib/backend-demo';
import type { Product } from '@/types/database';
import { Hero } from '@/components/storefront/Hero';
import { ProductGrid } from '@/components/storefront/product-grid';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const { cat } = await searchParams;

  let products: Product[] = [];
  let categories: { id: string; slug: string; name: string }[] = [];

  try {
    const [fetchedProducts, fetchedCategories] = await Promise.all([
      fetchProducts(),
      fetchAllCategories(),
    ]);
    products = fetchedProducts;
    categories = fetchedCategories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
    }));
  } catch (error) {
    console.error('Failed to load homepage data:', error);
  }

  return (
    <main>
      <Hero products={products} />

      {/* Catalog */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <ProductGrid
          products={products}
          categories={categories}
          initialCategory={cat}
        />
      </section>
    </main>
  );
}