import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn(
    '[supabase/admin] Missing env var NEXT_PUBLIC_SUPABASE_URL. ' +
      'Admin client will fail at runtime until it is set in .env.local',
  );
}

if (!supabaseServiceRoleKey) {
  console.warn(
    '[supabase/admin] Missing env var SUPABASE_SERVICE_ROLE_KEY. ' +
      'Admin client will fail at runtime until it is set in .env.local. ' +
      'Never expose this key to the browser.',
  );
}

export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Supabase admin client cannot be created: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.',
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}