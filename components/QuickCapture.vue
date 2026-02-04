<template>
  <form class="flex gap-2" @submit.prevent="capture">
    <div class="flex-1 flex flex-col gap-2">
      <input
        ref="titleInput"
        v-model="title"
        type="text"
        placeholder="Capture something..."
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        @keydown.meta.enter="capture"
        @keydown.ctrl.enter="capture"
      />
      <textarea
        v-if="showNotes"
        v-model="notes"
        placeholder="Notes (optional)"
        rows="2"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
      />
    </div>
    <div class="flex flex-col gap-1">
      <button
        type="submit"
        :disabled="!title.trim()"
        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add
      </button>
      <button
        type="button"
        class="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
        @click="showNotes = !showNotes"
      >
        {{ showNotes ? '- Notes' : '+ Notes' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
const itemsStore = useItemsStore()

const title = ref('')
const notes = ref('')
const showNotes = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)

function capture() {
  const trimmed = title.value.trim()
  if (!trimmed) return

  const now = new Date().toISOString()
  itemsStore.addItem({
    id: crypto.randomUUID(),
    title: trimmed,
    notes: notes.value.trim(),
    createdAt: now,
    updatedAt: now,
    status: 'inbox',
    contexts: [],
    projectId: null,
    dueDate: null,
    delegatedTo: null,
    waitingForDate: null,
    completedAt: null,
  })

  title.value = ''
  notes.value = ''
  showNotes.value = false
  titleInput.value?.focus()
}
</script>
