'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HandCoins,
  Eye,
  Loader2,
  LogOut,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  Upload,
  Wallet,
  X,
} from 'lucide-react';

import { formatPrice } from '@/lib/format';
import { isSupabaseConfigured } from '@/lib/backend-demo';
import {
  createCategoryAction,
  createProductAction,
  deleteProductAction,
  updateOrderStatusAction,
  updateProductAction,
} from '@/app/actions/admin';
import { adminLogout } from '@/app/actions/admin-auth';
import type {
  Category,
  Order,
  OrderItem,
  OrderStatus,
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
import {
  OrderDetailsModal,
  statusChip as orderStatusChip,
} from '@/components/admin/OrderDetailsModal';

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
  initialOrderItems,
  initialCategories,
  initialProducts,
}: {
  initialOrders: Order[];
  initialOrderItems: OrderItem[];
  initialCategories: Category[];
  initialProducts: Product[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialOrderItems);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [tab, setTab] = useState<'orders' | 'catalog'>('orders');
  const [orderTab, setOrderTab] = useState<'normal' | 'customized'>('normal');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
  const [allowCustomization, setAllowCustomization] = useState(false);
  const [customPrice, setCustomPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

  const itemsByOrder = useMemo(() => {
    const map = new Map<string, OrderItem[]>();
    for (const item of orderItems) {
      const list = map.get(item.order_id) ?? [];
      list.push(item);
      map.set(item.order_id, list);
    }
    return map;
  }, [orderItems]);

  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of products) map.set(product.id, product);
    return map;
  }, [products]);

  const visibleOrders = useMemo(() => {
    if (orderTab === 'normal') return orders;
    return orders.filter((order) =>
      (itemsByOrder.get(order.id) ?? []).some((item) => item.is_customized),
    );
  }, [orders, orderItems, orderTab, itemsByOrder]);

  const selectedOrder = selectedOrderId
    ? (orders.find((o) => o.id === selectedOrderId) ?? null)
    : null;

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
    setAllowCustomization(false);
    setCustomPrice('');
    setDescription('');
    setImagesText('');
    setAttributes([{ key: '', value: '' }]);
    setFormError(null);
    setFormSuccess(null);
  }

  function openCreateModal() {
    setEditingProduct(null);
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setTitle(product.title);
    setPrice(String(product.price));
    setOriginalPrice(
      product.original_price != null ? String(product.original_price) : '',
    );
    setStock(String(product.stock));
    const categoryId = product.category_id ?? '';
    setCategory(
      categories.find((c) => c.id === categoryId)?.slug ??
        categories.find((c) => c.slug === categoryId)?.slug ??
        defaultCategory,
    );
    setFeatured(product.is_featured);
    setAllowCustomization(product.allow_customization);
    setCustomPrice(
      product.custom_price != null ? String(product.custom_price) : '',
    );
    setDescription(product.description ?? '');
    setImagesText(product.images.join('\n'));
    setAttributes(
      Object.keys(product.attributes).length > 0
        ? Object.entries(product.attributes).map(([key, value]) => ({
            key,
            value: typeof value === 'string' ? value : JSON.stringify(value),
          }))
        : [{ key: '', value: '' }],
    );
    setFormError(null);
    setFormSuccess(null);
    setModalOpen(true);
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

  async function handleAdminLogout() {
    await adminLogout();
    router.push('/admin/login');
    router.refresh();
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    setUploadError(null);
    setUploadingImages(true);
    try {
      const chunks = [];
      for (let i = 0; i < files.length; i += 3) {
        chunks.push(files.slice(i, i + 3));
      }

      let uploaded: string[] = [];
      for (const chunk of chunks) {
        const formData = new FormData();
        for (const file of chunk) formData.append('files', file);
        const res = await fetch('/api/uploads', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok || !data.urls) {
          throw new Error(data.error ?? 'Upload failed.');
        }
        uploaded = [...uploaded, ...data.urls];
      }

      const existing =
        imagesText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean) ?? [];
      setImagesText([...existing, ...uploaded].join('\n'));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadingImages(false);
    }
  }

  function handleRemoveImage(image: string) {
    setImagesText((prev) =>
      prev
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && line !== image)
        .join('\n'),
    );
  }

  async function handleSubmitProduct(e: React.FormEvent) {
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
    const customPriceNum = customPrice === '' ? null : Number(customPrice);
    if (allowCustomization && (customPriceNum === null || isNaN(customPriceNum) || customPriceNum < 0)) {
      return setFormError('Enter a valid custom price when customization is enabled.');
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
      const payload = {
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
        allow_customization: allowCustomization,
        custom_price: customPriceNum,
      };

      const result = editingProduct
        ? await updateProductAction(editingProduct.id, payload)
        : await createProductAction(payload);

      if (!result.success) {
        setFormError(result.error ?? 'Could not save product.');
        return;
      }

      const updatedProduct: Product = {
        ...(editingProduct ??
          ({
            id: result.id ?? crypto.randomUUID(),
            created_at: new Date().toISOString(),
          } as Product)),
        title,
        slug,
        description: description || null,
        price: priceNum,
        original_price: originalPrice ? Number(originalPrice) : null,
        stock: stockNum,
        images,
        category_id: slugToId.get(category) ?? editingProduct?.category_id ?? category,
        attributes: attributesMap,
        is_featured: featured,
        allow_customization: allowCustomization,
        custom_price: customPriceNum,
      };

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p)),
        );
        setFormSuccess(`Product "${title}" updated.`);
      } else {
        setProducts((prev) => [updatedProduct, ...prev]);
        setFormSuccess(`Product "${title}" created (#${result.id?.slice(0, 8)}).`);
      }
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
          <button
            type="button"
            onClick={handleAdminLogout}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-700 px-3 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
          <Button
            className="h-9 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200"
            onClick={openCreateModal}
          >
            <PackagePlus className="size-4" />
            Add Product
          </Button>
          <Button
            className="h-9 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200"
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Orders</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {visibleOrders.length} of {orders.length} orders shown.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => setOrderTab('normal')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                orderTab === 'normal'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              📦 Normal Orders
            </button>
            <button
              type="button"
              onClick={() => setOrderTab('customized')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                orderTab === 'customized'
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              ✨ Customized Orders
            </button>
          </div>
        </div>

        {statusError && (
          <p className="border-b border-zinc-800 bg-red-500/10 px-5 py-2.5 text-xs text-red-400">
            {statusError}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-widest text-zinc-500">
                <th className="px-5 py-3 font-medium">Order ID &amp; Date</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    {orderTab === 'customized'
                      ? 'No customized orders yet. Custom orders appear here when a customer picks "Customize This Product".'
                      : 'No orders yet. Place a test order from the storefront.'}
                  </td>
                </tr>
              ) : (
                visibleOrders.map((order) => {
                  const items = itemsByOrder.get(order.id) ?? [];
                  const hasCustomized = items.some((item) => item.is_customized);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="cursor-pointer border-b border-zinc-800/70 transition-colors last:border-0 hover:bg-zinc-800/40"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-mono text-xs font-semibold text-zinc-200">
                          #{order.order_number}
                          {hasCustomized && (
                            <span className="ml-2 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                              ✨
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-zinc-100">
                          {order.customer_name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-zinc-500 tabular-nums">
                          {order.phone_whatsapp}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-extrabold text-emerald-400 tabular-nums">
                          {formatPrice(order.total_amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-lg bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300">
                          {order.payment_method === 'COD'
                            ? 'COD'
                            : order.payment_method === 'ONLINE_CARD'
                              ? 'Card / Wallet'
                              : 'Mobile Wallet'}
                        </span>
                        {order.payment_gateway_ref && (
                          <p className="mt-1 font-mono text-[10px] text-zinc-600">
                            Txn: {order.payment_gateway_ref}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusChip[order.order_status]}`}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-800 px-3 text-xs font-semibold text-zinc-300 transition-colors hover:bg-emerald-600/15 hover:text-emerald-400">
                          <Eye className="size-3.5" />
                          View Order Details
                        </span>
                      </td>
                    </tr>
                  );
                })
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
                            {product.allow_customization && (
                              <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                                ✨ Customizable
                                {product.custom_price != null &&
                                  ` · ${formatPrice(product.custom_price)}`}
                              </p>
                            )}
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-800 px-3 text-xs font-semibold text-zinc-300 transition-colors hover:bg-amber-500/15 hover:text-amber-400"
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </button>
                          {deleting[product.id] === 'busy' ? (
                            <Loader2 className="size-4 animate-spin text-zinc-500" />
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
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? `Update "${editingProduct.title}" — changes go live in the storefront instantly.`
                : 'New products appear instantly in the storefront catalog.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitProduct} className="grid gap-4">
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
                  Product Images
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60">
                    <Upload className="size-3.5" />
                    {uploadingImages ? 'Uploading…' : 'Upload images'}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      disabled={uploadingImages}
                      onChange={handleImageUpload}
                    />
                  </label>
                  <span className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP up to 5MB each
                  </span>
                </div>
                {uploadError && (
                  <p className="mt-1.5 text-xs text-destructive">{uploadError}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {imagesText
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((url) => (
                      <div
                        key={url}
                        className="group relative size-20 overflow-hidden rounded-xl border border-border/60 bg-zinc-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt="Product preview"
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          aria-label="Remove image"
                          onClick={() => handleRemoveImage(url)}
                          className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-zinc-900/70 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  {imagesText
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No images yet — upload photos to get started.
                    </p>
                  )}
                </div>
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

            <button
              type="button"
              onClick={() => setAllowCustomization((c) => !c)}
              className={`flex items-center justify-between rounded-xl border p-3 text-sm transition-colors ${
                allowCustomization
                  ? 'border-primary bg-primary/5'
                  : 'border-border/60 hover:border-border'
              }`}
            >
              <span>
                <span className="block font-medium">
                  Allow Customization for this Product
                </span>
                <span className="block text-xs text-muted-foreground">
                  Customers can order a tailored version with notes &amp; photos
                </span>
              </span>
              <span
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  allowCustomization ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-0.5 size-4 rounded-full bg-background shadow transition-all ${
                    allowCustomization ? 'left-4.5' : 'left-0.5'
                  }`}
                />
              </span>
            </button>

            {allowCustomization && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Custom Price (PKR)
                </label>
                <Input
                  placeholder="e.g. 5999"
                  inputMode="numeric"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Charged when a customer selects &quot;Customize This
                  Product&quot; instead of the standard price.
                </p>
              </div>
            )}

            {formError && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {formError}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : editingProduct ? (
                  <Pencil className="size-4" />
                ) : (
                  <PackagePlus className="size-4" />
                )}
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order details drawer */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          items={itemsByOrder.get(selectedOrder.id) ?? []}
          productsById={productsById}
          onClose={() => setSelectedOrderId(null)}
          onStatusChange={async (orderId, status) => {
            await handleStatusChange(orderId, status);
          }}
        />
      )}
    </div>
  );
}