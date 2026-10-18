import { createClient } from '@supabase/supabase-js';

let cachedClient = null;

/**
 * Returns a server-side Supabase client initialized with the SERVICE_ROLE_KEY.
 * Bypasses RLS for authorized administrative operations only.
 * NEVER expose this client or its credentials to the browser.
 */
export function getSupabaseAdmin() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Server configuration error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.'
    );
  }

  cachedClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return cachedClient;
}
