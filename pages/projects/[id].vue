<template>
  <div>
    <div v-if="!project" class="mt-8 text-center">
      <p class="text-gray-500">Project not found.</p>
      <NuxtLink to="/projects" class="mt-2 inline-block text-sm text-blue-600 hover:underline">
        Back to Projects
      </NuxtLink>
    </div>

    <div v-else>
      <!-- Back link -->
      <div class="flex items-center gap-2 mb-4">
        <NuxtLink to="/projects" class="text-sm text-gray-500 hover:text-gray-700">
          &larr; Projects
        </NuxtLink>
      </div>

      <!-- Project header -->
      <div class="rounded-lg border border-gray-200 bg-white p-5">
        <template v-if="editing">
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                v-model="editTitle"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Desired outcome</label>
              <textarea
                v-model="editOutcome"
                rows="2"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
            <div class="flex gap-2">
              <button
                :disabled="!editTitle.trim()"
                class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="saveEdit"
              >
                Save
              </button>
              <button
                class="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                @click="editing = false"
              >
                Cancel
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex items-start justify-between gap-3">
            <div>
              <h1 class="text-xl font-bold text-gray-900">{{ project.title }}</h1>
              <p v-if="project.outcome" class="mt-1 text-sm text-gray-500">{{ project.outcome }}</p>
              <p class="mt-2 text-xs text-gray-400">
                Status: <span class="font-medium" :class="project.status === 'active' ? 'text-green-600' : 'text-gray-500'">{{ project.status }}</span>
              </p>
            </div>
            <div v-if="project.status === 'active'" class="flex items-center gap-1">
              <button
                class="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                @click="startEdit"
              >
                Edit
              </button>
              <button
                class="rounded px-2 py-1 text-sm text-green-600 hover:bg-green-50"
                @click="completeProject"
              >
                Complete
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Warning: no next action -->
      <div
        v-if="project.status === 'active' && !currentNextAction"
        class="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        This project has no next action. Add one below to keep it moving forward.
      </div>

      <!-- Current next action -->
      <div v-if="currentNextAction" class="mt-4">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Current Next Action</h2>
        <div class="flex items-start gap-3 rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
          <button
            class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-blue-300 hover:border-green-500 hover:bg-green-50 transition-colors"
            title="Mark as done"
            @click="markItemDone(currentNextAction!.id)"
          >
            <span class="opacity-0 hover:opacity-100 text-green-600 text-xs">✓</span>
          </button>
          <div>
            <p class="text-sm font-medium text-gray-900">{{ currentNextAction.title }}</p>
            <p v-if="currentNextAction.notes" class="mt-0.5 text-sm text-gray-500">{{ currentNextAction.notes }}</p>
          </div>
        </div>
      </div>

      <!-- Add item to project -->
      <div v-if="project.status === 'active'" class="mt-4">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Add Item</h2>
        <form class="flex gap-2" @submit.prevent="addItemToProject">
          <input
            v-model="newItemTitle"
            type="text"
            placeholder="Add a next action to this project..."
            class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            :disabled="!newItemTitle.trim()"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </form>
      </div>

      <!-- All linked items grouped by status -->
      <div class="mt-6 space-y-4">
        <div v-for="group in itemGroups" :key="group.label">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            {{ group.label }} ({{ group.items.length }})
          </h2>
          <ul class="divide-y divide-gray-100 rounded-lg border border-gray-200">
            <li v-for="item in group.items" :key="item.id" class="group flex items-start gap-3 px-3 py-2.5">
              <button
                v-if="item.status === 'next'"
                class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors"
                title="Mark as done"
                @click="markItemDone(item.id)"
              >
                <span class="opacity-0 group-hover:opacity-100 text-green-600 text-xs">✓</span>
              </button>
              <span
                v-else-if="item.status === 'done'"
                class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-green-100 text-green-600 text-xs"
              >✓</span>
              <span
                v-else
                class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400 text-xs"
              >·</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm" :class="item.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'">
                  {{ item.title }}
                </p>
                <div v-if="item.contexts.length" class="mt-0.5 flex flex-wrap gap-1">
                  <span
                    v-for="ctxId in item.contexts"
                    :key="ctxId"
                    class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                  >
                    {{ getContextName(ctxId) }}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="projectItems.length === 0" class="text-center text-sm text-gray-400 py-4">
          No items linked to this project yet.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Item } from '~/types'

const route = useRoute()
const projectsStore = useProjectsStore()
const itemsStore = useItemsStore()
const contextsStore = useContextsStore()

const projectId = computed(() => route.params.id as string)
const project = computed(() => projectsStore.getById(projectId.value))

const projectItems = computed(() => itemsStore.byProject(projectId.value))

const currentNextAction = computed(() =>
  projectItems.value.find((i) => i.status === 'next')
)

// Group items by status for display
const itemGroups = computed(() => {
  const statusOrder: { status: string; label: string }[] = [
    { status: 'next', label: 'Next Actions' },
    { status: 'waiting', label: 'Waiting For' },
    { status: 'calendar', label: 'Calendar' },
    { status: 'done', label: 'Completed' },
  ]

  return statusOrder
    .map((group) => ({
      label: group.label,
      items: projectItems.value.filter((i) => i.status === group.status),
    }))
    .filter((group) => group.items.length > 0)
})

// Edit project
const editing = ref(false)
const editTitle = ref('')
const editOutcome = ref('')

function startEdit() {
  if (!project.value) return
  editTitle.value = project.value.title
  editOutcome.value = project.value.outcome
  editing.value = true
}

function saveEdit() {
  const title = editTitle.value.trim()
  if (!title) return
  projectsStore.updateProject(projectId.value, {
    title,
    outcome: editOutcome.value.trim(),
  })
  editing.value = false
}

function completeProject() {
  projectsStore.updateProject(projectId.value, { status: 'completed' })
}

// Add item to project
const newItemTitle = ref('')

function addItemToProject() {
  const title = newItemTitle.value.trim()
  if (!title) return

  const now = new Date().toISOString()
  itemsStore.addItem({
    id: crypto.randomUUID(),
    title,
    notes: '',
    createdAt: now,
    updatedAt: now,
    status: 'next',
    contexts: [],
    tags: [],
    projectId: projectId.value,
    dueDate: null,
    delegatedTo: null,
    waitingForDate: null,
    completedAt: null,
    previousStatus: null,
    duration: null,
    energy: null,
  })

  newItemTitle.value = ''
}

function markItemDone(id: string) {
  itemsStore.updateItem(id, {
    status: 'done',
    completedAt: new Date().toISOString(),
  })
}

function getContextName(ctxId: string): string {
  const ctx = contextsStore.getById(ctxId)
  return ctx ? ctx.name : ctxId
}
</script>
