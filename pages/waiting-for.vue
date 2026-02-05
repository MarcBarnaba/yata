<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">
      Waiting For
      <span v-if="itemsStore.waiting.length" class="ml-2 text-base font-normal text-gray-500">
        ({{ itemsStore.waiting.length }})
      </span>
    </h1>

    <!-- Waiting items list -->
    <ul v-if="itemsStore.waiting.length" class="mt-4 divide-y divide-gray-100">
      <li v-for="item in itemsStore.waiting" :key="item.id" class="py-3">
        <div class="flex items-start gap-3">
          <!-- Done checkbox -->
          <button
            class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-gray-300 text-white hover:border-green-500 hover:bg-green-50 transition-colors group"
            title="Mark as done"
            @click="markDone(item.id)"
          >
            <span class="opacity-0 group-hover:opacity-100 text-green-600 text-xs">✓</span>
          </button>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
            <p v-if="item.notes" class="mt-0.5 text-sm text-gray-500 line-clamp-1">{{ item.notes }}</p>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span v-if="item.delegatedTo" class="text-purple-600">
                → {{ item.delegatedTo }}
              </span>
              <span v-if="item.waitingForDate" class="text-gray-500">
                since {{ formatDate(item.waitingForDate) }}
              </span>
              <NuxtLink
                v-if="item.projectId"
                :to="`/projects/${item.projectId}`"
                class="text-blue-600 hover:underline"
              >
                {{ getProjectName(item.projectId) }}
              </NuxtLink>
              <span
                v-for="ctxId in item.contexts"
                :key="ctxId"
                class="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500"
              >
                {{ getContextName(ctxId) }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <button
            class="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap"
            title="Convert to next action"
            @click="convertToNextAction(item.id)"
          >
            → Next Action
          </button>
        </div>
      </li>
    </ul>

    <!-- Empty state -->
    <div v-else class="mt-8 text-center">
      <p class="text-gray-400">No items waiting on others.</p>
      <p class="mt-1 text-sm text-gray-400">
        Delegated items will appear here after processing through the inbox.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()
const contextsStore = useContextsStore()

function markDone(id: string) {
  itemsStore.updateItem(id, {
    status: 'done',
    completedAt: new Date().toISOString(),
  })
}

function convertToNextAction(id: string) {
  itemsStore.updateItem(id, {
    status: 'next',
    delegatedTo: null,
    waitingForDate: null,
  })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getProjectName(projectId: string): string {
  const project = projectsStore.getById(projectId)
  return project ? `▸ ${project.title}` : '▸ Unknown project'
}

function getContextName(ctxId: string): string {
  const ctx = contextsStore.getById(ctxId)
  return ctx ? ctx.name : ctxId
}
</script>
