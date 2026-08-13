import { NextResponse } from 'next/server';

import { fetchProducts } from '@/lib/backend-demo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await fetchProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('[api/products] Failed to load products:', error);
    return NextResponse.json([]);
  }
}