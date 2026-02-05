<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">
      Reference
      <span v-if="itemsStore.reference.length" class="ml-2 text-base font-normal text-gray-500">
        ({{ itemsStore.reference.length }})
      </span>
    </h1>

    <!-- Search filter -->
    <div v-if="itemsStore.reference.length" class="mt-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search reference items..."
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>

    <!-- Reference items list -->
    <ul v-if="filteredItems.length" class="mt-4 divide-y divide-gray-100">
      <li v-for="item in filteredItems" :key="item.id" class="py-3">
        <div class="flex items-start gap-3">
          <div class="flex-1 min-w-0">
            <!-- Inline edit mode -->
            <template v-if="editingId === item.id">
              <div class="space-y-2">
                <input
                  v-model="editTitle"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <textarea
                  v-model="editNotes"
                  rows="3"
                  placeholder="Notes (optional)"
                  class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <div class="flex gap-2">
                  <button
                    :disabled="!editTitle.trim()"
                    class="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="saveEdit(item.id)"
                  >
                    Save
                  </button>
                  <button
                    class="rounded-lg px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
                    @click="editingId = null"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </template>

            <!-- Display mode -->
            <template v-else>
              <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
              <p v-if="item.notes" class="mt-0.5 text-sm text-gray-500 whitespace-pre-line">{{ item.notes }}</p>
              <div v-if="item.contexts.length" class="mt-1 flex flex-wrap gap-1">
                <span
                  v-for="ctxId in item.contexts"
                  :key="ctxId"
                  class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                >
                  {{ getContextName(ctxId) }}
                </span>
              </div>
            </template>
          </div>

          <!-- Actions -->
          <div v-if="editingId !== item.id" class="flex items-center gap-1 flex-shrink-0">
            <button
              class="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
              title="Edit"
              @click="startEdit(item)"
            >
              Edit
            </button>
            <button
              class="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors"
              title="Trash"
              @click="trashItem(item.id)"
            >
              Trash
            </button>
          </div>
        </div>
      </li>
    </ul>

    <!-- No search results -->
    <div v-else-if="itemsStore.reference.length && searchQuery" class="mt-8 text-center">
      <p class="text-gray-400">No reference items match "{{ searchQuery }}".</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!itemsStore.reference.length" class="mt-8 text-center">
      <p class="text-gray-400">No reference items.</p>
      <p class="mt-1 text-sm text-gray-400">
        Non-actionable information will appear here after processing through the inbox.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Item } from '~/types'

const itemsStore = useItemsStore()
const contextsStore = useContextsStore()

// Search
const searchQuery = ref('')

const filteredItems = computed(() => {
  const items = itemsStore.reference
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return items
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.notes.toLowerCase().includes(query),
  )
})

// Inline editing
const editingId = ref<string | null>(null)
const editTitle = ref('')
const editNotes = ref('')

function startEdit(item: Item) {
  editingId.value = item.id
  editTitle.value = item.title
  editNotes.value = item.notes
}

function saveEdit(id: string) {
  const title = editTitle.value.trim()
  if (!title) return
  itemsStore.updateItem(id, {
    title,
    notes: editNotes.value.trim(),
  })
  editingId.value = null
}

function trashItem(id: string) {
  itemsStore.updateItem(id, { status: 'trashed' })
}

function getContextName(ctxId: string): string {
  const ctx = contextsStore.getById(ctxId)
  return ctx ? ctx.name : ctxId
}
</script>
