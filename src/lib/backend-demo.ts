import { STORE_CONFIG } from '../store.config';
import type {
  Category,
  CreateOrderInput,
  CreateProductInput,
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  Product,
} from '../types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const DEMO_CATEGORIES: { id: string; name: string }[] = [
  { id: 'cat-tech', name: 'Smart Tech' },
  { id: 'cat-home', name: 'Home & Utility' },
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-prod-001',
    title: 'Wireless Earbuds Pro',
    slug: 'wireless-earbuds-pro',
    description: 'Noise-cancelling wireless earbuds with premium sound.',
    price: 4500,
    original_price: 5500,
    stock: 50,
    images: ['/images/products/earbuds.jpg'],
    category_id: 'cat-tech',
    attributes: { warranty: '1 Year', color: 'Black', batteryLife: '6 hours' },
    is_featured: true,
    allow_customization: false,
    custom_price: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-prod-002',
    title: 'Smart Watch X1',
    slug: 'smart-watch-x1',
    description: 'Fitness tracking smart watch with AMOLED display.',
    price: 12000,
    original_price: 15000,
    stock: 25,
    images: ['/images/products/smart-watch.jpg'],
    category_id: 'cat-tech',
    attributes: { warranty: '1 Year', display: 'AMOLED', waterResistant: 'IP68' },
    is_featured: true,
    allow_customization: false,
    custom_price: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-prod-003',
    title: 'Bluetooth Speaker Boom',
    slug: 'bluetooth-speaker-boom',
    description: 'Portable bass-heavy speaker with 14h playtime.',
    price: 3500,
    original_price: 4200,
    stock: 45,
    images: ['/images/products/speaker.jpg'],
    category_id: 'cat-tech',
    attributes: { warranty: '6 Months', colors: ['Black', 'Blue'], connectivity: 'Bluetooth 5.3' },
    is_featured: false,
    allow_customization: false,
    custom_price: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-prod-004',
    title: 'Air Fryer 5L',
    slug: 'air-fryer-5l',
    description: 'Oil-free frying with 8 one-touch presets.',
    price: 18000,
    original_price: 22000,
    stock: 18,
    images: ['/images/products/air-fryer.jpg'],
    category_id: 'cat-home',
    attributes: { capacity: '5L', wattage: '1800W', presets: 8 },
    is_featured: true,
    allow_customization: false,
    custom_price: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-prod-005',
    title: 'Electric Kettle 1.5L',
    slug: 'electric-kettle-15l',
    description: 'Fast-boil steel kettle with auto shut-off.',
    price: 2800,
    original_price: 3200,
    stock: 60,
    images: ['/images/products/kettle.jpg'],
    category_id: 'cat-home',
    attributes: { capacity: '1.5L', wattage: '1500W', autoShutoff: true },
    is_featured: false,
    allow_customization: false,
    custom_price: null,
    created_at: new Date().toISOString(),
  },
  {
id: 'demo-prod-006',
    title: 'Handmade Leather Bag',
    slug: 'handmade-leather-bag',
    description: 'Handcrafted genuine leather tote bag.',
    price: 5200,
    original_price: 6500,
    stock: 20,
    images: ['/images/products/leather-bag.jpg'],
    category_id: 'cat-home',
    attributes: { material: 'Leather', color: 'Brown', capacity: '15L' },
    is_featured: false,
    allow_customization: true,
    custom_price: 7200,
    created_at: new Date().toISOString(),
  },
];

const mockCustomers: Customer[] = [];
const mockOrders: Order[] = [];
const mockOrderItems: OrderItem[] = [];
let mockOrderNumber = 1001;
let warned = false;

// Runtime copy so mock-mode mutations (e.g. admin product creation) survive
// within the process while DEMO_PRODUCTS stays a pristine seed.
const runtimeProducts: Product[] = [...DEMO_PRODUCTS];
const runtimeCategories: Category[] = DEMO_CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.id,
  created_at: new Date().toISOString(),
}));

function warnMockFallback(fnName: string): void {
  if (!warned) {
    console.info(
      '[backend-demo] Supabase env vars not set — using in-memory mock data for ' +
        `"${fnName}". Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY to hit the real database.`,
    );
    warned = true;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const { data, error } = await createAdminClient()
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[backend-demo] Supabase fetch error (products):', error.message);
      return [];
    }
    return (data ?? []) as Product[];
  }
  warnMockFallback('fetchProducts');
  return [...runtimeProducts];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const { data, error } = await createAdminClient()
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      console.warn('[backend-demo] Supabase fetch error (product by slug):', error.message);
      return null;
    }
    return (data as Product | null) ?? null;
  }
  warnMockFallback('fetchProductBySlug');
  return runtimeProducts.find((p) => p.slug === slug) ?? null;
}

