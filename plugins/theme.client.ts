import { watch } from 'vue'
import type { ThemePref } from '~/types'

// Applies the user's theme preference to <html> (adds/removes the `dark` class).
// 'system' follows the OS setting and reacts to changes live.
export default defineNuxtPlugin(() => {
  const settingsStore = useSettingsStore()
  const media = window.matchMedia('(prefers-color-scheme: dark)')

  function resolve(pref: ThemePref): boolean {
    if (pref === 'dark') return true
    if (pref === 'light') return false
    return media.matches
  }

  function apply() {
    const dark = resolve(settingsStore.theme)
    document.documentElement.classList.toggle('dark', dark)
    // Keep the iOS status bar / address bar tint in sync.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', dark ? '#0b0f17' : '#2563eb')
  }

  apply()
  watch(() => settingsStore.theme, apply)
  media.addEventListener('change', () => {
    if (settingsStore.theme === 'system') apply()
  })
})
