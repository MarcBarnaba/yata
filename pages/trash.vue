<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">
      Trash
      <span v-if="itemsStore.trashed.length" class="ml-2 text-base font-normal text-gray-500">
        ({{ itemsStore.trashed.length }})
      </span>
    </h1>

    <!-- Trashed items list -->
    <ul v-if="itemsStore.trashed.length" class="mt-4 divide-y divide-gray-100">
      <li v-for="item in itemsStore.trashed" :key="item.id" class="py-3">
        <div class="flex items-start gap-3">
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-500">{{ item.title }}</p>
            <p v-if="item.notes" class="mt-0.5 text-sm text-gray-400 line-clamp-1">{{ item.notes }}</p>
            <p v-if="item.previousStatus" class="mt-1 text-xs text-gray-400">
              Was in: {{ statusLabel(item.previousStatus) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              class="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap"
              title="Restore item"
              @click="restoreItem(item.id)"
            >
              Restore
            </button>
            <button
              class="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap"
              title="Delete permanently"
              @click="confirmDelete(item.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </li>
    </ul>

    <!-- Empty state -->
    <div v-else class="mt-8 text-center">
      <p class="text-gray-400">Trash is empty.</p>
      <p class="mt-1 text-sm text-gray-400">
        Trashed items will appear here. You can restore or permanently delete them.
      </p>
    </div>

    <!-- Delete confirmation dialog -->
    <Teleport to="body">
      <div
        v-if="deletingId"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        @click.self="deletingId = null"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Delete permanently?</h3>
          <p class="text-sm text-gray-500">This item will be permanently deleted. This action cannot be undone.</p>
          <div class="flex gap-2 justify-end">
            <button
              class="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
              @click="deletingId = null"
            >
              Cancel
            </button>
            <button
              class="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              @click="permanentDelete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { ItemStatus } from '~/types'

const itemsStore = useItemsStore()

const deletingId = ref<string | null>(null)

function restoreItem(id: string) {
  itemsStore.restoreItem(id)
}

function confirmDelete(id: string) {
  deletingId.value = id
}

function permanentDelete() {
  if (deletingId.value) {
    itemsStore.removeItem(deletingId.value)
    deletingId.value = null
  }
}

function statusLabel(status: ItemStatus): string {
  const labels: Record<ItemStatus, string> = {
    inbox: 'Inbox',
    next: 'Next Actions',
    waiting: 'Waiting For',
    someday: 'Someday/Maybe',
    reference: 'Reference',
    calendar: 'Calendar',
    done: 'Completed',
    trashed: 'Trash',
  }
  return labels[status] ?? status
}
</script>
