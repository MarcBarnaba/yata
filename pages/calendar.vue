<template>
  <div>
    <div class="flex items-center justify-between flex-wrap gap-2">
      <h1 class="text-2xl font-bold text-gray-900">
        Calendar
        <span v-if="allCalendarItems.length" class="ml-2 text-base font-normal text-gray-500">
          ({{ allCalendarItems.length }})
        </span>
      </h1>

      <!-- View toggle -->
      <div class="flex rounded-lg bg-gray-100 p-1">
        <button
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
          :class="calendarView === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          @click="settingsStore.setCalendarView('week')"
        >
          Week
        </button>
        <button
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
          :class="calendarView === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          @click="settingsStore.setCalendarView('month')"
        >
          Month
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <div v-if="allCalendarItems.length || calendarView === 'month'" class="mt-4 flex items-center gap-3">
      <button
        class="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        @click="shiftPeriod(-1)"
      >
        <Icon name="arrow_back" size="sm" /> Prev
      </button>
      <button
        class="rounded px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
        @click="goToToday"
      >
        Today
      </button>
      <button
        class="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        @click="shiftPeriod(1)"
      >
        Next <Icon name="arrow_forward" size="sm" />
      </button>
      <span class="text-sm text-gray-500">
        {{ calendarView === 'week' ? formatWeekRange(weekStart) : formatMonthYear(monthStart) }}
      </span>
    </div>

    <!-- Overdue items (shown in both views when viewing current period) -->
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
            <Icon name="check" size="sm" class="opacity-0 group-hover:opacity-100 text-green-600" />
          </button>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
            <div class="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
              <span class="text-red-600 font-medium">{{ formatDate(item.dueDate!) }}</span>
              <NuxtLink
                v-if="item.projectId"
                :to="`/projects/${item.projectId}`"
                class="flex items-center gap-0.5 text-blue-600 hover:underline"
              >
                <Icon name="folder" size="sm" />
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

    <!-- Week View -->
    <template v-if="calendarView === 'week'">
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
                <Icon name="check" size="sm" class="opacity-0 group-hover:opacity-100 text-green-600" />
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

      <div v-else-if="allCalendarItems.length && !weekGroups.length && !overdueItems.length" class="mt-8 text-center">
        <p class="text-gray-400">No calendar items this week.</p>
        <p class="mt-1 text-sm text-gray-400">Use the navigation above to browse other weeks.</p>
      </div>
    </template>

    <!-- Month View -->
    <template v-else>
      <div class="mt-4">
        <!-- Day headers -->
        <div class="grid grid-cols-7 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
          <div
            v-for="day in weekDays"
            :key="day"
            class="bg-gray-50 px-2 py-2 text-xs font-semibold text-gray-500 text-center"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar grid -->
        <div class="grid grid-cols-7 gap-px bg-gray-200 rounded-b-lg overflow-hidden">
          <button
            v-for="(day, index) in monthDays"
            :key="index"
            class="bg-white min-h-[80px] md:min-h-[100px] p-1.5 text-left transition-colors hover:bg-gray-50"
            :class="{
              'opacity-40': !day.isCurrentMonth,
              'ring-2 ring-inset ring-blue-500': day.isToday,
              'bg-blue-50': selectedDate === day.dateKey
            }"
            @click="selectDate(day.dateKey)"
          >
            <div class="flex items-start justify-between">
              <span
                class="inline-flex items-center justify-center w-6 h-6 text-sm rounded-full"
                :class="{
                  'bg-blue-600 text-white font-semibold': day.isToday,
                  'text-gray-900': day.isCurrentMonth && !day.isToday,
                  'text-gray-400': !day.isCurrentMonth
                }"
              >
                {{ day.dayNumber }}
              </span>
              <span
                v-if="day.itemCount > 0"
                class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold"
                :class="day.hasOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'"
              >
                {{ day.itemCount }}
              </span>
            </div>
            <!-- Item dots for mobile, item previews for desktop -->
            <div v-if="day.itemCount > 0" class="mt-1 hidden md:block">
              <div
                v-for="item in day.items.slice(0, 2)"
                :key="item.id"
                class="text-xs text-gray-600 truncate mb-0.5"
              >
                {{ item.title }}
              </div>
              <div v-if="day.itemCount > 2" class="text-xs text-gray-400">
                +{{ day.itemCount - 2 }} more
              </div>
            </div>
            <div v-if="day.itemCount > 0" class="mt-1 flex gap-0.5 md:hidden">
              <div
                v-for="n in Math.min(day.itemCount, 3)"
                :key="n"
                class="w-1.5 h-1.5 rounded-full"
                :class="day.hasOverdue && n === 1 ? 'bg-red-500' : 'bg-blue-500'"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- Selected day items -->
      <div v-if="selectedDate && selectedDayItems.length" class="mt-4">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          {{ formatDayLabel(selectedDate) }}
        </h2>
        <ul class="divide-y divide-gray-100 rounded-lg border border-gray-200">
          <li v-for="item in selectedDayItems" :key="item.id" class="group flex items-start gap-3 px-3 py-2.5">
            <button
              class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors"
              title="Mark as done"
              @click="markDone(item.id)"
            >
              <Icon name="check" size="sm" class="opacity-0 group-hover:opacity-100 text-green-600" />
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

      <div v-else-if="selectedDate" class="mt-4 text-center py-4">
        <p class="text-gray-400 text-sm">No items scheduled for this day.</p>
      </div>
    </template>

    <!-- Empty state -->
    <div v-if="!allCalendarItems.length && calendarView === 'week'" class="mt-8 text-center">
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
const settingsStore = useSettingsStore()

