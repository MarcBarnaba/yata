<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">
        Inbox
        <span v-if="inboxItems.length" class="ml-2 text-base font-normal text-gray-500">
          ({{ inboxItems.length }})
        </span>
      </h1>
    </div>

    <!-- Inbox items list (FIFO — oldest first) -->
    <ul v-if="inboxItems.length" class="mt-4 divide-y divide-gray-100">
      <li
        v-for="item in inboxItems"
        :key="item.id"
        class="group py-3"
      >
        <!-- Editing mode -->
        <template v-if="editingId === item.id">
          <div class="space-y-2">
            <input
              v-model="editTitle"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              @keyup.enter="saveEdit(item.id)"
              @keyup.escape="cancelEdit"
            />
            <textarea
              v-model="editNotes"
              placeholder="Notes"
              rows="2"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <div class="flex gap-2">
              <button
                class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                @click="saveEdit(item.id)"
              >
                Save
              </button>
              <button
                class="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                @click="cancelEdit"
              >
                Cancel
              </button>
            </div>
          </div>
        </template>

        <!-- Display mode -->
        <template v-else>
          <div class="flex items-start gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ item.title }}</p>
              <p v-if="item.notes" class="mt-0.5 text-sm text-gray-500 line-clamp-2">
                {{ item.notes }}
              </p>
              <p class="mt-1 text-xs text-gray-400">
                {{ formatDate(item.createdAt) }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="rounded px-2 py-1.5 text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                @click="startEdit(item)"
              >
                Edit
              </button>
              <NuxtLink
                :to="`/process/${item.id}`"
                class="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors"
              >
                <Icon name="arrow_forward" size="sm" />
                Process
              </NuxtLink>
            </div>
          </div>
        </template>
      </li>
    </ul>

    <!-- Empty state -->
    <div v-else class="mt-8 text-center">
      <p class="text-gray-400">Inbox is empty.</p>
      <p class="mt-1 text-sm text-gray-400">Use the capture bar above to add items.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Item } from '~/types'

const itemsStore = useItemsStore()

// FIFO order: oldest first (by createdAt ascending)
const inboxItems = computed(() =>
  [...itemsStore.inbox].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
)

// Editing state
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
  itemsStore.updateItem(id, { title, notes: editNotes.value.trim() })
  editingId.value = null
}

function cancelEdit() {
  editingId.value = null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
