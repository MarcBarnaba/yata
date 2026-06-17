import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '~/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const ready = ref(false) // initial session check finished
  const sending = ref(false) // code request in flight
  const verifying = ref(false) // code verification in flight
  const codeSent = ref(false) // show the code-entry step
  const pendingEmail = ref('')
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

  /**
   * Email a 6-digit code. We verify the code in-app (instead of a magic link)
   * so the session is created inside this PWA's storage — on iOS a magic link
   * opens Safari, a separate storage jar, so the installed app stays signed out.
   */
  async function sendCode(address: string) {
    const sb = getSupabase()
    if (!sb) return
    const target = address.trim()
    if (!target) return
    sending.value = true
    message.value = ''
    error.value = false
    const { error: err } = await sb.auth.signInWithOtp({
      email: target,
      options: { shouldCreateUser: true },
    })
    sending.value = false
    if (err) {
      error.value = true
      message.value = err.message
    } else {
      pendingEmail.value = target
      codeSent.value = true
      message.value = `We emailed a 6-digit code to ${target}.`
    }
  }

  async function verifyCode(token: string) {
    const sb = getSupabase()
    if (!sb || !pendingEmail.value) return
    const code = token.trim()
    if (!code) return
    verifying.value = true
    message.value = ''
    error.value = false
    const { error: err } = await sb.auth.verifyOtp({
      email: pendingEmail.value,
      token: code,
      type: 'email',
    })
    verifying.value = false
    if (err) {
      error.value = true
      message.value = err.message
    } else {
      codeSent.value = false
      pendingEmail.value = ''
      message.value = ''
    }
  }

  function resetSignIn() {
    codeSent.value = false
    pendingEmail.value = ''
    message.value = ''
    error.value = false
  }

  async function signOut() {
    const sb = getSupabase()
    if (!sb) return
    await sb.auth.signOut()
    user.value = null
    resetSignIn()
  }

  return {
    user,
    ready,
    sending,
    verifying,
    codeSent,
    pendingEmail,
    message,
    error,
    isConfigured,
    isSignedIn,
    email,
    init,
    sendCode,
    verifyCode,
    resetSignIn,
    signOut,
  }
})
