import type { Metadata } from 'next';
import { STORE_CONFIG } from '@/store.config';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata: Metadata = {
  title: `Create Account — ${STORE_CONFIG.brand.name}`,
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