export async function fetchOrderById(
  id: string,
): Promise<{ order: Order; items: (OrderItem & { product_title?: string; product_images?: string[] })[] } | null> {
  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const supabase = createAdminClient();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (orderError) {
      console.warn('[backend-demo] Supabase fetch error (order):', orderError.message);
      return null;
    }
    if (!order) return null;

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);
    if (itemsError) {
      console.warn('[backend-demo] Supabase fetch error (order items):', itemsError.message);
      return null;
    }

    const productIds = (items ?? [])
      .map((i) => i.product_id)
      .filter((id): id is string => Boolean(id));

    const { data: products } = await supabase
      .from('products')
      .select('id, title, images')
      .in('id', productIds);

    const productMap = new Map((products ?? []).map((p) => [p.id, p]));

    const enrichedItems = (items ?? []).map((item) => {
      const product = item.product_id ? productMap.get(item.product_id) : undefined;
      return {
        ...item,
        product_title: product?.title,
        product_images: product?.images,
      };
    });

    return { order: order as Order, items: enrichedItems };
  }
  warnMockFallback('fetchOrderById');
  const order = mockOrders.find((o) => o.id === id);
  if (!order) return null;
  const items = mockOrderItems.filter((i) => i.order_id === id);
  const enrichedItems = items.map((item) => {
    const product = runtimeProducts.find((p) => p.id === item.product_id);
    return {
      ...item,
      product_title: product?.title,
      product_images: product?.images,
    };
  });
  return { order, items: enrichedItems };
}

export interface CreateOrderDemoResult {
  success: boolean;
  error?: string;
  orderId?: string;
  orderNumber?: number;
  redirectUrl?: string;
  requiresPayment?: boolean;
  gatewayUrl?: string;
}

/**
 * Drop-in mirror of src/app/actions/create-order.ts using in-memory data,
 * so order flows can be tested before Supabase credentials exist.
 */
export async function createOrderDemo(
  input: CreateOrderInput,
): Promise<CreateOrderDemoResult> {
  const { paymentMethods, shipping } = STORE_CONFIG;

  if (!input.customer_name?.trim()) return { success: false, error: 'Customer name is required.' };
  if (!input.phone_whatsapp?.trim()) return { success: false, error: 'Phone number is required.' };
  if (!input.items?.length) return { success: false, error: 'Cart is empty.' };
  if (!input.payment_method) return { success: false, error: 'Payment method is required.' };

  if (input.payment_method === 'COD' && !paymentMethods.cod) {
    return { success: false, error: 'Cash on Delivery is currently disabled.' };
  }
  if (input.payment_method === 'ONLINE_CARD' && !paymentMethods.cardPayment) {
    return { success: false, error: 'Online card payment is currently disabled.' };
  }

let subtotal = 0;
  const items: OrderItem[] = [];

  for (const item of input.items) {
    const product = runtimeProducts.find((p) => p.id === item.product_id);
    if (!product) return { success: false, error: `Product not found: ${item.product_id}` };
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return { success: false, error: `Invalid quantity for product: ${product.title}` };
    }
    const isCustomized = item.is_customized === true;
    if (isCustomized && !product.allow_customization) {
      return {
        success: false,
        error: `"${product.title}" does not support customization.`,
      };
    }
    const unitPrice = isCustomized
      ? (product.custom_price ?? product.price)
      : product.price;
    subtotal += unitPrice * item.quantity;
    items.push({
      id: crypto.randomUUID(),
      order_id: '',
      product_id: product.id,
      quantity: item.quantity,
      unit_price: unitPrice,
      is_customized: isCustomized,
      custom_notes: isCustomized ? (item.custom_notes ?? null) : null,
      custom_images: isCustomized ? (item.custom_images ?? []) : [],
    });
  }

  const shippingFee = subtotal >= shipping.freeShippingThreshold ? 0 : shipping.flatRateFee;
  const totalAmount = subtotal + shippingFee;

  let customer = mockCustomers.find((c) => c.phone_whatsapp === input.phone_whatsapp.trim());
  if (!customer) {
    customer = {
      id: crypto.randomUUID(),
      full_name: input.customer_name.trim(),
      phone_whatsapp: input.phone_whatsapp.trim(),
      city: input.city ?? null,
      address: input.address ?? null,
      created_at: new Date().toISOString(),
    };
    mockCustomers.push(customer);
  } else {
    customer.full_name = input.customer_name.trim();
    customer.city = input.city ?? null;
    customer.address = input.address ?? null;
  }

  const order: Order = {
    id: crypto.randomUUID(),
    order_number: mockOrderNumber++,
    customer_id: customer.id,
    customer_name: input.customer_name.trim(),
    phone_whatsapp: input.phone_whatsapp.trim(),
    city: input.city ?? null,
    address: input.address ?? null,
    total_amount: totalAmount,
    shipping_fee: shippingFee,
    payment_method: input.payment_method,
    payment_status: 'Unpaid',
    order_status: 'Pending',
    payment_gateway_ref: null,
    notes: input.notes ?? null,
    created_at: new Date().toISOString(),
  };

  mockOrders.push(order);
  items.forEach((item) => {
    item.order_id = order.id;
    mockOrderItems.push(item);
    const product = runtimeProducts.find((p) => p.id === item.product_id);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
    }
  });

  if (input.payment_method === 'COD') {
    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      redirectUrl: `/order-success/${order.id}`,
    };
  }

  return {
    success: true,
    orderId: order.id,
    requiresPayment: true,
    gatewayUrl: `/api/payments/initiate?orderId=${order.id}`,
  };
}

