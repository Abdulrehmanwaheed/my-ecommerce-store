import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn(
    '[supabase/server] Missing env var NEXT_PUBLIC_SUPABASE_URL. ' +
      'Supabase server client will fail at runtime until it is set in .env.local',
  );
}

if (!supabaseAnonKey) {
  console.warn(
    '[supabase/server] Missing env var NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Supabase server client will fail at runtime until it is set in .env.local',
  );
}

export async function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase server client cannot be created: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.',
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component: cookie mutations are not allowed here.
          // The session gets refreshed by the middleware instead.
        }
      },
    },
  });
}