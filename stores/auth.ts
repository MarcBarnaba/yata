import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '~/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const ready = ref(false) // initial session check finished
  const sending = ref(false) // magic-link request in flight
  const message = ref('')
  const error = ref(false)

  const isConfigured = computed(() => isSupabaseConfigured())
  const isSignedIn = computed(() => user.value !== null)
  const email = computed(() => user.value?.email ?? '')

  /** Restore an existing session and listen for future auth changes. */
  async function init() {
    const sb = getSupabase()
    if (!sb) {
      ready.value = true
      return
    }
    const { data } = await sb.auth.getSession()
    user.value = data.session?.user ?? null
    sb.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
    ready.value = true
  }

  /** Send a passwordless magic link to the given email. */
  async function signIn(address: string) {
    const sb = getSupabase()
    if (!sb) return
    const target = address.trim()
    if (!target) return
    sending.value = true
    message.value = ''
    error.value = false
    const { error: err } = await sb.auth.signInWithOtp({
      email: target,
      options: { emailRedirectTo: window.location.origin },
    })
    sending.value = false
    if (err) {
      error.value = true
      message.value = err.message
    } else {
      message.value = `Check your email — we sent a magic link to ${target}.`
    }
  }

  async function signOut() {
    const sb = getSupabase()
    if (!sb) return
    await sb.auth.signOut()
    user.value = null
    message.value = ''
    error.value = false
  }

  return {
    user,
    ready,
    sending,
    message,
    error,
    isConfigured,
    isSignedIn,
    email,
    init,
    signIn,
    signOut,
  }
})
