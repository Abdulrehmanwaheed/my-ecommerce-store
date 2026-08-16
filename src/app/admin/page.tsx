export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';

import { STORE_CONFIG } from '@/store.config';
import {
  fetchAllCategories,
  fetchAllOrderItems,
  fetchAllOrders,
  fetchProducts,
} from '@/lib/backend-demo';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export const metadata: Metadata = {
  title: `Admin — ${STORE_CONFIG.brand.name}`,
  description: 'Store management dashboard.',
};

export default async function AdminPage() {
  const [orders, categories, products, orderItems] = await Promise.all([
    fetchAllOrders(),
    fetchAllCategories(),
    fetchProducts(),
    fetchAllOrderItems(),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <AdminDashboard
          initialOrders={orders}
          initialOrderItems={orderItems}
          initialCategories={categories}
          initialProducts={products}
        />
      </div>
    </main>
  );
}