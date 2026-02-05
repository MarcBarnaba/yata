<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
    <p class="mt-2 text-gray-500">Your GTD system at a glance.</p>

    <!-- Stats cards -->
    <div class="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
      <!-- Inbox -->
      <NuxtLink
        to="/inbox"
        class="rounded-lg border p-4 hover:bg-gray-50 transition-colors"
        :class="inboxCount > 0 ? 'border-amber-300 bg-amber-50' : 'border-gray-200'"
      >
        <p class="text-2xl font-bold" :class="inboxCount > 0 ? 'text-amber-700' : 'text-gray-900'">
          {{ inboxCount }}
        </p>
        <p class="text-sm text-gray-500">Inbox</p>
      </NuxtLink>

      <!-- Next Actions -->
      <NuxtLink
        to="/next-actions"
        class="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
      >
        <p class="text-2xl font-bold text-gray-900">{{ nextActionsCount }}</p>
        <p class="text-sm text-gray-500">Next Actions</p>
      </NuxtLink>

      <!-- Waiting For -->
      <NuxtLink
        to="/waiting-for"
        class="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
      >
        <p class="text-2xl font-bold text-gray-900">{{ waitingCount }}</p>
        <p class="text-sm text-gray-500">Waiting For</p>
      </NuxtLink>

      <!-- Projects -->
      <NuxtLink
        to="/projects"
        class="rounded-lg border p-4 hover:bg-gray-50 transition-colors"
        :class="staleProjectCount > 0 ? 'border-amber-300 bg-amber-50' : 'border-gray-200'"
      >
        <p class="text-2xl font-bold" :class="staleProjectCount > 0 ? 'text-amber-700' : 'text-gray-900'">
          {{ projectsStore.active.length }}
        </p>
        <p class="text-sm text-gray-500">Active Projects</p>
        <p v-if="staleProjectCount > 0" class="mt-1 text-xs font-medium text-amber-700">
          {{ staleProjectCount }} without next action
        </p>
      </NuxtLink>

      <!-- Calendar -->
      <NuxtLink
        to="/calendar"
        class="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
      >
        <p class="text-2xl font-bold text-gray-900">{{ calendarCount }}</p>
        <p class="text-sm text-gray-500">Calendar</p>
      </NuxtLink>

      <!-- Someday/Maybe -->
      <NuxtLink
        to="/someday"
        class="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
      >
        <p class="text-2xl font-bold text-gray-900">{{ somedayCount }}</p>
        <p class="text-sm text-gray-500">Someday/Maybe</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()

const inboxCount = computed(() => itemsStore.inbox.length)
const nextActionsCount = computed(() => itemsStore.nextActions.length)
const waitingCount = computed(() => itemsStore.waiting.length)
const calendarCount = computed(() => itemsStore.calendar.length)
const somedayCount = computed(() => itemsStore.someday.length)

const staleProjectCount = computed(() =>
  projectsStore.active.filter((p) => {
    const projectItems = itemsStore.byProject(p.id)
    return !projectItems.some((i) => i.status === 'next')
  }).length
)
</script>
