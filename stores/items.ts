import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Item, ItemStatus } from '~/types'
import { LocalStorageAdapter } from '~/adapters/localStorage'

const persistence = new LocalStorageAdapter()
const STORAGE_KEY = 'items'

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>(persistence.load<Item[]>(STORAGE_KEY) ?? [])

  function persist() {
    persistence.save(STORAGE_KEY, items.value)
  }

  // Getters
  const byStatus = computed(() => {
    return (status: ItemStatus) => items.value.filter((i) => i.status === status)
  })

  const inbox = computed(() => byStatus.value('inbox'))
  const nextActions = computed(() => byStatus.value('next'))
  const waiting = computed(() => byStatus.value('waiting'))
  const someday = computed(() => byStatus.value('someday'))
  const reference = computed(() => byStatus.value('reference'))
  const calendar = computed(() => byStatus.value('calendar'))
  const done = computed(() => byStatus.value('done'))
  const trashed = computed(() => byStatus.value('trashed'))

  const byProject = computed(() => {
    return (projectId: string) => items.value.filter((i) => i.projectId === projectId && i.status !== 'trashed')
  })

  function getById(id: string): Item | undefined {
    return items.value.find((i) => i.id === id)
  }

  // Actions
  function addItem(item: Item) {
    items.value.push(item)
    persist()
  }

  function updateItem(id: string, updates: Partial<Omit<Item, 'id'>>) {
    const index = items.value.findIndex((i) => i.id === id)
    if (index === -1) return
    items.value[index] = {
      ...items.value[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    persist()
  }

  function removeItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
    persist()
  }

  function setItems(newItems: Item[]) {
    items.value = newItems
    persist()
  }

  return {
    items,
    inbox,
    nextActions,
    waiting,
    someday,
    reference,
    calendar,
    done,
    trashed,
    byStatus,
    byProject,
    getById,
    addItem,
    updateItem,
    removeItem,
    setItems,
  }
})
