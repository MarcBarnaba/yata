<template>
  <div>
    <div class="flex items-baseline justify-between gap-3">
      <h1 class="text-2xl font-bold text-gray-900">Today</h1>
      <p class="text-sm text-gray-500">{{ todayLabel }}</p>
    </div>

    <!-- Inbox to process (daily nudge) -->
    <NuxtLink
      v-if="inboxCount > 0"
      to="/inbox"
      class="mt-6 flex items-center justify-between gap-3 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 transition-colors hover:bg-amber-100"
    >
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-200">
          <Icon name="inbox" size="md" class="text-amber-700" />
        </span>
        <div>
          <p class="text-sm font-semibold text-amber-800">{{ inboxCount }} to sort</p>
          <p class="text-xs text-amber-600">Clarify them into actions</p>
        </div>
      </div>
      <Icon name="arrow_forward" size="md" class="text-amber-600" />
    </NuxtLink>

    <!-- Overdue -->
    <section v-if="overdue.length" class="mt-6">
      <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-red-500">
        Overdue ({{ overdue.length }})
      </h2>
      <ul class="divide-y divide-red-100 overflow-hidden rounded-lg border border-red-200 bg-red-50">
        <li v-for="item in overdue" :key="item.id" class="group flex items-start gap-3 px-3 py-2.5">
          <button class="check" :title="'Mark done'" @click="markDone(item.id)">
            <Icon name="check" :size="14" class="opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900">{{ item.title }}</p>
            <p class="mt-0.5 text-xs font-medium text-red-600">{{ dueLabel(item.dueDate!) }}</p>
          </div>
          <NuxtLink
            v-if="item.projectId"
            :to="`/projects/${item.projectId}`"
            class="flex-shrink-0 text-xs text-blue-600 hover:underline"
          >
            <Icon name="folder" :size="14" />
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- Due today -->
    <section class="mt-6">
      <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Due today ({{ dueToday.length }})
      </h2>
      <ul v-if="dueToday.length" class="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200">
        <li v-for="item in dueToday" :key="item.id" class="group flex items-start gap-3 px-3 py-2.5">
          <button class="check" :title="'Mark done'" @click="markDone(item.id)">
            <Icon name="check" :size="14" class="opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900">{{ item.title }}</p>
            <div v-if="item.contexts.length || item.duration" class="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span
                v-for="ctxId in item.contexts"
                :key="ctxId"
                class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
              >{{ getContextName(ctxId) }}</span>
              <span v-if="item.duration" class="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                {{ item.duration }}
              </span>
            </div>
          </div>
          <NuxtLink
            v-if="item.projectId"
            :to="`/projects/${item.projectId}`"
            class="flex-shrink-0 text-xs text-blue-600 hover:underline"
          >
            <Icon name="folder" :size="14" />
          </NuxtLink>
        </li>
      </ul>
      <p v-else class="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
        Nothing due today.
      </p>
    </section>

    <!-- Follow-ups due -->
    <section v-if="followUps.length" class="mt-6">
      <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-500">
        Follow up ({{ followUps.length }})
      </h2>
      <ul class="divide-y divide-purple-100 overflow-hidden rounded-lg border border-purple-200 bg-purple-50">
        <li v-for="item in followUps" :key="item.id" class="px-3 py-2.5">
          <p class="truncate text-sm font-medium text-gray-900">{{ item.title }}</p>
          <p class="mt-0.5 text-xs text-purple-600">
            {{ item.delegatedTo ? `Waiting on ${item.delegatedTo}` : 'Time to follow up' }}
          </p>
        </li>
      </ul>
    </section>

    <!-- All clear -->
    <div
      v-if="!overdue.length && !dueToday.length && !followUps.length"
      class="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-14 text-center"
    >
      <div class="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <Icon name="wb_sunny" size="lg" class="text-green-600" />
      </div>
      <p class="mt-3 text-base font-semibold text-gray-900">Your day is clear</p>
      <p class="mt-1 text-sm text-gray-500">Nothing scheduled or overdue.</p>
      <NuxtLink to="/next-actions" class="mt-3 text-sm text-blue-600 hover:text-blue-700">
        Pick a next action
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const itemsStore = useItemsStore()
const contextsStore = useContextsStore()

const inboxCount = computed(() => itemsStore.inbox.length)

const MS_PER_DAY = 1000 * 60 * 60 * 24
function daysUntil(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  if (Number.isNaN(target.getTime())) return Infinity
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY)
}

const dated = computed(() =>
  itemsStore.items.filter((i) => i.dueDate && i.status !== 'done' && i.status !== 'trashed'),
)

const overdue = computed(() =>
  dated.value
    .filter((i) => daysUntil(i.dueDate as string) < 0)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1)),
)
const dueToday = computed(() => dated.value.filter((i) => daysUntil(i.dueDate as string) === 0))
const followUps = computed(() =>
  itemsStore.waiting.filter((i) => i.waitingForDate && daysUntil(i.waitingForDate) <= 0),
)

const todayLabel = computed(() =>
  new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
)

function dueLabel(iso: string): string {
  const d = daysUntil(iso)
  if (d < 0) return d === -1 ? '1 day overdue' : `${-d} days overdue`
  if (d === 0) return 'Due today'
  return ''
}

function markDone(id: string) {
  itemsStore.updateItem(id, { status: 'done', completedAt: new Date().toISOString() })
}

function getContextName(ctxId: string): string {
  return contextsStore.getById(ctxId)?.name ?? ctxId
}
</script>

<style scoped>
.check {
  margin-top: 0.125rem;
  display: flex;
  height: 1.25rem;
  width: 1.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  border: 2px solid #d1d5db;
  color: #16a34a;
  transition: border-color 150ms ease, background-color 150ms ease;
}
.check:hover {
  border-color: #22c55e;
  background-color: #f0fdf4;
}
</style>
