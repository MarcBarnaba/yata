import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Context } from '~/types'
import { LocalStorageAdapter } from '~/adapters/localStorage'

const persistence = new LocalStorageAdapter()
const STORAGE_KEY = 'contexts'

const DEFAULT_CONTEXTS: Context[] = [
  { id: 'ctx-phone', name: '@phone' },
  { id: 'ctx-computer', name: '@computer' },
  { id: 'ctx-errands', name: '@errands' },
  { id: 'ctx-office', name: '@office' },
  { id: 'ctx-home', name: '@home' },
]

export const useContextsStore = defineStore('contexts', () => {
  const stored = persistence.load<Context[]>(STORAGE_KEY)
  const contexts = ref<Context[]>(stored ?? DEFAULT_CONTEXTS)

  // Seed defaults on first launch
  if (!stored) {
    persistence.save(STORAGE_KEY, contexts.value)
  }

  function persist() {
    persistence.save(STORAGE_KEY, contexts.value)
  }

  function getById(id: string): Context | undefined {
    return contexts.value.find((c) => c.id === id)
  }

  function addContext(context: Context) {
    contexts.value.push(context)
    persist()
  }

  function updateContext(id: string, updates: Partial<Omit<Context, 'id'>>) {
    const index = contexts.value.findIndex((c) => c.id === id)
    if (index === -1) return
    contexts.value[index] = { ...contexts.value[index], ...updates }
    persist()
  }

  function removeContext(id: string) {
    contexts.value = contexts.value.filter((c) => c.id !== id)
    persist()
  }

  function setContexts(newContexts: Context[]) {
    contexts.value = newContexts
    persist()
  }

  return {
    contexts,
    getById,
    addContext,
    updateContext,
    removeContext,
    setContexts,
  }
})
