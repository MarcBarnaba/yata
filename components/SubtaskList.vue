<template>
  <div class="mt-1.5 ml-1 border-l-2 border-gray-100 pl-3">
    <p v-if="subs.length" class="mb-1 text-xs font-medium text-gray-400">
      Steps {{ doneCount }}/{{ subs.length }}
    </p>
    <ul v-if="subs.length" class="space-y-1">
      <li v-for="s in subs" :key="s.id" class="group flex items-center gap-2">
        <button
          class="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors"
          :class="s.status === 'done'
            ? 'border-green-500 bg-green-500 text-white'
            : 'border-gray-300 hover:border-green-500'"
          :title="s.status === 'done' ? 'Mark not done' : 'Mark done'"
          @click="toggle(s)"
        >
          <Icon v-if="s.status === 'done'" name="check" :size="12" />
        </button>
        <span
          class="flex-1 min-w-0 truncate text-sm"
          :class="s.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'"
        >{{ s.title }}</span>
        <button
          class="rounded px-1 text-red-400 opacity-0 transition-all hover:text-red-600 group-hover:opacity-100"
          title="Remove step"
          @click="remove(s.id)"
        >
          <Icon name="close" :size="14" />
        </button>
      </li>
    </ul>

    <form class="mt-1 flex items-center gap-2" @submit.prevent="add">
      <Icon name="add" size="sm" class="flex-shrink-0 text-gray-300" />
      <input
        v-model="draft"
        type="text"
        placeholder="Add a step…"
        class="min-w-0 flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Item } from '~/types'

const props = defineProps<{ parentId: string }>()

const itemsStore = useItemsStore()

const subs = computed<Item[]>(() => itemsStore.subtasks(props.parentId))
const doneCount = computed(() => subs.value.filter((s) => s.status === 'done').length)

const draft = ref('')

function add() {
  const title = draft.value.trim()
  if (!title) return
  itemsStore.addSubtask(props.parentId, title)
  draft.value = ''
}

function toggle(s: Item) {
  if (s.status === 'done') {
    itemsStore.updateItem(s.id, { status: 'next', completedAt: null })
  } else {
    itemsStore.updateItem(s.id, { status: 'done', completedAt: new Date().toISOString() })
  }
}

function remove(id: string) {
  itemsStore.trashItem(id)
}
</script>
