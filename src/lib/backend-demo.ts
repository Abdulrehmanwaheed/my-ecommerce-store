import { STORE_CONFIG } from '../store.config';
import type {
  CreateOrderInput,
  CreateProductInput,
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  Product,
} from '../types/database';

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
    if (error) throw new Error(`fetchProducts failed: ${error.message}`);
    return data as Product[];
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
    if (error) throw new Error(`fetchProductBySlug failed: ${error.message}`);
    return (data as Product | null) ?? null;
  }
  warnMockFallback('fetchProductBySlug');
  return runtimeProducts.find((p) => p.slug === slug) ?? null;
}

export async function fetchOrderById(
  id: string,
): Promise<{ order: Order; items: OrderItem[] } | null> {
  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const supabase = createAdminClient();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (orderError) throw new Error(`fetchOrderById failed: ${orderError.message}`);
    if (!order) return null;

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);
    if (itemsError) throw new Error(`fetchOrderById items failed: ${itemsError.message}`);

    return { order: order as Order, items: (items ?? []) as OrderItem[] };
  }
  warnMockFallback('fetchOrderById');
  const order = mockOrders.find((o) => o.id === id);
  if (!order) return null;
  return { order, items: mockOrderItems.filter((i) => i.order_id === id) };
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
    subtotal += product.price * item.quantity;
    items.push({
      id: crypto.randomUUID(),
      order_id: '',
      product_id: product.id,
      quantity: item.quantity,
      unit_price: product.price,
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

export interface AdminResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function fetchAllOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import('./supabase/admin');
    const { data, error } = await createAdminClient()
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`fetchAllOrders failed: ${error.message}`);
    return (data ?? []) as Order[];
  }
  warnMockFallback('fetchAllOrders');
  return [...mockOrders].sort((a, b) => b.created_at.localeCompare(a.created_at));
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
    const { data, error } = await createAdminClient()
      .from('products')
      .insert({
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
    created_at: new Date().toISOString(),
  };
  runtimeProducts.unshift(product);
  return { success: true, id: product.id };
}