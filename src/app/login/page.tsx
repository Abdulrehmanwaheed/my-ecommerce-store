import type { Metadata } from 'next';
import { STORE_CONFIG } from '@/store.config';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata: Metadata = {
  title: `Sign In — ${STORE_CONFIG.brand.name}`,
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
