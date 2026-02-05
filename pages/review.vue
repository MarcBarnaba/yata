<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Weekly Review</h1>
    <p class="mt-2 text-gray-500">Guided review to keep your system trustworthy.</p>

    <!-- Review history toggle -->
    <div v-if="reviewsStore.reviews.length && !reviewing" class="mt-4">
      <button
        class="text-sm font-medium text-gray-500 hover:text-gray-700"
        @click="showHistory = !showHistory"
      >
        {{ showHistory ? '▾' : '▸' }} Past Reviews ({{ reviewsStore.reviews.length }})
      </button>

      <ul v-if="showHistory" class="mt-2 space-y-2">
        <li
          v-for="review in sortedReviews"
          :key="review.id"
          class="rounded-lg border border-gray-200 p-3 text-sm"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-700">{{ formatDateTime(review.completedAt) }}</span>
          </div>
          <div class="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
            <span>Inbox: {{ review.stats.inboxCount }}</span>
            <span>Next Actions: {{ review.stats.nextActionsCount }}</span>
            <span>Projects: {{ review.stats.projectsCount }}</span>
            <span>Waiting: {{ review.stats.waitingForCount }}</span>
            <span>Someday: {{ review.stats.somedayCount }}</span>
            <span v-if="review.stats.projectsWithoutNextAction > 0" class="text-amber-600">
              {{ review.stats.projectsWithoutNextAction }} stale projects
            </span>
          </div>
        </li>
      </ul>
    </div>

    <!-- Start review button -->
    <div v-if="!reviewing" class="mt-6">
      <button
        class="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        @click="startReview"
      >
        Start Weekly Review
      </button>
      <p v-if="reviewsStore.lastReview" class="mt-2 text-xs text-gray-400">
        Last review: {{ formatDateTime(reviewsStore.lastReview.completedAt) }}
      </p>
    </div>

    <!-- Review in progress -->
    <div v-if="reviewing" class="mt-6">
      <!-- Step progress -->
      <div class="flex items-center gap-1 mb-6">
        <button
          v-for="(s, i) in steps"
          :key="i"
          class="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors"
          :class="stepClass(i)"
          @click="goToStep(i)"
        >
          <span v-if="stepCompleted(i)">✓</span>
          <span>{{ s.short }}</span>
        </button>
      </div>

      <!-- Step 1: Inbox -->
      <div v-if="currentStep === 0" class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Step 1: Is Your Inbox Empty?</h2>
        <p class="text-sm text-gray-500">Process all inbox items before continuing the review.</p>

        <div
          class="rounded-lg border p-4"
          :class="inboxCount === 0 ? 'border-green-200 bg-green-50' : 'border-amber-300 bg-amber-50'"
        >
          <p v-if="inboxCount === 0" class="text-sm font-medium text-green-700">
            ✓ Inbox is empty — great job!
          </p>
          <div v-else>
            <p class="text-sm font-medium text-amber-700">
              You have {{ inboxCount }} item{{ inboxCount !== 1 ? 's' : '' }} in your inbox.
            </p>
            <NuxtLink
              to="/inbox"
              class="mt-2 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Go to Inbox
            </NuxtLink>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="inboxCount > 0"
            @click="currentStep = 1"
          >
            Next →
          </button>
        </div>
      </div>

      <!-- Step 2: Projects -->
      <div v-if="currentStep === 1" class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Step 2: Do All Projects Have a Next Action?</h2>
        <p class="text-sm text-gray-500">Every active project should have at least one next action to keep moving forward.</p>

        <div
          class="rounded-lg border p-4"
          :class="staleProjects.length === 0 ? 'border-green-200 bg-green-50' : 'border-amber-300 bg-amber-50'"
        >
          <p v-if="staleProjects.length === 0" class="text-sm font-medium text-green-700">
            ✓ All projects have next actions!
          </p>
          <div v-else class="space-y-3">
            <p class="text-sm font-medium text-amber-700">
              {{ staleProjects.length }} project{{ staleProjects.length !== 1 ? 's' : '' }} without a next action:
            </p>
            <ul class="space-y-2">
              <li v-for="project in staleProjects" :key="project.id" class="flex items-center justify-between">
                <span class="text-sm text-gray-700">{{ project.title }}</span>
                <NuxtLink
                  :to="`/projects/${project.id}`"
                  class="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                >
                  Add next action →
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="flex justify-between">
          <button class="text-sm text-gray-500 hover:text-gray-700" @click="currentStep = 0">
            ← Back
          </button>
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="staleProjects.length > 0"
            @click="currentStep = 2"
          >
            Next →
          </button>
        </div>
      </div>

      <!-- Step 3: Waiting For -->
      <div v-if="currentStep === 2" class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Step 3: Review Waiting For Items</h2>
        <p class="text-sm text-gray-500">Are these items still valid? Do you need to follow up?</p>

        <div v-if="waitingItems.length === 0" class="rounded-lg border border-green-200 bg-green-50 p-4">
          <p class="text-sm font-medium text-green-700">✓ No waiting for items to review.</p>
        </div>

        <ul v-else class="space-y-2">
          <li
            v-for="item in waitingItems"
            :key="item.id"
            class="rounded-lg border border-gray-200 p-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
                <div class="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span v-if="item.delegatedTo" class="text-purple-600">→ {{ item.delegatedTo }}</span>
                  <span v-if="item.waitingForDate">since {{ formatDate(item.waitingForDate) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0">
                <button
                  class="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50"
                  @click="markDone(item.id)"
                >
                  Done
                </button>
                <button
                  class="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                  @click="convertToNextAction(item.id)"
                >
                  → Action
                </button>
                <button
                  class="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                  @click="trashItem(item.id)"
                >
                  Trash
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div class="flex justify-between">
          <button class="text-sm text-gray-500 hover:text-gray-700" @click="currentStep = 1">
            ← Back
          </button>
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            @click="currentStep = 3"
          >
            Next →
          </button>
        </div>
      </div>

      <!-- Step 4: Calendar -->
      <div v-if="currentStep === 3" class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Step 4: Review Upcoming Calendar</h2>
        <p class="text-sm text-gray-500">Check your upcoming commitments for the next two weeks.</p>

        <div v-if="upcomingCalendarItems.length === 0" class="rounded-lg border border-green-200 bg-green-50 p-4">
          <p class="text-sm font-medium text-green-700">✓ No upcoming calendar items.</p>
        </div>

        <ul v-else class="space-y-2">
          <li
            v-for="item in upcomingCalendarItems"
            :key="item.id"
            class="rounded-lg border border-gray-200 p-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
                <p class="mt-0.5 text-xs" :class="isOverdue(item.dueDate!) ? 'text-red-600 font-medium' : 'text-gray-500'">
                  {{ formatDate(item.dueDate!) }}
                  <span v-if="isOverdue(item.dueDate!)" class="ml-1">— overdue</span>
                </p>
              </div>
              <button
                class="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50 flex-shrink-0"
                @click="markDone(item.id)"
              >
                Done
              </button>
            </div>
          </li>
        </ul>

        <div class="flex justify-between">
          <button class="text-sm text-gray-500 hover:text-gray-700" @click="currentStep = 2">
            ← Back
          </button>
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            @click="currentStep = 4"
          >
            Next →
          </button>
        </div>
      </div>

      <!-- Step 5: Someday/Maybe -->
      <div v-if="currentStep === 4" class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Step 5: Review Someday/Maybe</h2>
        <p class="text-sm text-gray-500">Anything ready to promote? Anything no longer relevant?</p>

        <div v-if="somedayItems.length === 0" class="rounded-lg border border-green-200 bg-green-50 p-4">
          <p class="text-sm font-medium text-green-700">✓ No someday/maybe items to review.</p>
        </div>

        <ul v-else class="space-y-2">
          <li
            v-for="item in somedayItems"
            :key="item.id"
            class="rounded-lg border border-gray-200 p-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
                <p v-if="item.notes" class="mt-0.5 text-sm text-gray-500 line-clamp-1">{{ item.notes }}</p>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0">
                <button
                  class="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                  @click="promoteToAction(item.id)"
                >
                  → Action
                </button>
                <button
                  class="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                  @click="trashItem(item.id)"
                >
                  Trash
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div class="flex justify-between">
          <button class="text-sm text-gray-500 hover:text-gray-700" @click="currentStep = 3">
            ← Back
          </button>
          <button
            class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canComplete"
            @click="completeReview"
          >
            Complete Review ✓
          </button>
        </div>
        <p v-if="!canComplete" class="text-xs text-amber-600">
          Cannot complete: inbox must be empty and all projects need a next action.
        </p>
      </div>

      <!-- Cancel -->
      <div class="mt-6 border-t border-gray-100 pt-4">
        <button class="text-sm text-gray-400 hover:text-gray-600" @click="reviewing = false">
          Cancel review
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()
const reviewsStore = useReviewsStore()

const reviewing = ref(false)
const currentStep = ref(0)
const showHistory = ref(false)

const steps = [
  { short: 'Inbox' },
  { short: 'Projects' },
  { short: 'Waiting' },
  { short: 'Calendar' },
  { short: 'Someday' },
]

function startReview() {
  reviewing.value = true
  currentStep.value = 0
}

// Step data
const inboxCount = computed(() => itemsStore.inbox.length)

const staleProjects = computed(() =>
  projectsStore.active.filter((p) => {
    const projectItems = itemsStore.byProject(p.id)
    return !projectItems.some((i) => i.status === 'next')
  })
)

const waitingItems = computed(() => itemsStore.waiting)
const somedayItems = computed(() => itemsStore.someday)

const upcomingCalendarItems = computed(() => {
  const today = new Date()
  const twoWeeksOut = new Date()
  twoWeeksOut.setDate(today.getDate() + 14)
  const todayKey = toDateKey(today)
  const endKey = toDateKey(twoWeeksOut)

  return itemsStore.calendar
    .filter((i) => i.dueDate && i.dueDate <= endKey)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
})

// Completion gating
const canComplete = computed(() =>
  inboxCount.value === 0 && staleProjects.value.length === 0
)

// Step progress tracking
function stepCompleted(i: number): boolean {
  if (i === 0) return inboxCount.value === 0
  if (i === 1) return staleProjects.value.length === 0
  // Steps 2-4 are considered visited once user has moved past them
  return currentStep.value > i
}

function stepClass(i: number): string {
  if (i === currentStep.value) return 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
  if (stepCompleted(i)) return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-600'
}

function goToStep(i: number) {
  // Can navigate to any step (no gating on navigation, only on completion)
  currentStep.value = i
}

// Inline actions
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

function promoteToAction(id: string) {
  itemsStore.updateItem(id, { status: 'next' })
}

function trashItem(id: string) {
  itemsStore.trashItem(id)
}

function completeReview() {
  const now = new Date().toISOString()
  reviewsStore.addReview({
    id: crypto.randomUUID(),
    completedAt: now,
    stats: {
      inboxCount: inboxCount.value,
      nextActionsCount: itemsStore.nextActions.length,
      projectsCount: projectsStore.active.length,
      projectsWithoutNextAction: staleProjects.value.length,
      waitingForCount: waitingItems.value.length,
      somedayCount: somedayItems.value.length,
    },
  })
  reviewing.value = false
}

// Review history
const sortedReviews = computed(() =>
  [...reviewsStore.reviews].sort((a, b) => b.completedAt.localeCompare(a.completedAt))
)

// Helpers
function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function isOverdue(dateStr: string): boolean {
  return dateStr < toDateKey(new Date())
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
</script>
