import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * Unique id for this browser tab/session. Stamped on every write so that
 * realtime echoes of our own changes can be ignored by the sync store.
 */
export const SYNC_SOURCE_ID =
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

/**
 * Lazily creates the Supabase client singleton. Returns null when no
 * credentials are configured — the app then runs in local-only mode.
 */
export function initSupabase(url?: string, anonKey?: string): SupabaseClient | null {
  if (client) return client
  if (!url || !anonKey) return null
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return client
}

export function getSupabase(): SupabaseClient | null {
  return client
}

export function isSupabaseConfigured(): boolean {
  return client !== null
}
