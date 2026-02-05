<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>

    <!-- System Health (simplified) -->
    <div class="mt-4 flex items-center gap-2 text-sm">
      <Icon :name="healthIcon" size="sm" :class="healthTextClass" />
      <span :class="healthTextClass">{{ healthLabel }}</span>
    </div>

    <!-- Items to Process (prominent when items exist) -->
    <section v-if="inboxCount > 0" class="mt-6">
      <NuxtLink
        to="/inbox"
        class="block rounded-lg border-2 border-amber-300 bg-amber-50 p-5 hover:bg-amber-100 hover:border-amber-400 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-amber-200">
              <Icon name="inbox" size="lg" class="text-amber-700" />
            </div>
            <div>
              <p class="text-lg font-semibold text-amber-800">{{ inboxCount }} items to process</p>
              <p class="text-sm text-amber-600">Clear your inbox to stay organized</p>
            </div>
          </div>
          <Icon name="arrow_forward" size="md" class="text-amber-600" />
        </div>
      </NuxtLink>
    </section>

    <!-- Next Actions -->
    <section class="mt-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-gray-500">Next Actions</h2>
        <NuxtLink to="/next-actions" class="text-sm text-blue-600 hover:text-blue-700">
          View all ({{ nextActionsCount }})
        </NuxtLink>
      </div>

      <div v-if="topNextActions.length" class="space-y-2">
        <NuxtLink
          v-for="item in topNextActions"
          :key="item.id"
          :to="`/next-actions`"
          class="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
        >
          <Icon name="arrow_forward" size="sm" class="text-blue-500 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ item.title }}</p>
            <div v-if="item.contexts?.length" class="flex gap-1 mt-1">
              <span
                v-for="ctx in getContextLabels(item.contexts).slice(0, 2)"
                :key="ctx"
                class="text-xs text-gray-400"
              >
                @{{ ctx }}
              </span>
            </div>
          </div>
          <span v-if="item.duration" class="text-xs text-gray-400">{{ formatDuration(item.duration) }}</span>
        </NuxtLink>
      </div>

      <div v-else class="rounded-lg border border-dashed border-gray-200 p-4 text-center">
        <p class="text-sm text-gray-400">No next actions defined</p>
        <p class="text-xs text-gray-400 mt-1">Process your inbox to create actions</p>
      </div>
    </section>

    <!-- Active Projects -->
    <section class="mt-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-gray-500">Active Projects</h2>
        <NuxtLink to="/projects" class="text-sm text-blue-600 hover:text-blue-700">
          View all ({{ activeProjectsCount }})
        </NuxtLink>
      </div>

      <div v-if="activeProjectsCount > 0" class="space-y-2">
        <!-- Stale projects warning -->
        <div
          v-if="staleProjects.length"
          class="rounded-lg border border-amber-200 bg-amber-50 p-3"
        >
          <div class="flex items-start gap-2">
            <Icon name="warning" size="sm" class="text-amber-600 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-amber-800">
                {{ staleProjects.length }} project{{ staleProjects.length > 1 ? 's' : '' }} without next action
              </p>
              <ul class="mt-1 space-y-0.5">
                <li v-for="project in staleProjects.slice(0, 3)" :key="project.id" class="text-xs text-amber-700">
                  {{ project.title }}
                </li>
                <li v-if="staleProjects.length > 3" class="text-xs text-amber-600">
                  +{{ staleProjects.length - 3 }} more
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Healthy projects summary -->
        <div v-if="healthyProjectsCount > 0" class="flex items-center gap-2 text-sm text-gray-600">
          <Icon name="check_circle" size="sm" class="text-green-500" />
          {{ healthyProjectsCount }} project{{ healthyProjectsCount > 1 ? 's' : '' }} on track
        </div>
      </div>

      <div v-else class="rounded-lg border border-dashed border-gray-200 p-4 text-center">
        <p class="text-sm text-gray-400">No active projects</p>
      </div>
    </section>

    <!-- Weekly Review Status -->
    <section class="mt-6">
      <NuxtLink
        to="/review"
        class="flex items-center gap-3 rounded-lg border p-3 transition-colors"
        :class="reviewOverdue ? 'border-red-200 bg-red-50 hover:bg-red-100' : 'border-gray-200 hover:bg-gray-50'"
      >
        <Icon
          name="checklist"
          size="md"
          :class="reviewOverdue ? 'text-red-500' : 'text-gray-400'"
        />
        <div class="flex-1">
          <p class="text-sm font-medium" :class="reviewOverdue ? 'text-red-800' : 'text-gray-700'">
            Weekly Review
          </p>
          <p class="text-xs" :class="reviewOverdue ? 'text-red-600' : 'text-gray-400'">
            {{ lastReviewLabel }}
            <span v-if="reviewOverdue"> — overdue</span>
          </p>
        </div>
        <Icon name="arrow_forward" size="sm" :class="reviewOverdue ? 'text-red-400' : 'text-gray-400'" />
      </NuxtLink>
    </section>

    <!-- Someday/Maybe (subtle) -->
    <section v-if="somedayCount > 0" class="mt-6 pt-4 border-t border-gray-100">
      <NuxtLink
        to="/someday"
        class="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Icon name="lightbulb" size="sm" />
        <span>{{ somedayCount }} items in Someday/Maybe</span>
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Duration } from '~/types'

