import { createHmac, timingSafeEqual } from 'node:crypto';

export const PAYMENT_PROOF_BUCKET = 'payment-proofs';
export const PAYMENT_PROOF_PREFIX = 'Payment screenshot: ';

function signature(path: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('Payment upload is not configured.');
  return createHmac('sha256', secret).update(path).digest('hex');
}

export function signPaymentProof(path: string): string {
  return `${path}:${signature(path)}`;
}

export function verifyPaymentProof(token: string): string | null {
  const [path, sig] = token.split(':');
  if (!/^[0-9a-f-]{36}\.png$/.test(path ?? '') || !/^[0-9a-f]{64}$/.test(sig ?? '')) return null;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(signature(path))) ? path : null;
}
