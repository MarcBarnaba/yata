<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Settings</h1>

    <!-- Contexts Management -->
    <section class="mt-6">
      <h2 class="text-lg font-semibold text-gray-800">Contexts</h2>
      <p class="mt-1 text-sm text-gray-500">Manage your GTD contexts for filtering actions.</p>

      <!-- Add context -->
      <form class="mt-4 flex gap-2" @submit.prevent="addContext">
        <input
          v-model="newContextName"
          type="text"
          placeholder="e.g. @phone"
          class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          :disabled="!newContextName.trim()"
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>

      <!-- Context list -->
      <ul class="mt-4 divide-y divide-gray-100">
        <li
          v-for="ctx in contextsStore.contexts"
          :key="ctx.id"
          class="flex items-center gap-3 py-3"
        >
          <template v-if="editingId === ctx.id">
            <input
              v-model="editName"
              type="text"
              class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              @keyup.enter="saveEdit(ctx.id)"
              @keyup.escape="cancelEdit"
            />
            <button
              class="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
              @click="saveEdit(ctx.id)"
            >
              Save
            </button>
            <button
              class="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
              @click="cancelEdit"
            >
              Cancel
            </button>
          </template>
          <template v-else>
            <span class="flex-1 text-sm text-gray-800">{{ ctx.name }}</span>
            <button
              class="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              @click="startEdit(ctx)"
            >
              Edit
            </button>
            <button
              class="rounded px-2 py-1 text-sm text-red-500 hover:bg-red-50 hover:text-red-700"
              @click="confirmDelete(ctx)"
            >
              Delete
            </button>
          </template>
        </li>
      </ul>

      <p v-if="contextsStore.contexts.length === 0" class="mt-4 text-sm text-gray-400">
        No contexts defined.
      </p>
    </section>

    <!-- Delete confirmation dialog -->
    <Teleport to="body">
      <div
        v-if="deletingContext"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="deletingContext = null"
      >
        <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900">Delete context?</h3>
          <p class="mt-2 text-sm text-gray-600">
            "{{ deletingContext.name }}" will be removed from all items. This cannot be undone.
          </p>
          <div class="mt-4 flex justify-end gap-2">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              @click="deletingContext = null"
            >
              Cancel
            </button>
            <button
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              @click="executeDelete"
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
import type { Context } from '~/types'

const contextsStore = useContextsStore()
const itemsStore = useItemsStore()

const newContextName = ref('')
const editingId = ref<string | null>(null)
const editName = ref('')
const deletingContext = ref<Context | null>(null)

function addContext() {
  const name = newContextName.value.trim()
  if (!name) return

  const id = 'ctx-' + crypto.randomUUID().slice(0, 8)
  contextsStore.addContext({ id, name })
  newContextName.value = ''
}

function startEdit(ctx: Context) {
  editingId.value = ctx.id
  editName.value = ctx.name
}

function saveEdit(id: string) {
  const name = editName.value.trim()
  if (!name) return
  contextsStore.updateContext(id, { name })
  editingId.value = null
}

function cancelEdit() {
  editingId.value = null
}

function confirmDelete(ctx: Context) {
  deletingContext.value = ctx
}

function executeDelete() {
  if (!deletingContext.value) return
  itemsStore.removeContextFromAll(deletingContext.value.id)
  contextsStore.removeContext(deletingContext.value.id)
  deletingContext.value = null
}
</script>
