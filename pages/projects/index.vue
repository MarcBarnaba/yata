<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">
        Projects
        <span v-if="projectsStore.active.length" class="ml-2 text-base font-normal text-gray-500">
          ({{ projectsStore.active.length }})
        </span>
      </h1>
    </div>

    <!-- Active projects -->
    <ul v-if="projectsStore.active.length" class="mt-4 space-y-3">
      <li v-for="project in projectsStore.active" :key="project.id">
        <NuxtLink
          :to="`/projects/${project.id}`"
          class="block rounded-lg border p-4 hover:bg-gray-50 transition-colors"
          :class="hasNextAction(project.id)
            ? 'border-gray-200'
            : 'border-amber-300 bg-amber-50 hover:bg-amber-100'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900">{{ project.title }}</p>
              <p v-if="project.outcome" class="mt-0.5 text-sm text-gray-500 line-clamp-1">
                {{ project.outcome }}
              </p>
              <div class="mt-2">
                <p v-if="getNextAction(project.id)" class="text-xs text-gray-600">
                  <span class="text-gray-400">Next:</span> {{ getNextAction(project.id)!.title }}
                </p>
                <p v-else class="text-xs font-medium text-amber-700">
                  ⚠ No next action defined
                </p>
              </div>
            </div>
            <span class="text-gray-400 text-sm">&rarr;</span>
          </div>
        </NuxtLink>
      </li>
    </ul>

    <!-- Empty state -->
    <div v-else class="mt-8 text-center">
      <p class="text-gray-400">No active projects.</p>
      <p class="mt-1 text-sm text-gray-400">
        Projects are created when you process inbox items as multi-step outcomes.
      </p>
    </div>

    <!-- Completed projects -->
    <div v-if="projectsStore.completed.length" class="mt-8">
      <button
        class="text-sm font-medium text-gray-500 hover:text-gray-700"
        @click="showCompleted = !showCompleted"
      >
        {{ showCompleted ? '▾' : '▸' }} Completed ({{ projectsStore.completed.length }})
      </button>
      <ul v-if="showCompleted" class="mt-2 space-y-2">
        <li v-for="project in projectsStore.completed" :key="project.id">
          <NuxtLink
            :to="`/projects/${project.id}`"
            class="block rounded-lg border border-gray-100 p-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <span class="line-through">{{ project.title }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Item } from '~/types'

const projectsStore = useProjectsStore()
const itemsStore = useItemsStore()

const showCompleted = ref(false)

function getNextAction(projectId: string): Item | undefined {
  return itemsStore.byProject(projectId).find((i) => i.status === 'next')
}

function hasNextAction(projectId: string): boolean {
  return !!getNextAction(projectId)
}
</script>
