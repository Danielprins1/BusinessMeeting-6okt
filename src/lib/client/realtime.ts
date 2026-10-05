'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Browserclient, uitsluitend gebruikt voor Supabase Realtime (broadcast).
 * Met de anon-key kan de browser géén tabellen lezen (RLS zonder policies).
 */
export function realtimeClient(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 20 } },
  });
  return client;
}