const calendarView = computed(() => settingsStore.calendarView)

// All calendar items (status: 'calendar' with a dueDate), sorted chronologically
const allCalendarItems = computed(() => {
  return itemsStore.calendar
    .filter((i) => i.dueDate)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
})

// Week navigation
const weekOffset = ref(0)
// Month navigation
const monthOffset = ref(0)
// Selected date for month view
const selectedDate = ref<string | null>(null)

const today = computed(() => {
  const d = new Date()
  return toDateKey(d)
})

// Week calculations
const weekStart = computed(() => {
  const d = new Date()
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

// Month calculations
const monthStart = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() + monthOffset.value)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
})

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface MonthDay {
  dateKey: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  itemCount: number
  hasOverdue: boolean
  items: Item[]
}

const monthDays = computed((): MonthDay[] => {
  const days: MonthDay[] = []
  const year = monthStart.value.getFullYear()
  const month = monthStart.value.getMonth()

  // First day of month
  const firstDay = new Date(year, month, 1)
  // Last day of month
  const lastDay = new Date(year, month + 1, 0)

  // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
  let startDayOfWeek = firstDay.getDay()
  // Convert to Monday-based (0 = Monday, 6 = Sunday)
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  // Add days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    const dateKey = toDateKey(d)
    const items = getItemsForDate(dateKey)
    days.push({
      dateKey,
      dayNumber: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: dateKey === today.value,
      itemCount: items.length,
      hasOverdue: dateKey < today.value && items.length > 0,
      items,
    })
  }

  // Add days of current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const dateKey = toDateKey(date)
    const items = getItemsForDate(dateKey)
    days.push({
      dateKey,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateKey === today.value,
      itemCount: items.length,
      hasOverdue: dateKey < today.value && items.length > 0,
      items,
    })
  }

  // Add days from next month to complete the grid (6 rows = 42 days)
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    const dateKey = toDateKey(date)
    const items = getItemsForDate(dateKey)
    days.push({
      dateKey,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateKey === today.value,
      itemCount: items.length,
      hasOverdue: dateKey < today.value && items.length > 0,
      items,
    })
  }

  return days
})

function getItemsForDate(dateKey: string): Item[] {
  return allCalendarItems.value.filter((i) => i.dueDate === dateKey)
}

const selectedDayItems = computed(() => {
  if (!selectedDate.value) return []
  return getItemsForDate(selectedDate.value)
})

function selectDate(dateKey: string) {
  selectedDate.value = selectedDate.value === dateKey ? null : dateKey
}

function shiftPeriod(delta: number) {
  if (calendarView.value === 'week') {
    weekOffset.value += delta
  } else {
    monthOffset.value += delta
    selectedDate.value = null
  }
}

function goToToday() {
  if (calendarView.value === 'week') {
    weekOffset.value = 0
  } else {
    monthOffset.value = 0
    selectedDate.value = today.value
  }
}

// Overdue items (before today, only shown when viewing current period)
const overdueItems = computed(() => {
  if (calendarView.value === 'week' && weekOffset.value !== 0) return []
  if (calendarView.value === 'month' && monthOffset.value !== 0) return []
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

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

function getProjectName(projectId: string): string {
  const project = projectsStore.getById(projectId)
  return project ? project.title : 'Unknown project'
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

// Reset view state when switching views
watch(calendarView, () => {
  selectedDate.value = null
})
</script>
