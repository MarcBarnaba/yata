import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Settings } from '~/types'
import { LocalStorageAdapter } from '~/adapters/localStorage'

const persistence = new LocalStorageAdapter()
const STORAGE_KEY = 'settings'

const DEFAULT_SETTINGS: Settings = {
  version: '1.0.0',
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(persistence.load<Settings>(STORAGE_KEY) ?? DEFAULT_SETTINGS)

  if (!persistence.load<Settings>(STORAGE_KEY)) {
    persistence.save(STORAGE_KEY, settings.value)
  }

  function persist() {
    persistence.save(STORAGE_KEY, settings.value)
  }

  function updateSettings(updates: Partial<Settings>) {
    settings.value = { ...settings.value, ...updates }
    persist()
  }

  function setSettings(newSettings: Settings) {
    settings.value = newSettings
    persist()
  }

  return {
    settings,
    updateSettings,
    setSettings,
  }
})
