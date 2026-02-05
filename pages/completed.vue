<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">
      Completed
      <span v-if="completedItems.length" class="ml-2 text-base font-normal text-gray-500">
        ({{ completedItems.length }})
      </span>
    </h1>

    <!-- Completed items list -->
    <ul v-if="completedItems.length" class="mt-4 divide-y divide-gray-100">
      <li v-for="item in completedItems" :key="item.id" class="py-3">
        <div class="flex items-start gap-3">
          <span class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-green-100 text-green-600 text-xs">
            ✓
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-500 line-through">{{ item.title }}</p>
            <p v-if="item.notes" class="mt-0.5 text-sm text-gray-400 line-clamp-1">{{ item.notes }}</p>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span v-if="item.completedAt">
                Completed {{ formatDate(item.completedAt) }}
              </span>
              <NuxtLink
                v-if="item.projectId"
                :to="`/projects/${item.projectId}`"
                class="text-blue-500 hover:underline"
              >
                {{ getProjectName(item.projectId) }}
              </NuxtLink>
            </div>
          </div>

          <!-- Actions -->
          <button
            class="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors"
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
      <p class="text-gray-400">No completed items yet.</p>
      <p class="mt-1 text-sm text-gray-400">
        Items you mark as done will appear here.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()

const completedItems = computed(() => {
  return [...itemsStore.done].sort((a, b) =>
    (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt)
  )
})

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

function trashItem(id: string) {
  itemsStore.trashItem(id)
}
</script>
