import { watch } from 'vue'
import { initSupabase } from '~/lib/supabase'

/**
 * Boots the Supabase client (if configured), restores the session, and keeps
 * the sync engine in step with the auth state. Client-only — sync runs in the
 * browser against localStorage as the local-first cache.
 */
export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const client = initSupabase(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string,
  )

  const auth = useAuthStore()
  await auth.init()

  if (!client) return

  const sync = useSyncStore()
  watch(
    () => auth.user?.id ?? null,
    (userId) => {
      if (userId) void sync.start(userId)
      else sync.stop()
    },
    { immediate: true },
  )
})
