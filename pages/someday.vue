<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">
      Someday / Maybe
      <span v-if="itemsStore.someday.length" class="ml-2 text-base font-normal text-gray-500">
        ({{ itemsStore.someday.length }})
      </span>
    </h1>

    <!-- Someday items list -->
    <ul v-if="itemsStore.someday.length" class="mt-4 divide-y divide-gray-100">
      <li v-for="item in itemsStore.someday" :key="item.id" class="py-3">
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
                  rows="2"
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
              <p v-if="item.notes" class="mt-0.5 text-sm text-gray-500 line-clamp-2">{{ item.notes }}</p>
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
              class="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap"
              title="Promote to next action"
              @click="promoteToNextAction(item.id)"
            >
              → Action
            </button>
            <button
              class="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 transition-colors whitespace-nowrap"
              title="Break it down into a project with steps"
              @click="breakingDown = item"
            >
              Break down
            </button>
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

    <!-- Empty state -->
    <div v-else class="mt-8 text-center">
      <p class="text-gray-400">No someday/maybe items.</p>
      <p class="mt-1 text-sm text-gray-400">
        Ideas and possibilities will appear here after processing through the inbox.
      </p>
    </div>

    <BreakdownModal :item="breakingDown" @done="breakingDown = null" @cancel="breakingDown = null" />
  </div>
</template>

<script setup lang="ts">
import type { Item } from '~/types'

const itemsStore = useItemsStore()
const contextsStore = useContextsStore()

// Inline editing
const editingId = ref<string | null>(null)
const editTitle = ref('')
const editNotes = ref('')

// Break-it-down modal
const breakingDown = ref<Item | null>(null)

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

function promoteToNextAction(id: string) {
  itemsStore.updateItem(id, { status: 'next' })
}

function trashItem(id: string) {
  itemsStore.trashItem(id)
}

function getContextName(ctxId: string): string {
  const ctx = contextsStore.getById(ctxId)
  return ctx ? ctx.name : ctxId
}
</script>