const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()
const reviewsStore = useReviewsStore()
const contextsStore = useContextsStore()

// Counts
const inboxCount = computed(() => itemsStore.inbox.length)
const nextActionsCount = computed(() => itemsStore.nextActions.length)
const somedayCount = computed(() => itemsStore.someday.length)
const activeProjectsCount = computed(() => projectsStore.active.length)

// Top 5 next actions (most recently updated or created)
const topNextActions = computed(() =>
  [...itemsStore.nextActions]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
)

// Projects analysis
const staleProjects = computed(() =>
  projectsStore.active.filter((p) => {
    const projectItems = itemsStore.byProject(p.id)
    return !projectItems.some((i) => i.status === 'next')
  })
)

const healthyProjectsCount = computed(() => activeProjectsCount.value - staleProjects.value.length)

// Get context labels for an item
function getContextLabels(contextIds: string[]): string[] {
  return contextIds
    .map((id) => contextsStore.contexts.find((c) => c.id === id)?.name)
    .filter(Boolean) as string[]
}

// Format duration
function formatDuration(duration: Duration): string {
  const labels: Record<Duration, string> = {
    '5min': '5m',
    '15min': '15m',
    '30min': '30m',
    '1h': '1h',
    '2h+': '2h+',
  }
  return labels[duration] || duration
}

// Weekly review status
const lastReview = computed(() => reviewsStore.lastReview)

const daysSinceReview = computed(() => {
  if (!lastReview.value) return null
  const last = new Date(lastReview.value.completedAt)
  const now = new Date()
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
})

const reviewOverdue = computed(() => {
  if (!lastReview.value) return true
  return daysSinceReview.value !== null && daysSinceReview.value > 7
})

const lastReviewLabel = computed(() => {
  if (!lastReview.value) return 'Never completed'
  if (daysSinceReview.value === 0) return 'Completed today'
  if (daysSinceReview.value === 1) return 'Completed yesterday'
  return `${daysSinceReview.value} days ago`
})

// System health (simplified)
const healthIssues = computed(() => {
  const issues: string[] = []
  if (inboxCount.value > 0) issues.push('inbox')
  if (staleProjects.value.length > 0) issues.push('stale projects')
  if (reviewOverdue.value) issues.push('review')
  return issues
})

const healthLevel = computed(() => {
  if (healthIssues.value.length === 0) return 'green'
  if (healthIssues.value.length === 1) return 'yellow'
  return 'red'
})

const healthIcon = computed(() => {
  if (healthLevel.value === 'green') return 'check_circle'
  if (healthLevel.value === 'yellow') return 'info'
  return 'warning'
})

const healthTextClass = computed(() => {
  if (healthLevel.value === 'green') return 'text-green-600'
  if (healthLevel.value === 'yellow') return 'text-amber-600'
  return 'text-red-600'
})

const healthLabel = computed(() => {
  if (healthLevel.value === 'green') return 'All clear — system is healthy'
  return `Needs attention: ${healthIssues.value.join(', ')}`
})
</script>
