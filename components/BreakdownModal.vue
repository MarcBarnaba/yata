<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="item"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="emit('cancel')"
      >
        <div class="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
          <div class="flex items-start gap-3">
            <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Icon name="rocket_launch" size="md" />
            </span>
            <div class="min-w-0">
              <h3 class="text-lg font-semibold text-gray-900">Break it down</h3>
              <p class="truncate text-sm text-gray-500">
                Turn “{{ item.title }}” into a project with concrete next steps.
              </p>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Desired outcome</label>
            <textarea
              v-model="outcome"
              rows="2"
              placeholder="What does 'done' look like?"
              class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">First steps</label>
            <p class="mb-1 text-xs text-gray-400">One per line. The first becomes your next action.</p>
            <textarea
              v-model="steps"
              rows="4"
              :placeholder="'Call the supplier\nMeasure the field\nOrder the seeds'"
              class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              @click="emit('cancel')"
            >
              Cancel
            </button>
            <button
              class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              @click="confirm"
            >
              <Icon name="rocket_launch" size="sm" />
              Make it a project
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Item } from '~/types'
import { makeItem } from '~/utils/item'

const props = defineProps<{ item: Item | null }>()
const emit = defineEmits<{ done: []; cancel: [] }>()

const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()
const router = useRouter()

const outcome = ref('')
const steps = ref('')

// Reset the form whenever a new item is opened.
watch(
  () => props.item,
  (item) => {
    outcome.value = item?.notes ?? ''
    steps.value = ''
  },
)

const stepLines = computed(() =>
  steps.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean),
)

function confirm() {
  const item = props.item
  if (!item) return

  const now = new Date().toISOString()
  const projectId = crypto.randomUUID()

  projectsStore.addProject({
    id: projectId,
    title: item.title,
    outcome: outcome.value.trim(),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  })

  const lines = stepLines.value.length ? stepLines.value : [item.title]
  const [first, ...rest] = lines

  // Repurpose the original someday item as the project's first next action.
  itemsStore.updateItem(item.id, {
    title: first,
    status: 'next',
    projectId,
    parentId: null,
  })

  for (const title of rest) {
    itemsStore.addItem(makeItem({ title, status: 'next', projectId }))
  }

  emit('done')
  router.push(`/projects/${projectId}`)
}
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
</style>
