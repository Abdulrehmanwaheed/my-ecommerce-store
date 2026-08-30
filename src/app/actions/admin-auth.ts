'use server';

import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'crypto';

import { createAdminClient } from '@/lib/supabase/admin';

const SESSION_COOKIE = 'admin_session';

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? '';
}

function hash(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function safeEqual(a: string, b: string): boolean {
  const ha = hash(a);
  const hb = hash(b);
  return ha.length === hb.length && timingSafeEqual(ha, hb);
}

export interface AdminAuthResult {
  success: boolean;
  error?: string;
}

/**
 * Log in as the store admin. Credentials are stored in the Supabase
 * `admin_users` table and verified in the database via the
 * `authenticate_admin` (SECURITY DEFINER) function using bcrypt.
 * On success, an httpOnly session cookie is set; middleware and the
 * admin page read it to gate access.
 */
export async function adminLogin(input: {
  email: string;
  password: string;
}): Promise<AdminAuthResult> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? '';

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }
  if (!sessionSecret()) {
    return {
      success: false,
      error: 'ADMIN_SESSION_SECRET is not configured in your environment.',
    };
  }

  const supabase = createAdminClient();
  const { data: ok, error } = await supabase.rpc('authenticate_admin', {
    p_email: email,
    p_password: password,
  });

  if (error) {
    console.error('[admin-auth] authenticate_admin failed:', error.message);
    return {
      success: false,
      error: 'Could not verify credentials against the database. Is the admin_users migration applied?',
    };
  }

  if (ok !== true) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionSecret(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true };
}

/**
 * Log out the admin (clears the session cookie).
 */
export async function adminLogout(): Promise<AdminAuthResult> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return { success: true };
}

/**
 * Server-side gate for the admin page: returns true only when a valid
 * admin session cookie is present.
 */
export async function isAdminAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return safeEqual(token, sessionSecret());
}