<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">
      Calendar
      <span v-if="allCalendarItems.length" class="ml-2 text-base font-normal text-gray-500">
        ({{ allCalendarItems.length }})
      </span>
    </h1>

    <!-- Week navigation -->
    <div v-if="allCalendarItems.length" class="mt-4 flex items-center gap-3">
      <button
        class="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        @click="shiftWeek(-1)"
      >
        &larr; Prev
      </button>
      <button
        class="rounded px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
        @click="goToToday"
      >
        Today
      </button>
      <button
        class="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        @click="shiftWeek(1)"
      >
        Next &rarr;
      </button>
      <span class="text-sm text-gray-500">
        {{ formatWeekRange(weekStart) }}
      </span>
    </div>

    <!-- Overdue items -->
    <div v-if="overdueItems.length" class="mt-4">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
        Overdue ({{ overdueItems.length }})
      </h2>
      <ul class="divide-y divide-red-100 rounded-lg border border-red-200 bg-red-50">
        <li v-for="item in overdueItems" :key="item.id" class="group flex items-start gap-3 px-3 py-2.5">
          <button
            class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-red-300 hover:border-green-500 hover:bg-green-50 transition-colors"
            title="Mark as done"
            @click="markDone(item.id)"
          >
            <span class="opacity-0 group-hover:opacity-100 text-green-600 text-xs">✓</span>
          </button>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
            <div class="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
              <span class="text-red-600 font-medium">{{ formatDate(item.dueDate!) }}</span>
              <NuxtLink
                v-if="item.projectId"
                :to="`/projects/${item.projectId}`"
                class="text-blue-600 hover:underline"
              >
                {{ getProjectName(item.projectId) }}
              </NuxtLink>
            </div>
          </div>
          <button
            class="rounded px-2 py-1 text-xs text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
            title="Trash"
            @click="trashItem(item.id)"
          >
            Trash
          </button>
        </li>
      </ul>
    </div>

    <!-- Grouped by date -->
    <div v-if="weekGroups.length" class="mt-4 space-y-4">
      <div v-for="group in weekGroups" :key="group.dateKey">
        <h2
          class="text-xs font-semibold uppercase tracking-wider mb-2"
          :class="group.isToday ? 'text-blue-600' : 'text-gray-400'"
        >
          {{ group.label }}
          <span v-if="group.isToday" class="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 normal-case tracking-normal">
            Today
          </span>
        </h2>
        <ul
          class="divide-y divide-gray-100 rounded-lg border"
          :class="group.isToday ? 'border-blue-200 bg-blue-50' : 'border-gray-200'"
        >
          <li v-for="item in group.items" :key="item.id" class="group flex items-start gap-3 px-3 py-2.5">
            <button
              class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors"
              :class="group.isToday ? 'border-blue-300 hover:border-green-500 hover:bg-green-50' : 'border-gray-300 hover:border-green-500 hover:bg-green-50'"
              title="Mark as done"
              @click="markDone(item.id)"
            >
              <span class="opacity-0 group-hover:opacity-100 text-green-600 text-xs">✓</span>
            </button>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
              <p v-if="item.notes" class="mt-0.5 text-sm text-gray-500 line-clamp-1">{{ item.notes }}</p>
              <div class="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
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
            <button
              class="rounded px-2 py-1 text-xs text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
              title="Trash"
              @click="trashItem(item.id)"
            >
              Trash
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- No items in this week -->
    <div v-else-if="allCalendarItems.length && !weekGroups.length && !overdueItems.length" class="mt-8 text-center">
      <p class="text-gray-400">No calendar items this week.</p>
      <p class="mt-1 text-sm text-gray-400">Use the navigation above to browse other weeks.</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!allCalendarItems.length" class="mt-8 text-center">
      <p class="text-gray-400">No calendar items.</p>
      <p class="mt-1 text-sm text-gray-400">
        Date-bound commitments will appear here after processing through the inbox.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Item } from '~/types'

const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()
const contextsStore = useContextsStore()

// All calendar items (status: 'calendar' with a dueDate), sorted chronologically
const allCalendarItems = computed(() => {
  return itemsStore.calendar
    .filter((i) => i.dueDate)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
})

// Week navigation
const weekOffset = ref(0)

const today = computed(() => {
  const d = new Date()
  return toDateKey(d)
})

const weekStart = computed(() => {
  const d = new Date()
  // Start of current week (Monday)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff + weekOffset.value * 7)
  d.setHours(0, 0, 0, 0)
  return d
})

const weekEnd = computed(() => {
  const d = new Date(weekStart.value)
  d.setDate(d.getDate() + 6)
  return d
})

function shiftWeek(delta: number) {
  weekOffset.value += delta
}

function goToToday() {
  weekOffset.value = 0
}

// Overdue items (before today, only shown when viewing current week)
const overdueItems = computed(() => {
  if (weekOffset.value !== 0) return []
  return allCalendarItems.value.filter((i) => i.dueDate! < today.value)
})

// Items grouped by date within the current week
const weekGroups = computed(() => {
  const startKey = toDateKey(weekStart.value)
  const endKey = toDateKey(weekEnd.value)

  const itemsInWeek = allCalendarItems.value.filter(
    (i) => i.dueDate! >= startKey && i.dueDate! <= endKey,
  )

  const groups: Map<string, Item[]> = new Map()
  for (const item of itemsInWeek) {
    const key = item.dueDate!
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  }

  return Array.from(groups.entries()).map(([dateKey, items]) => ({
    dateKey,
    label: formatDayLabel(dateKey),
    isToday: dateKey === today.value,
    items,
  }))
})

// Helpers
function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatDayLabel(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function formatWeekRange(start: Date): string {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`
}

function getProjectName(projectId: string): string {
  const project = projectsStore.getById(projectId)
  return project ? `▸ ${project.title}` : '▸ Unknown project'
}

function getContextName(ctxId: string): string {
  const ctx = contextsStore.getById(ctxId)
  return ctx ? ctx.name : ctxId
}

function markDone(id: string) {
  itemsStore.updateItem(id, {
    status: 'done',
    completedAt: new Date().toISOString(),
  })
}

function trashItem(id: string) {
  itemsStore.trashItem(id)
}
</script>
