<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">
      Next Actions
      <span v-if="filteredActions.length" class="ml-2 text-base font-normal text-gray-500">
        ({{ filteredActions.length }})
      </span>
    </h1>

    <!-- Context filter -->
    <div v-if="contextsStore.contexts.length" class="mt-4">
      <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Filter by context</p>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-full px-3 py-1 text-sm font-medium transition-colors"
          :class="selectedContexts.length === 0
            ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="selectedContexts = []"
        >
          All
        </button>
        <button
          v-for="ctx in contextsStore.contexts"
          :key="ctx.id"
          type="button"
          class="rounded-full px-3 py-1 text-sm font-medium transition-colors"
          :class="selectedContexts.includes(ctx.id)
            ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="toggleContext(ctx.id)"
        >
          {{ ctx.name }}
        </button>
      </div>
    </div>

    <!-- Actions list -->
    <ul v-if="filteredActions.length" class="mt-4 divide-y divide-gray-100">
      <li v-for="item in filteredActions" :key="item.id" class="group py-3">
        <div class="flex items-start gap-3">
          <!-- Done checkbox -->
          <button
            class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-gray-300 text-white hover:border-green-500 hover:bg-green-50 transition-colors"
            title="Mark as done"
            @click="markDone(item.id)"
          >
            <span class="opacity-0 group-hover:opacity-100 text-green-600 text-xs">✓</span>
          </button>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
            <p v-if="item.notes" class="mt-0.5 text-sm text-gray-500 line-clamp-1">{{ item.notes }}</p>
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <!-- Project link -->
              <NuxtLink
                v-if="item.projectId"
                :to="`/projects/${item.projectId}`"
                class="text-xs text-blue-600 hover:underline"
              >
                {{ getProjectName(item.projectId) }}
              </NuxtLink>
              <!-- Context tags -->
              <span
                v-for="ctxId in item.contexts"
                :key="ctxId"
                class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
              >
                {{ getContextName(ctxId) }}
              </span>
            </div>
          </div>

          <!-- Trash -->
          <button
            class="rounded px-2 py-1 text-xs text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
            title="Trash"
            @click="trashItem(item.id)"
          >
            Trash
          </button>
        </div>
      </li>
    </ul>

    <!-- Empty state -->
    <div v-else class="mt-8 text-center">
      <p class="text-gray-400">
        {{ selectedContexts.length ? 'No next actions match the selected context.' : 'No next actions yet.' }}
      </p>
      <p class="mt-1 text-sm text-gray-400">
        Process items from your inbox to create next actions.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()
const contextsStore = useContextsStore()

const selectedContexts = ref<string[]>([])

const filteredActions = computed(() => {
  const actions = itemsStore.nextActions
  if (selectedContexts.value.length === 0) return actions
  return actions.filter((item) =>
    selectedContexts.value.some((ctxId) => item.contexts.includes(ctxId))
  )
})

function toggleContext(id: string) {
  const idx = selectedContexts.value.indexOf(id)
  if (idx !== -1) {
    selectedContexts.value.splice(idx, 1)
  } else {
    selectedContexts.value.push(id)
  }
}

function markDone(id: string) {
  itemsStore.updateItem(id, {
    status: 'done',
    completedAt: new Date().toISOString(),
  })
}

function getProjectName(projectId: string): string {
  const project = projectsStore.getById(projectId)
  return project ? `▸ ${project.title}` : '▸ Unknown project'
}

function trashItem(id: string) {
  itemsStore.trashItem(id)
}

function getContextName(ctxId: string): string {
  const ctx = contextsStore.getById(ctxId)
  return ctx ? ctx.name : ctxId
}
</script>
