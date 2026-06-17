import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Item, ItemStatus } from '~/types'
import { persistence } from '~/adapters'
import { makeItem } from '~/utils/item'
import { advanceISODate } from '~/utils/recurrence'

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

  // Child steps of an item (subtasks), oldest first.
  const subtasks = computed(() => {
    return (parentId: string) =>
      items.value
        .filter((i) => i.parentId === parentId && i.status !== 'trashed')
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  })

  function getById(id: string): Item | undefined {
    return items.value.find((i) => i.id === id)
  }

  // Actions
  function addItem(item: Item) {
    items.value.push(item)
    persist()
  }

  // Create a next-action subtask under a parent item, inheriting its project.
  function addSubtask(parentId: string, title: string) {
    const parent = items.value.find((i) => i.id === parentId)
    addItem(
      makeItem({
        title,
        status: 'next',
        projectId: parent?.projectId ?? null,
        parentId,
      }),
    )
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

  // Mark an item done. If it's a recurring routine with a due date, spawn the
  // next occurrence (advanced by its interval) so the routine keeps coming back.
  function completeItem(id: string) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    const wasStatus = item.status
    const rec = item.recurrence
    const due = item.dueDate
    updateItem(id, {
      status: 'done',
      completedAt: new Date().toISOString(),
      recurrence: null, // the completed instance no longer recurs
    })
    if (rec && due) {
      addItem(
        makeItem({
          title: item.title,
          notes: item.notes,
          status: wasStatus === 'done' || wasStatus === 'trashed' ? 'next' : wasStatus,
          contexts: [...item.contexts],
          tags: [...(item.tags ?? [])],
          projectId: item.projectId,
          calendarId: item.calendarId,
          dueDate: advanceISODate(due, rec),
          duration: item.duration,
          energy: item.energy,
          recurrence: rec,
        }),
      )
    }
  }

  function removeItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
    persist()
  }

  function removeContextFromAll(contextId: string) {
    let changed = false
    items.value.forEach((item) => {
      const idx = item.contexts.indexOf(contextId)
      if (idx !== -1) {
        item.contexts.splice(idx, 1)
        changed = true
      }
    })
    if (changed) persist()
  }

  function removeTagFromAll(tagId: string) {
    let changed = false
    items.value.forEach((item) => {
      if (!item.tags) return
      const idx = item.tags.indexOf(tagId)
      if (idx !== -1) {
        item.tags.splice(idx, 1)
        changed = true
      }
    })
    if (changed) persist()
  }

  function trashItem(id: string) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    updateItem(id, {
      previousStatus: item.status,
      status: 'trashed',
    })
  }

  function restoreItem(id: string) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    const restoreTo = item.previousStatus ?? 'inbox'
    updateItem(id, {
      status: restoreTo,
      previousStatus: null,
    })
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
    subtasks,
    getById,
    addItem,
    addSubtask,
    completeItem,
    updateItem,
    removeItem,
    trashItem,
    restoreItem,
    removeContextFromAll,
    removeTagFromAll,
    setItems,
  }
})
