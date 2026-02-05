<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
    <p class="mt-2 text-gray-500">Your GTD system at a glance.</p>

    <!-- System health -->
    <div class="mt-6 rounded-lg border p-4" :class="healthBorderClass">
      <div class="flex items-center gap-2">
        <span class="text-lg">{{ healthIcon }}</span>
        <span class="text-sm font-medium" :class="healthTextClass">{{ healthLabel }}</span>
      </div>
      <ul v-if="healthIssues.length" class="mt-2 space-y-1">
        <li v-for="issue in healthIssues" :key="issue" class="text-xs text-gray-600">
          {{ issue }}
        </li>
      </ul>
    </div>

    <!-- Stats cards -->
    <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
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

      <!-- Weekly Review -->
      <NuxtLink
        to="/review"
        class="rounded-lg border p-4 hover:bg-gray-50 transition-colors"
        :class="reviewOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'"
      >
        <p class="text-sm font-medium" :class="reviewOverdue ? 'text-red-700' : 'text-gray-900'">
          {{ lastReviewLabel }}
        </p>
        <p class="text-sm text-gray-500">Weekly Review</p>
        <p v-if="reviewOverdue" class="mt-1 text-xs font-medium text-red-700">
          Overdue — review needed
        </p>
      </NuxtLink>
    </div>

    <!-- Quick links -->
    <div class="mt-6">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Quick Links</h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {{ link.icon }} {{ link.label }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()
const reviewsStore = useReviewsStore()

const inboxCount = computed(() => itemsStore.inbox.length)
const nextActionsCount = computed(() => itemsStore.nextActions.length)
const waitingCount = computed(() => itemsStore.waiting.length)
const calendarCount = computed(() => itemsStore.calendar.length)

const staleProjectCount = computed(() =>
  projectsStore.active.filter((p) => {
    const projectItems = itemsStore.byProject(p.id)
    return !projectItems.some((i) => i.status === 'next')
  }).length
)

// Weekly review status
const lastReview = computed(() => reviewsStore.lastReview)

const daysSinceReview = computed(() => {
  if (!lastReview.value) return null
  const last = new Date(lastReview.value.completedAt)
  const now = new Date()
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
})

const reviewOverdue = computed(() => {
  if (!lastReview.value) return true // never reviewed = overdue
  return daysSinceReview.value !== null && daysSinceReview.value > 7
})

const lastReviewLabel = computed(() => {
  if (!lastReview.value) return 'Never'
  if (daysSinceReview.value === 0) return 'Today'
  if (daysSinceReview.value === 1) return '1 day ago'
  return `${daysSinceReview.value} days ago`
})

// System health
const healthIssues = computed(() => {
  const issues: string[] = []
  if (inboxCount.value > 0) issues.push(`${inboxCount.value} items in inbox need processing`)
  if (staleProjectCount.value > 0) issues.push(`${staleProjectCount.value} projects without next actions`)
  if (reviewOverdue.value) issues.push('Weekly review is overdue')
  return issues
})

const healthLevel = computed(() => {
  if (healthIssues.value.length === 0) return 'green'
  if (healthIssues.value.length <= 1) return 'yellow'
  return 'red'
})

const healthIcon = computed(() => {
  if (healthLevel.value === 'green') return '●'
  if (healthLevel.value === 'yellow') return '●'
  return '●'
})

const healthBorderClass = computed(() => {
  if (healthLevel.value === 'green') return 'border-green-200 bg-green-50'
  if (healthLevel.value === 'yellow') return 'border-amber-300 bg-amber-50'
  return 'border-red-300 bg-red-50'
})

const healthTextClass = computed(() => {
  if (healthLevel.value === 'green') return 'text-green-700'
  if (healthLevel.value === 'yellow') return 'text-amber-700'
  return 'text-red-700'
})

const healthLabel = computed(() => {
  if (healthLevel.value === 'green') return 'System is healthy — all clear!'
  if (healthLevel.value === 'yellow') return 'System needs attention'
  return 'System needs attention'
})

// Quick links
const quickLinks = [
  { to: '/inbox', icon: '↓', label: 'Inbox' },
  { to: '/next-actions', icon: '→', label: 'Next Actions' },
  { to: '/projects', icon: '▸', label: 'Projects' },
  { to: '/waiting-for', icon: '⏳', label: 'Waiting For' },
  { to: '/calendar', icon: '📅', label: 'Calendar' },
  { to: '/someday', icon: '💭', label: 'Someday/Maybe' },
  { to: '/reference', icon: '📁', label: 'Reference' },
  { to: '/review', icon: '✓', label: 'Weekly Review' },
  { to: '/completed', icon: '✓', label: 'Completed' },
  { to: '/settings', icon: '⚙', label: 'Settings' },
]
</script>
