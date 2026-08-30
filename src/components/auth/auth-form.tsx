'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingBag } from 'lucide-react';

import { STORE_CONFIG } from '@/store.config';
import { signInWithEmailPassword, signUpWithEmailPassword } from '@/app/actions/auth';
import { useAuth } from '@/lib/auth-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Mode = 'login' | 'signup';

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { reloadUser } = useAuth();
  const isSignup = mode === 'signup';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isSignup) {
        const result = await signUpWithEmailPassword({
          full_name: fullName,
          email,
          password,
          phone_whatsapp: phone,
          city,
          address,
        });
        if (!result.success) {
          setError(result.error ?? 'Sign up failed.');
          setSubmitting(false);
          return;
        }
        router.push('/login?registered=1');
        return;
      }

      const result = await signInWithEmailPassword({ email, password });
      if (!result.success) {
        setError(result.error ?? 'Login failed.');
        setSubmitting(false);
        return;
      }
      // The server action set the session cookie; refresh client state so the
      // navbar shows the user immediately without a manual page reload.
      await reloadUser();
      await router.refresh();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary/10">
          <ShoppingBag className="size-7 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {isSignup
            ? 'Save your address for faster checkout.'
            : `Sign in to ${STORE_CONFIG.brand.name} to place orders with your saved address.`}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-3xl border border-border/60 bg-card p-6"
      >
        <div className="space-y-4">
          {isSignup && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Full Name
              </label>
              <Input
                placeholder="e.g. Ali Khan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {isSignup && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                At least 6 characters.
              </p>
            )}
          </div>

          {isSignup && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  WhatsApp Number
                </label>
                <Input
                  placeholder="03XX XXXXXXX"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  City
                </label>
                <Select value={city} onValueChange={(v) => setCity(v ?? '')}>
                  <SelectTrigger className="w-full" data-placeholder>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORE_CONFIG.shipping.cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Default Address
                </label>
                <Input
                  placeholder="House, street, area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  This becomes your default delivery address.
                </p>
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="mt-5 h-12 w-full rounded-xl"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {isSignup ? 'Creating account…' : 'Signing in…'}
            </>
          ) : isSignup ? (
            'Create Account'
          ) : (
            'Sign In'
          )}
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </>
          )}
        </p>

        {!isSignup && (
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Prefer not to sign up? You can still{' '}
            <Link href="/checkout" className="font-medium text-primary hover:underline">
              checkout as a guest
            </Link>
            .
          </p>
        )}
      </form>
    </div>
  );
}
