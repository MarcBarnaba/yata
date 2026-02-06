<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/40 z-50"
        @click="close"
      />
    </Transition>
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-x-4 bottom-20 z-50 bg-white rounded-2xl shadow-2xl p-4 max-w-lg mx-auto"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Capture</h2>
          <button
            type="button"
            class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            @click="close"
          >
            <Icon name="close" size="md" />
          </button>
        </div>

        <form @submit.prevent="capture">
          <input
            ref="titleInput"
            v-model="title"
            type="text"
            placeholder="What's on your mind?"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autofocus
          />

          <button
            v-if="!showNotes"
            type="button"
            class="mt-2 text-sm text-gray-500 hover:text-gray-700"
            @click="showNotes = true"
          >
            + Add notes
          </button>

          <textarea
            v-if="showNotes"
            v-model="notes"
            placeholder="Notes (optional)"
            rows="3"
            class="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />

          <button
            type="submit"
            :disabled="!title.trim()"
            class="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add to Inbox
          </button>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const itemsStore = useItemsStore()

const title = ref('')
const notes = ref('')
const showNotes = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)

function close() {
  emit('update:open', false)
}

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
    tags: [],
    projectId: null,
    dueDate: null,
    delegatedTo: null,
    waitingForDate: null,
    completedAt: null,
    previousStatus: null,
    duration: null,
    energy: null,
  })

  // Reset form
  title.value = ''
  notes.value = ''
  showNotes.value = false
  close()
}

// Focus input when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      titleInput.value?.focus()
    })
  }
})
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 200ms ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 200ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
