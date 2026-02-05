import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tag } from '~/types'
import { LocalStorageAdapter } from '~/adapters/localStorage'

const persistence = new LocalStorageAdapter()
const STORAGE_KEY = 'tags'

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>(persistence.load<Tag[]>(STORAGE_KEY) ?? [])

  function persist() {
    persistence.save(STORAGE_KEY, tags.value)
  }

  function getById(id: string): Tag | undefined {
    return tags.value.find((t) => t.id === id)
  }

  function addTag(tag: Tag) {
    tags.value.push(tag)
    persist()
  }

  function updateTag(id: string, updates: Partial<Omit<Tag, 'id'>>) {
    const index = tags.value.findIndex((t) => t.id === id)
    if (index === -1) return
    tags.value[index] = { ...tags.value[index], ...updates }
    persist()
  }

  function removeTag(id: string) {
    tags.value = tags.value.filter((t) => t.id !== id)
    persist()
  }

  function setTags(newTags: Tag[]) {
    tags.value = newTags
    persist()
  }

  return {
    tags,
    getById,
    addTag,
    updateTag,
    removeTag,
    setTags,
  }
})
