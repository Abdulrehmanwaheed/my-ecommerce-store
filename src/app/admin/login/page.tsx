'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Lock, ShieldCheck } from 'lucide-react';

import { adminLogin } from '@/app/actions/admin-auth';
import { STORE_CONFIG } from '@/store.config';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    const result = await adminLogin({ email, password });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Login failed.');
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <ArrowLeft className="size-4" />
          Back to store
        </Link>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/40">
          <div className="flex flex-col items-center text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-emerald-500/10">
              <ShieldCheck className="size-7 text-emerald-400" />
            </div>
            <h1 className="mt-4 text-xl font-bold tracking-tight text-white">
              Admin Login
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Restricted access — {STORE_CONFIG.brand.name} store management.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Email
              </label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="owner@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Password
              </label>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-400">
                <Lock className="size-3.5" />
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Sign in to Admin'
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}