// ------------------------------------------------------------
// Admin helpers
// ------------------------------------------------------------

export async function fetchAllCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const { data, error } = await createAdminClient()
      .from('categories')
      .select('id, name, slug, created_at')
      .order('name', { ascending: true });
    if (error) {
      console.warn('[backend-demo] Supabase fetch error (categories):', error.message);
      return [];
    }
    return (data ?? []) as Category[];
  }
  warnMockFallback('fetchAllCategories');
  return [...runtimeCategories];
}

export interface AdminResult {
  success: boolean;
  error?: string;
  id?: string;
}

async function resolveCategoryId(
  supabase: SupabaseClient,
  categorySlug: string | null,
): Promise<string | null | Error> {
  const cleanSlug = categorySlug?.trim() || null;
  if (!cleanSlug) return null;
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', cleanSlug)
    .maybeSingle();
  if (catError) {
    return new Error(`Failed to resolve category: ${catError.message}`);
  }
  if (category) return category.id;
  const { data: created, error: createError } = await supabase
    .from('categories')
    .insert({ name: cleanSlug, slug: cleanSlug })
    .select('id')
    .single();
  if (createError) {
    return new Error(`Failed to create category: ${createError.message}`);
  }
  return created.id;
}

export async function fetchAllOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const { data, error } = await createAdminClient()
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[backend-demo] Supabase fetch error (orders):', error.message);
      return [];
    }
    return (data ?? []) as Order[];
  }
  warnMockFallback('fetchAllOrders');
  return [...mockOrders].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function fetchAllOrderItems(): Promise<OrderItem[]> {
  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const { data, error } = await createAdminClient()
      .from('order_items')
      .select('*');
    if (error) {
      console.warn(
        '[backend-demo] Supabase fetch error (order items):',
        error.message,
      );
      return [];
    }
    return (data ?? []) as OrderItem[];
  }
  warnMockFallback('fetchAllOrderItems');
  return [...mockOrderItems];
}

const VALID_ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export async function updateOrderStatus(
  orderId: string,
  orderStatus: OrderStatus,
): Promise<AdminResult> {
  if (!VALID_ORDER_STATUSES.includes(orderStatus)) {
    return { success: false, error: `Invalid order status: ${orderStatus}` };
  }

  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const { data, error } = await createAdminClient()
      .from('orders')
      .update({ order_status: orderStatus })
      .eq('id', orderId)
      .select('id')
      .maybeSingle();
    if (error) {
      return { success: false, error: `Failed to update order: ${error.message}` };
    }
    if (!data) return { success: false, error: 'Order not found' };
    return { success: true, id: data.id };
  }

  const order = mockOrders.find((o) => o.id === orderId);
  if (!order) return { success: false, error: 'Order not found' };
  order.order_status = orderStatus;
  return { success: true, id: order.id };
}

