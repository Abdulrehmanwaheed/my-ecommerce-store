'use server';

import {
  adminCreateCategory,
  adminCreateProduct,
  adminDeleteProduct,
  adminUpdateProduct,
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

export async function updateProductAction(
  productId: string,
  input: CreateProductInput,
): Promise<AdminActionResult> {
  try {
    return await adminUpdateProduct(productId, input);
  } catch (error) {
    console.error('[admin] updateProduct failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed.',
    };
  }
}

export async function createCategoryAction(
  name: string,
  slug?: string,
): Promise<AdminActionResult> {
  try {
    return await adminCreateCategory(name, slug);
  } catch (error) {
    console.error('[admin] createCategory failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Create failed.',
    };
  }
}

export async function deleteProductAction(
  productId: string,
): Promise<AdminActionResult> {
  try {
    return await adminDeleteProduct(productId);
  } catch (error) {
    console.error('[admin] deleteProduct failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed.',
    };
  }
}