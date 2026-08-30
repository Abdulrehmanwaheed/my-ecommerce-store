'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, MapPin, Star, UserRound } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { setDefaultAddressAction, signOutAction } from '@/app/actions/auth';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const { user, loading, profile, addresses, refreshAddresses, signOut } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted || loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  async function handleLogout() {
    await signOutAction();
    await signOut();
    router.push('/');
    router.refresh();
  }

  async function handleSetDefault(addrId: string) {
    if (settingDefaultId) return;
    setError(null);
    setSettingDefaultId(addrId);
    const result = await setDefaultAddressAction(addrId);
    setSettingDefaultId(null);
    if (result.success) {
      await refreshAddresses();
    } else {
      setError(result.error ?? 'Could not update default address.');
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile and saved addresses.
          </p>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl" onClick={handleLogout}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>

      <section className="mt-8 rounded-3xl border border-border/60 bg-card p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <UserRound className="size-4 text-primary" />
          Profile
        </h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="mt-0.5 font-medium">{profile?.full_name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-0.5 font-medium">{user.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">WhatsApp</dt>
            <dd className="mt-0.5 font-medium">{profile?.phone_whatsapp ?? '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-3xl border border-border/60 bg-card p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <MapPin className="size-4 text-primary" />
          Saved Addresses
        </h2>
        {addresses.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No saved addresses yet. Add one at checkout.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className="rounded-2xl border border-border/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{addr.full_name}</span>
                  {addr.is_default && (
                    <Badge variant="secondary" className="text-[10px]">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {addr.phone_whatsapp}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {addr.address}
                  {addr.city ? `, ${addr.city}` : ''}
                </p>
                {!addr.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={Boolean(settingDefaultId)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary disabled:opacity-60"
                  >
                    {settingDefaultId === addr.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Star className="size-3" />
                    )}
                    Set as default
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      </section>
    </main>
  );
}
