'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { signOutAction } from '@/app/actions/auth';

export function AccountButton() {
  const { user, loading, profile, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="hidden size-10 place-items-center rounded-xl text-zinc-400 md:grid">
        <UserIcon className="size-5" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 md:inline-flex"
      >
        <UserIcon className="size-4" />
        Sign in
      </Link>
    );
  }

  async function handleLogout() {
    await signOutAction();
    await signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
      >
        <UserIcon className="size-4" />
        <span className="max-w-24 truncate">
          {profile?.full_name?.split(' ')[0] ?? 'Account'}
        </span>
        <ChevronDown
          className={`size-3.5 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 z-50 mt-1.5 w-52 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl shadow-black/5">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              My Account
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
