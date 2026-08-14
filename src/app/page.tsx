import { fetchAllCategories, fetchProducts } from '@/lib/backend-demo';
import type { Product } from '@/types/database';
import { Hero } from '@/components/storefront/Hero';
import { CatalogSection } from '@/components/storefront/catalog-section';

export const dynamic = 'force-dynamic';

function distinctCategories(
  categories: { id: string; slug: string; name: string }[],
): { id: string; slug: string; name: string }[] {
  const seen = new Set<string>();
  const distinct: { id: string; slug: string; name: string }[] = [];
  for (const category of categories) {
    const key = category.name.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      distinct.push(category);
    }
  }
  return distinct;
}

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
    categories = distinctCategories(
      fetchedCategories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
      })),
    );
  } catch (error) {
    console.error('Failed to load homepage data:', error);
  }

  return (
    <main>
      <Hero products={products} />
      <CatalogSection
        products={products}
        categories={categories}
        initialCategory={cat}
      />
    </main>
  );
}