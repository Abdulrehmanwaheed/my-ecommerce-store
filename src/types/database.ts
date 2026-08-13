export type PaymentMethod = 'COD' | 'ONLINE_CARD' | 'MOBILE_WALLET';

export type PaymentStatus = 'Unpaid' | 'Paid' | 'Failed' | 'Refunded';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  images: string[];
  category_id: string | null;
  attributes: Record<string, any>;
  is_featured: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone_whatsapp: string | null;
  city: string | null;
  address: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: number;
  customer_id: string | null;
  customer_name: string;
  phone_whatsapp: string;
  city: string | null;
  address: string | null;
  total_amount: number;
  shipping_fee: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  payment_gateway_ref: string | null;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
}

export interface PaymentLog {
  id: string;
  order_id: string | null;
  gateway: string;
  payload: Record<string, any>;
  status: string;
  created_at: string;
}

export interface CartItemInput {
  product_id: string;
  quantity: number;
}

export interface CreateOrderInput {
  customer_name: string;
  phone_whatsapp: string;
  city?: string | null;
  address?: string | null;
  payment_method: PaymentMethod;
  items: CartItemInput[];
  notes?: string | null;
}

export interface CreateProductInput {
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  original_price?: number | null;
  stock: number;
  images?: string[];
  category_id?: string | null;
  attributes?: Record<string, any>;
  is_featured?: boolean;
}
