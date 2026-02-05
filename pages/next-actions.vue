<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">
      Next Actions
      <span v-if="filteredActions.length" class="ml-2 text-base font-normal text-gray-500">
        ({{ filteredActions.length }})
      </span>
    </h1>

    <!-- Filters -->
    <div class="mt-4 space-y-3">
      <!-- Context filter -->
      <div v-if="contextsStore.contexts.length">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Context</p>
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

      <!-- Tag filter -->
      <div v-if="tagsStore.tags.length">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Tag</p>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-full px-3 py-1 text-sm font-medium transition-colors"
            :class="selectedTags.length === 0
              ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="selectedTags = []"
          >
            All
          </button>
          <button
            v-for="tag in tagsStore.tags"
            :key="tag.id"
            type="button"
            class="rounded-full px-3 py-1 text-sm font-medium transition-colors"
            :class="selectedTags.includes(tag.id)
              ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="toggleTag(tag.id)"
          >
            {{ tag.name }}
          </button>
        </div>
      </div>

      <!-- Duration & Energy filters -->
      <div class="flex flex-wrap gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Duration</p>
          <select
            v-model="filterDuration"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option :value="null">Any</option>
            <option value="5min">5 min</option>
            <option value="15min">15 min</option>
            <option value="30min">30 min</option>
            <option value="1h">1 hour</option>
            <option value="2h+">2+ hours</option>
          </select>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Energy</p>
          <select
            v-model="filterEnergy"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option :value="null">Any</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
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
            <Icon name="check" size="sm" class="opacity-0 group-hover:opacity-100 text-green-600" />
          </button>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
            <p v-if="item.notes" class="mt-0.5 text-sm text-gray-500 line-clamp-1">{{ item.notes }}</p>
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <!-- Project link -->
              <NuxtLink
                v-if="item.projectId"
                :to="`/projects/${item.projectId}`"
                class="flex items-center gap-0.5 text-xs text-blue-600 hover:underline"
              >
                <Icon name="folder" size="sm" />
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
              <!-- Tags -->
              <span
                v-for="tagId in (item.tags ?? [])"
                :key="tagId"
                class="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600"
              >
                {{ getTagName(tagId) }}
              </span>
              <!-- Duration badge -->
              <span
                v-if="item.duration"
                class="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700"
              >
                {{ durationLabel(item.duration) }}
              </span>
              <!-- Energy badge -->
              <span
                v-if="item.energy"
                class="rounded-full px-2 py-0.5 text-xs"
                :class="energyClass(item.energy)"
              >
                {{ item.energy }}
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
import type { Duration, EnergyLevel } from '~/types'

const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()
const contextsStore = useContextsStore()
const tagsStore = useTagsStore()

const selectedContexts = ref<string[]>([])
const selectedTags = ref<string[]>([])
const filterDuration = ref<Duration | null>(null)
const filterEnergy = ref<EnergyLevel | null>(null)

const filteredActions = computed(() => {
  let actions = itemsStore.nextActions

  if (selectedContexts.value.length > 0) {
    actions = actions.filter((item) =>
      selectedContexts.value.some((ctxId) => item.contexts.includes(ctxId))
    )
  }

  if (selectedTags.value.length > 0) {
    actions = actions.filter((item) =>
      selectedTags.value.some((tagId) => (item.tags ?? []).includes(tagId))
    )
  }

  if (filterDuration.value) {
    actions = actions.filter((item) => item.duration === filterDuration.value)
  }

  if (filterEnergy.value) {
    actions = actions.filter((item) => item.energy === filterEnergy.value)
  }

  return actions
})

function toggleContext(id: string) {
  const idx = selectedContexts.value.indexOf(id)
  if (idx !== -1) {
    selectedContexts.value.splice(idx, 1)
  } else {
    selectedContexts.value.push(id)
  }
}

function toggleTag(id: string) {
  const idx = selectedTags.value.indexOf(id)
  if (idx !== -1) {
    selectedTags.value.splice(idx, 1)
  } else {
    selectedTags.value.push(id)
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
  return project ? project.title : 'Unknown project'
}

function trashItem(id: string) {
  itemsStore.trashItem(id)
}

function getContextName(ctxId: string): string {
  const ctx = contextsStore.getById(ctxId)
  return ctx ? ctx.name : ctxId
}

function getTagName(tagId: string): string {
  const tag = tagsStore.getById(tagId)
  return tag ? tag.name : tagId
}

function durationLabel(d: Duration): string {
  const labels: Record<Duration, string> = {
    '5min': '5 min',
    '15min': '15 min',
    '30min': '30 min',
    '1h': '1 hr',
    '2h+': '2+ hr',
  }
  return labels[d]
}

function energyClass(e: EnergyLevel): string {
  const classes: Record<EnergyLevel, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  }
  return classes[e]
}
</script>
