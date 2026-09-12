import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthorized } from '@/app/actions/admin-auth';
import { PAYMENT_PROOF_BUCKET, PAYMENT_PROOF_PREFIX, signPaymentProof } from '@/lib/payment-proof';

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.type !== 'image/png' || file.size === 0 || file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Upload a PNG screenshot up to 5 MB.' }, { status: 400 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
      return NextResponse.json({ error: 'The file must be a valid PNG image.' }, { status: 400 });
    }
    const db = createAdminClient();
    const { data: bucket } = await db.storage.getBucket(PAYMENT_PROOF_BUCKET);
    if (!bucket) {
      const { error } = await db.storage.createBucket(PAYMENT_PROOF_BUCKET, {
        public: false, fileSizeLimit: 5 * 1024 * 1024, allowedMimeTypes: ['image/png'],
      });
      if (error && !/already|duplicate/i.test(error.message)) throw error;
    }
    const path = `${randomUUID()}.png`;
    const { error } = await db.storage.from(PAYMENT_PROOF_BUCKET).upload(path, bytes, { contentType: 'image/png' });
    if (error) throw error;
    return NextResponse.json({ token: signPaymentProof(path) });
  } catch (error) {
    console.error('[payment-proof]', error);
    return NextResponse.json({ error: 'Screenshot upload failed. Please try again.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized())) return new NextResponse('Unauthorized', { status: 401 });
  const orderId = request.nextUrl.searchParams.get('orderId');
  if (!orderId) return new NextResponse('Order required', { status: 400 });
  const db = createAdminClient();
  const { data: order } = await db.from('orders').select('notes').eq('id', orderId).single();
  const line = order?.notes?.split('\n').find((value: string) => value.startsWith(PAYMENT_PROOF_PREFIX));
  const path = line?.slice(PAYMENT_PROOF_PREFIX.length);
  if (!path || !/^[0-9a-f-]{36}\.png$/.test(path)) return new NextResponse('Screenshot not found', { status: 404 });
  const { data, error } = await db.storage.from(PAYMENT_PROOF_BUCKET).download(path);
  if (error || !data) return new NextResponse('Screenshot unavailable', { status: 404 });
  return new NextResponse(data, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'private, no-store' } });
}
