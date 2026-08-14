'use client';

import { useMemo, useState } from 'react';
import {
  HandCoins,
  Loader2,
  PackagePlus,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  Wallet,
} from 'lucide-react';

import { formatPrice } from '@/lib/format';
import { isSupabaseConfigured } from '@/lib/backend-demo';
import {
  createCategoryAction,
  createProductAction,
  deleteProductAction,
  updateOrderStatusAction,
} from '@/app/actions/admin';
import type {
  Category,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
} from '@/types/database';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const paymentChip: Record<PaymentStatus, string> = {
  Paid: 'bg-emerald-500/15 text-emerald-400',
  Unpaid: 'bg-amber-500/15 text-amber-400',
  Failed: 'bg-red-500/15 text-red-400',
  Refunded: 'bg-zinc-500/15 text-zinc-400',
};

interface AttributeRow {
  key: string;
  value: string;
}

function parseAttributeValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // keep as raw string
    }
  }
  return trimmed;
}

export function AdminDashboard({
  initialOrders,
  initialCategories,
  initialProducts,
}: {
  initialOrders: Order[];
  initialCategories: Category[];
  initialProducts: Product[];
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [tab, setTab] = useState<'orders' | 'catalog'>('orders');
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategory, setProdCategory] = useState('all');
  const [deleting, setDeleting] = useState<
    Record<string, 'confirm' | 'busy' | undefined>
  >({});
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const defaultCategory = categories[0]?.slug ?? '';
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [statusError, setStatusError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catBusy, setCatBusy] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [attributes, setAttributes] = useState<AttributeRow[]>([
    { key: '', value: '' },
  ]);

  const metrics = useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const pendingCod = orders.filter(
      (o) => o.payment_method === 'COD' && o.payment_status === 'Unpaid',
    ).length;
    return { revenue, orders: orders.length, pendingCod };
  }, [orders]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) {
      map.set(category.id, category.name);
      map.set(category.slug, category.name);
    }
    return map;
  }, [categories]);

  const slugToId = useMemo(
    () => new Map(categories.map((category) => [category.slug, category.id])),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    const query = prodSearch.trim().toLowerCase();
    const categoryId = slugToId.get(prodCategory) ?? prodCategory;
    return products.filter((product) => {
      if (prodCategory !== 'all' && product.category_id !== categoryId) return false;
      if (query && !product.title.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [products, prodSearch, prodCategory, slugToId]);

  async function handleDeleteProduct(productId: string) {
    setDeleteError(null);
    if (deleting[productId] === 'confirm') {
      setDeleting((d) => ({ ...d, [productId]: 'busy' }));
      const result = await deleteProductAction(productId);
      if (!result.success) {
        setDeleteError(result.error ?? 'Could not delete product.');
        setDeleting((d) => ({ ...d, [productId]: undefined }));
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setDeleting((d) => ({ ...d, [productId]: undefined }));
    } else {
      setDeleting((d) => ({ ...d, [productId]: 'confirm' }));
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setCatError(null);
    const name = catName.trim();
    if (!name) {
      setCatError('Category name is required.');
      return;
    }
    setCatBusy(true);
    try {
      const result = await createCategoryAction(name, catSlug.trim() || undefined);
      if (!result.success) {
        setCatError(result.error ?? 'Could not create category.');
        return;
      }
      setCategories((prev) => [
        ...prev,
        {
          id: result.id ?? name,
          name,
          slug: catSlug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          created_at: new Date().toISOString(),
        },
      ]);
      setCategoryModalOpen(false);
      setCatName('');
      setCatSlug('');
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Could not create category.');
    } finally {
      setCatBusy(false);
    }
  }

  function resetForm() {
    setTitle('');
    setPrice('');
    setOriginalPrice('');
    setStock('');
    setCategory(defaultCategory);
    setFeatured(false);
    setDescription('');
    setImagesText('');
    setAttributes([{ key: '', value: '' }]);
    setFormError(null);
    setFormSuccess(null);
  }

  async function handleStatusChange(orderId: string, status: string) {
    const nextStatus = status as OrderStatus;
    setStatusError(null);
    setBusy((b) => ({ ...b, [orderId]: true }));

    const previous = orders;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: nextStatus } : o)),
    );

    const result = await updateOrderStatusAction(orderId, nextStatus);
    setBusy((b) => ({ ...b, [orderId]: false }));

    if (!result.success) {
      setOrders(previous);
      setStatusError(result.error ?? 'Status update failed.');
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!title.trim()) return setFormError('Title is required.');
    if (!price || isNaN(priceNum) || priceNum < 0) {
      return setFormError('Enter a valid price.');
    }
    if (stock === '' || isNaN(stockNum) || stockNum < 0) {
      return setFormError('Enter valid stock.');
    }

    const attributesMap: Record<string, any> = {};
    for (const row of attributes) {
      if (!row.key.trim()) continue;
      attributesMap[row.key.trim()] = parseAttributeValue(row.value);
    }
    const images = imagesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    setSubmitting(true);
    try {
      const result = await createProductAction({
        title,
        slug,
        description: description || null,
        price: priceNum,
        original_price: originalPrice ? Number(originalPrice) : null,
        stock: stockNum,
        images,
        category_id: category,
        attributes: attributesMap,
        is_featured: featured,
      });
      if (!result.success) {
        setFormError(result.error ?? 'Could not create product.');
        return;
      }
      setFormSuccess(`Product "${title}" created (#${result.id?.slice(0, 8)}).`);
      resetForm();
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create product.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Admin</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage orders and catalog.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge className="border-zinc-700 bg-zinc-900 text-zinc-400">
            {isSupabaseConfigured() ? 'Live Supabase' : 'Demo data'}
          </Badge>
          <Button
            className="h-9 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200"
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            <PackagePlus className="size-4" />
            Add Product
          </Button>
          <Button
            variant="outline"
            className="h-9 rounded-xl"
            onClick={() => {
              setCatError(null);
              setCatName('');
              setCatSlug('');
              setCategoryModalOpen(true);
            }}
          >
            <Plus className="size-4" />
            New Category
          </Button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="mt-8 flex w-fit items-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-1">
        <button
          type="button"
          onClick={() => setTab('orders')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'orders'
              ? 'bg-white text-zinc-950'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => setTab('catalog')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'catalog'
              ? 'bg-white text-zinc-950'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Catalog ({products.length})
        </button>
      </div>

      {/* Metrics */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Total Revenue',
            value: formatPrice(metrics.revenue),
            icon: <Wallet className="size-4" />,
          },
          {
            label: 'Orders',
            value: String(metrics.orders),
            icon: <ShoppingBag className="size-4" />,
          },
          {
            label: 'Pending COD',
            value: String(metrics.pendingCod),
            icon: <HandCoins className="size-4" />,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                {metric.label}
              </span>
              <span className="grid size-7 place-items-center rounded-lg bg-zinc-800 text-zinc-300">
                {metric.icon}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Orders */}
      {tab === 'orders' && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h2 className="text-sm font-semibold">Orders</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            COD and online orders, newest first.
          </p>
        </div>

        {statusError && (
          <p className="border-b border-zinc-800 bg-red-500/10 px-5 py-2.5 text-xs text-red-400">
            {statusError}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-widest text-zinc-500">
                <th className="px-5 py-3 font-medium">Order #</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">WhatsApp Phone</th>
                <th className="px-5 py-3 font-medium">City</th>
                <th className="px-5 py-3 font-medium">Payment Status</th>
                <th className="px-5 py-3 font-medium">Order Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    No orders yet. Place a test order from the storefront.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-800/70 transition-colors last:border-0 hover:bg-zinc-800/40"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-zinc-300">
                      #{order.order_number}
                    </td>
                    <td className="px-5 py-3.5 font-medium">{order.customer_name}</td>
                    <td className="px-5 py-3.5 text-zinc-400 tabular-nums">
                      {order.phone_whatsapp}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400">{order.city ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentChip[order.payment_status]}`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Select
                          value={order.order_status}
                          onValueChange={(value) => {
                            if (value) handleStatusChange(order.id, value);
                          }}
                          disabled={busy[order.id]}
                        >
                          <SelectTrigger
                            size="sm"
                            className="border-zinc-700 bg-zinc-800 text-zinc-200 dark:bg-zinc-800"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {busy[order.id] && (
                          <Loader2 className="size-3.5 animate-spin text-zinc-500" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Catalog */}
      {tab === 'catalog' && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Products</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                {filteredProducts.length} of {products.length} products shown.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="search"
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  placeholder="Search by name…"
                  className="h-9 w-52 rounded-xl border border-zinc-700 bg-zinc-800 py-2 pr-3 pl-8 text-xs text-zinc-200 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500"
                />
              </div>
              <Select
                value={prodCategory}
                onValueChange={(v) => setProdCategory(v ?? 'all')}
              >
                <SelectTrigger className="h-9 w-44 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {deleteError && (
            <p className="border-b border-zinc-800 bg-red-500/10 px-5 py-2.5 text-xs text-red-400">
              {deleteError}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-widest text-zinc-500">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Featured</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                      {products.length === 0
                        ? 'No products yet. Add your first product above.'
                        : 'No products match this search / category.'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-zinc-800/70 transition-colors last:border-0 hover:bg-zinc-800/40"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-zinc-800 text-sm font-bold text-zinc-400">
                            {product.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.images[0]}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              product.title.charAt(0)
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="max-w-56 truncate font-medium text-zinc-100">
                              {product.title}
                            </p>
                            <p className="max-w-56 truncate font-mono text-[10px] text-zinc-600">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-lg bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                          {categoryNameById.get(product.category_id ?? '') ??
                            'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold tabular-nums text-zinc-100">
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price &&
                          product.original_price > product.price && (
                            <span className="ml-1.5 text-xs text-zinc-600 line-through tabular-nums">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={
                            product.stock === 0
                              ? 'font-semibold text-red-400'
                              : product.stock <= 10
                                ? 'font-semibold text-amber-400'
                                : 'text-zinc-400'
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {product.is_featured ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-400">
                            <Star className="size-3 fill-current" />
                            Featured
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {deleting[product.id] === 'busy' ? (
                          <Loader2 className="ml-auto size-4 animate-spin text-zinc-500" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
                              deleting[product.id] === 'confirm'
                                ? 'bg-red-600 text-white hover:bg-red-500'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-red-600/15 hover:text-red-400'
                            }`}
                          >
                            <Trash2 className="size-3.5" />
                            {deleting[product.id] === 'confirm'
                              ? 'Confirm Delete'
                              : 'Delete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New category modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
            <DialogDescription>
              Categories appear in the storefront filters instantly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="grid gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Category Name
              </label>
              <Input
                placeholder="e.g. Gaming & Consoles"
                value={catName}
                onChange={(e) => {
                  setCatName(e.target.value);
                  if (!catSlug.trim()) {
                    setCatSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, ''),
                    );
                  }
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Slug (URL-safe, optional)
              </label>
              <Input
                placeholder="cat-gaming"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
              />
            </div>
            {catError && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {catError}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={catBusy}>
                {catBusy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Create Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add product modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>
              New products appear instantly in the storefront catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProduct} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Title
                </label>
                <Input
                  placeholder="e.g. Wireless Charger Pro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Price (PKR)
                </label>
                <Input
                  placeholder="1999"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Original Price
                </label>
                <Input
                  placeholder="Optional"
                  inputMode="numeric"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Stock
                </label>
                <Input
                  placeholder="50"
                  inputMode="numeric"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Category
                </label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v ?? defaultCategory)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={categories.length === 0 ? 'No categories yet' : undefined} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setCategoryModalOpen(true)}
                >
                  <Plus className="size-3.5" />
                  New Category
                </Button>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Description
                </label>
                <Input
                  placeholder="Short selling line"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Image URLs (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="https://example.com/product-1.jpg&#10;https://example.com/product-2.jpg"
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  className="min-h-20 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Attributes (JSONB)
              </label>
              <div className="space-y-2">
                {attributes.map((row, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="key (e.g. warranty)"
                      value={row.key}
                      onChange={(e) =>
                        setAttributes((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, key: e.target.value } : r,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder='value (e.g. "1 Year" or [1,2]'
                      value={row.value}
                      onChange={(e) =>
                        setAttributes((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, value: e.target.value } : r,
                          ),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setAttributes((prev) => prev.filter((_, i) => i !== index))
                      }
                      aria-label="Remove attribute"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setAttributes((prev) => [...prev, { key: '', value: '' }])}
              >
                <Plus className="size-3.5" />
                Add Attribute
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setFeatured((f) => !f)}
              className={`flex items-center justify-between rounded-xl border p-3 text-sm transition-colors ${
                featured
                  ? 'border-primary bg-primary/5'
                  : 'border-border/60 hover:border-border'
              }`}
            >
              <span>
                <span className="block font-medium">Featured product</span>
                <span className="block text-xs text-muted-foreground">
                  Show in bento spotlight &amp; filters
                </span>
              </span>
              <span
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  featured ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-0.5 size-4 rounded-full bg-background shadow transition-all ${
                    featured ? 'left-4.5' : 'left-0.5'
                  }`}
                />
              </span>
            </button>

            {formError && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {formError}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <PackagePlus className="size-4" />
                )}
                Create Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}