export async function adminCreateProduct(
  input: CreateProductInput,
): Promise<AdminResult> {
  if (!input.title?.trim()) return { success: false, error: 'Title is required.' };
  if (!input.slug?.trim()) return { success: false, error: 'Slug is required.' };
  if (input.price == null || input.price < 0) {
    return { success: false, error: 'Valid price is required.' };
  }
  if (input.stock == null || input.stock < 0) {
    return { success: false, error: 'Valid stock is required.' };
  }

  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const supabase = createAdminClient();

    const categoryId = await resolveCategoryId(supabase, input.category_id ?? null);
    if (categoryId instanceof Error) {
      return { success: false, error: categoryId.message };
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        title: input.title.trim(),
        slug: input.slug.trim(),
        description: input.description ?? null,
        price: input.price,
        original_price: input.original_price ?? null,
        stock: input.stock,
        images: input.images ?? [],
        category_id: categoryId,
        attributes: input.attributes ?? {},
        is_featured: input.is_featured ?? false,
        allow_customization: input.allow_customization ?? false,
        custom_price: input.custom_price ?? null,
      })
      .select('id')
      .single();
    if (error) {
      return { success: false, error: `Failed to create product: ${error.message}` };
    }
    return { success: true, id: data.id };
  }

  warnMockFallback('adminCreateProduct');
  const product: Product = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    slug: input.slug.trim(),
    description: input.description ?? null,
    price: input.price,
    original_price: input.original_price ?? null,
    stock: input.stock,
    images: input.images ?? [],
    category_id: input.category_id ?? null,
    attributes: input.attributes ?? {},
    is_featured: input.is_featured ?? false,
    allow_customization: input.allow_customization ?? false,
    custom_price: input.custom_price ?? null,
    created_at: new Date().toISOString(),
  };
  runtimeProducts.unshift(product);
  return { success: true, id: product.id };
}

export async function adminUpdateProduct(
  productId: string,
  input: CreateProductInput,
): Promise<AdminResult> {
  if (!productId?.trim()) return { success: false, error: 'Product id is required.' };
  if (!input.title?.trim()) return { success: false, error: 'Title is required.' };
  if (!input.slug?.trim()) return { success: false, error: 'Slug is required.' };
  if (input.price == null || input.price < 0) {
    return { success: false, error: 'Valid price is required.' };
  }
  if (input.stock == null || input.stock < 0) {
    return { success: false, error: 'Valid stock is required.' };
  }

  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const supabase = createAdminClient();

    const categoryId = await resolveCategoryId(supabase, input.category_id ?? null);
    if (categoryId instanceof Error) {
      return { success: false, error: categoryId.message };
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        title: input.title.trim(),
        slug: input.slug.trim(),
        description: input.description ?? null,
        price: input.price,
        original_price: input.original_price ?? null,
        stock: input.stock,
        images: input.images ?? [],
        category_id: categoryId,
        attributes: input.attributes ?? {},
        is_featured: input.is_featured ?? false,
        allow_customization: input.allow_customization ?? false,
        custom_price: input.custom_price ?? null,
      })
      .eq('id', productId)
      .select('id')
      .maybeSingle();
    if (error) {
      return { success: false, error: `Failed to update product: ${error.message}` };
    }
    if (!data) return { success: false, error: 'Product not found.' };
    return { success: true, id: data.id };
  }

  warnMockFallback('adminUpdateProduct');
  const index = runtimeProducts.findIndex((p) => p.id === productId);
  if (index === -1) return { success: false, error: 'Product not found.' };
  runtimeProducts[index] = {
    ...runtimeProducts[index],
    title: input.title.trim(),
    slug: input.slug.trim(),
    description: input.description ?? null,
    price: input.price,
    original_price: input.original_price ?? null,
    stock: input.stock,
    images: input.images ?? [],
    category_id: input.category_id ?? null,
    attributes: input.attributes ?? {},
    is_featured: input.is_featured ?? false,
    allow_customization: input.allow_customization ?? false,
    custom_price: input.custom_price ?? null,
  };
  return { success: true, id: productId };
}

export async function adminCreateCategory(
  name: string,
  slug?: string,
): Promise<AdminResult> {
  const cleanName = name?.trim();
  if (!cleanName) return { success: false, error: 'Category name is required.' };

  const cleanSlug =
    slug?.trim() ??
    cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!cleanSlug) return { success: false, error: 'Invalid category slug.' };

  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const { data, error } = await createAdminClient()
      .from('categories')
      .insert({ name: cleanName, slug: cleanSlug })
      .select('id')
      .single();
    if (error) {
      return { success: false, error: `Failed to create category: ${error.message}` };
    }
    return { success: true, id: data.id };
  }

  warnMockFallback('adminCreateCategory');
  runtimeCategories.unshift({
    id: cleanSlug,
    name: cleanName,
    slug: cleanSlug,
    created_at: new Date().toISOString(),
  });
  return { success: true, id: cleanSlug };
}

export async function adminDeleteProduct(
  productId: string,
): Promise<AdminResult> {
  if (!productId?.trim()) {
    return { success: false, error: 'Product id is required.' };
  }

  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const { error } = await createAdminClient()
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) {
      return { success: false, error: `Failed to delete product: ${error.message}` };
    }
    return { success: true, id: productId };
  }

  warnMockFallback('adminDeleteProduct');
  const index = runtimeProducts.findIndex((p) => p.id === productId);
  if (index === -1) return { success: false, error: 'Product not found.' };
  runtimeProducts.splice(index, 1);
  return { success: true, id: productId };
}