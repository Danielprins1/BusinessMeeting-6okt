import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/** Schoont geplakte waarden op (spaties, regeleinden, aanhalingstekens). */
function clean(value: string | undefined): string | undefined {
  const v = value?.trim().replace(/^["']|["']$/g, '').trim();
  return v ? v : undefined;
}

/** Project-URL zonder afsluitende slash of "/rest/v1" (wordt vaak per ongeluk meegeplakt). */
export function supabaseUrl(): string | undefined {
  return clean(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)
    ?.replace(/\/+$/, '')
    .replace(/\/rest\/v1$/, '');
}

export function serviceKey(): string | undefined {
  return clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Supabase-client met de service-role-key. Alleen op de server gebruiken! */
export function db(): SupabaseClient {
  if (client) return client;
  const url = supabaseUrl();
  const key = serviceKey();
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten zijn ingesteld.');
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
