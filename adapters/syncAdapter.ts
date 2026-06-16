import type { PersistenceAdapter } from './persistence'
import { LocalStorageAdapter } from './localStorage'
import { getSupabase, SYNC_SOURCE_ID } from '~/lib/supabase'

const PUSH_DEBOUNCE_MS = 600

/**
 * Local-first persistence: every write goes to localStorage synchronously
 * (instant UI, offline-safe) and, when a user is signed in, is also mirrored
 * to Supabase as a debounced key→jsonb upsert. Remote pulls are applied by the
 * sync store with `suspendRemote` set, so applying remote data never echoes
 * back as a new push.
 */
export class SyncAdapter implements PersistenceAdapter {
  private local = new LocalStorageAdapter()
  private timers = new Map<string, ReturnType<typeof setTimeout>>()

  /** While true, writes hit localStorage only (used when applying remote data). */
  suspendRemote = false
  /** Set by the sync store once authenticated; null disables remote writes. */
  userId: string | null = null

  load<T>(key: string): T | null {
    return this.local.load<T>(key)
  }

  save<T>(key: string, data: T): void {
    this.local.save(key, data)
    if (this.suspendRemote || !this.userId) return
    this.schedulePush(key, data)
  }

  remove(key: string): void {
    this.local.remove(key)
  }

  clear(): void {
    this.local.clear()
  }

  private schedulePush(key: string, data: unknown): void {
    const existing = this.timers.get(key)
    if (existing) clearTimeout(existing)
    this.timers.set(
      key,
      setTimeout(() => {
        this.timers.delete(key)
        void this.pushNow(key, data)
      }, PUSH_DEBOUNCE_MS),
    )
  }

  /** Upsert one key's blob to Supabase immediately. */
  async pushNow(key: string, data: unknown): Promise<void> {
    const sb = getSupabase()
    if (!sb || !this.userId) return
    const { error } = await sb.from('app_state').upsert(
      {
        user_id: this.userId,
        key,
        data,
        source: SYNC_SOURCE_ID,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,key' },
    )
    if (error) console.error('[sync] push failed for', key, error.message)
  }
}
