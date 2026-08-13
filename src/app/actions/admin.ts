'use server';

import {
  adminCreateProduct,
  updateOrderStatus as demoUpdateOrderStatus,
} from '@/lib/backend-demo';
import type { CreateProductInput, OrderStatus } from '@/types/database';

export interface AdminActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function updateOrderStatusAction(
  orderId: string,
  orderStatus: OrderStatus,
): Promise<AdminActionResult> {
  try {
    return await demoUpdateOrderStatus(orderId, orderStatus);
  } catch (error) {
    console.error('[admin] updateOrderStatus failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed.',
    };
  }
}

export async function createProductAction(
  input: CreateProductInput,
): Promise<AdminActionResult> {
  try {
    return await adminCreateProduct(input);
  } catch (error) {
    console.error('[admin] createProduct failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Create failed.',
    };
  }
}