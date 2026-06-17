import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { getSupabase, SYNC_SOURCE_ID } from '~/lib/supabase'
import { persistence } from '~/adapters'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

interface Mergeable {
  id: string
  updatedAt?: string
}

/** Merge two id-keyed arrays, preferring the record with the newer updatedAt. */
function mergeById<T extends Mergeable>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>()
  for (const r of remote) map.set(r.id, r)
  for (const l of local) {
    const existing = map.get(l.id)
    if (!existing) {
      map.set(l.id, l)
      continue
    }
    // ISO timestamps compare correctly as strings; missing => '' => remote wins.
    if ((l.updatedAt ?? '') >= (existing.updatedAt ?? '')) map.set(l.id, l)
  }
  return Array.from(map.values())
}

interface Binding {
  get: () => unknown
  set: (remote: never) => void
}

export const useSyncStore = defineStore('sync', () => {
  const status = ref<SyncStatus>('idle')
  const lastSyncedAt = ref<string | null>(null)
  let channel: RealtimeChannel | null = null

  const isActive = computed(() => status.value === 'syncing' || status.value === 'synced')

  // Maps each persistence key to a read/merge-write binding on its store.
  function bindings(): Record<string, Binding> {
    const items = useItemsStore()
    const projects = useProjectsStore()
    const contexts = useContextsStore()
    const tags = useTagsStore()
    const calendars = useCalendarsStore()
    const reviews = useReviewsStore()
    const settings = useSettingsStore()
    return {
      items: { get: () => items.items, set: (r) => items.setItems(mergeById(items.items, r)) },
      projects: { get: () => projects.projects, set: (r) => projects.setProjects(mergeById(projects.projects, r)) },
      contexts: { get: () => contexts.contexts, set: (r) => contexts.setContexts(mergeById(contexts.contexts, r)) },
      tags: { get: () => tags.tags, set: (r) => tags.setTags(mergeById(tags.tags, r)) },
      calendars: { get: () => calendars.calendars, set: (r) => calendars.setCalendars(mergeById(calendars.calendars, r)) },
      reviews: { get: () => reviews.reviews, set: (r) => reviews.setReviews(mergeById(reviews.reviews, r)) },
      // Settings is a single object — remote simply wins on pull.
      settings: { get: () => settings.settings, set: (r) => settings.setSettings(r) },
    }
  }

  /** Apply a remote blob to its store without echoing the change back to remote. */
  function applyRemote(binding: Binding, data: unknown) {
    persistence.suspendRemote = true
    binding.set(data as never)
    persistence.suspendRemote = false
  }

  async function start(userId: string) {
    const sb = getSupabase()
    if (!sb) {
      status.value = 'offline'
      return
    }
    persistence.userId = userId
    status.value = 'syncing'
    try {
      const map = bindings()

      // 1. Pull every remote blob for this user.
      const { data, error } = await sb.from('app_state').select('key, data').eq('user_id', userId)
      if (error) throw error
      const remoteByKey = new Map<string, unknown>((data ?? []).map((row) => [row.key as string, row.data]))

      // 2. Merge remote into local.
      for (const key of Object.keys(map)) {
        const remote = remoteByKey.get(key)
        if (remote !== undefined) applyRemote(map[key], remote)
      }

      // 3. Push the merged result so the cloud converges with this device.
      for (const key of Object.keys(map)) {
        await persistence.pushNow(key, map[key].get())
      }

      // 4. Stay in sync with other devices.
      subscribe(sb, userId, map)

      lastSyncedAt.value = new Date().toISOString()
      status.value = 'synced'
    } catch (e) {
      console.error('[sync] start failed', e)
      status.value = 'error'
    }
  }

  function subscribe(sb: SupabaseClient, userId: string, map: Record<string, Binding>) {
    if (channel) {
      sb.removeChannel(channel)
      channel = null
    }
    channel = sb
      .channel(`app_state:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_state', filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as { key?: string; data?: unknown; source?: string } | null
          if (!row?.key || row.source === SYNC_SOURCE_ID) return // ignore our own writes
          const binding = map[row.key]
          if (!binding) return
          applyRemote(binding, row.data)
          lastSyncedAt.value = new Date().toISOString()
        },
      )
      .subscribe()
  }

  function stop() {
    const sb = getSupabase()
    if (channel && sb) {
      sb.removeChannel(channel)
      channel = null
    }
    persistence.userId = null
    status.value = 'idle'
    lastSyncedAt.value = null
  }

  return { status, lastSyncedAt, isActive, start, stop }
})
