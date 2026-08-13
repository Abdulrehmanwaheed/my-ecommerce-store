import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn(
    '[supabase/client] Missing env var NEXT_PUBLIC_SUPABASE_URL. ' +
      'Supabase client will fail at runtime until it is set in .env.local',
  );
}

if (!supabaseAnonKey) {
  console.warn(
    '[supabase/client] Missing env var NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Supabase client will fail at runtime until it is set in .env.local',
  );
}

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase browser client cannot be created: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.',
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}