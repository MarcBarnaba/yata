<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Settings</h1>

    <!-- Contexts Management -->
    <section class="mt-6">
      <h2 class="text-lg font-semibold text-gray-800">Contexts</h2>
      <p class="mt-1 text-sm text-gray-500">Manage your GTD contexts for filtering actions.</p>

      <!-- Add context -->
      <form class="mt-4 flex gap-2" @submit.prevent="addContext">
        <input
          v-model="newContextName"
          type="text"
          placeholder="e.g. @phone"
          class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          :disabled="!newContextName.trim()"
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>

      <!-- Context list -->
      <ul class="mt-4 divide-y divide-gray-100">
        <li
          v-for="ctx in contextsStore.contexts"
          :key="ctx.id"
          class="flex items-center gap-3 py-3"
        >
          <template v-if="editingId === ctx.id">
            <input
              v-model="editName"
              type="text"
              class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              @keyup.enter="saveEdit(ctx.id)"
              @keyup.escape="cancelEdit"
            />
            <button
              class="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
              @click="saveEdit(ctx.id)"
            >
              Save
            </button>
            <button
              class="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
              @click="cancelEdit"
            >
              Cancel
            </button>
          </template>
          <template v-else>
            <span class="flex-1 text-sm text-gray-800">{{ ctx.name }}</span>
            <button
              class="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              @click="startEdit(ctx)"
            >
              Edit
            </button>
            <button
              class="rounded px-2 py-1 text-sm text-red-500 hover:bg-red-50 hover:text-red-700"
              @click="confirmDelete(ctx)"
            >
              Delete
            </button>
          </template>
        </li>
      </ul>

      <p v-if="contextsStore.contexts.length === 0" class="mt-4 text-sm text-gray-400">
        No contexts defined.
      </p>
    </section>

    <!-- Tags Management -->
    <section class="mt-8">
      <h2 class="text-lg font-semibold text-gray-800">Tags</h2>
      <p class="mt-1 text-sm text-gray-500">Manage tags for additional categorization of your items.</p>

      <!-- Add tag -->
      <form class="mt-4 flex gap-2" @submit.prevent="addTag">
        <input
          v-model="newTagName"
          type="text"
          placeholder="e.g. urgent"
          class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          :disabled="!newTagName.trim()"
          class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>

      <!-- Tag list -->
      <ul class="mt-4 divide-y divide-gray-100">
        <li
          v-for="tag in tagsStore.tags"
          :key="tag.id"
          class="flex items-center gap-3 py-3"
        >
          <template v-if="editingTagId === tag.id">
            <input
              v-model="editTagName"
              type="text"
              class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              @keyup.enter="saveTagEdit(tag.id)"
              @keyup.escape="cancelTagEdit"
            />
            <button
              class="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
              @click="saveTagEdit(tag.id)"
            >
              Save
            </button>
            <button
              class="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
              @click="cancelTagEdit"
            >
              Cancel
            </button>
          </template>
          <template v-else>
            <span class="flex-1 text-sm text-gray-800">{{ tag.name }}</span>
            <button
              class="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              @click="startTagEdit(tag)"
            >
              Edit
            </button>
            <button
              class="rounded px-2 py-1 text-sm text-red-500 hover:bg-red-50 hover:text-red-700"
              @click="confirmDeleteTag(tag)"
            >
              Delete
            </button>
          </template>
        </li>
      </ul>

      <p v-if="tagsStore.tags.length === 0" class="mt-4 text-sm text-gray-400">
        No tags defined.
      </p>
    </section>

    <!-- Keyboard Shortcuts -->
    <section class="mt-8">
      <h2 class="text-lg font-semibold text-gray-800">Keyboard Shortcuts</h2>
      <p class="mt-1 text-sm text-gray-500">Quick access to common actions without using the mouse.</p>

      <div class="mt-4 space-y-4">
        <div v-for="category in shortcutCategories" :key="category">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{{ category }}</h3>
          <ul class="divide-y divide-gray-100 rounded-lg border border-gray-200">
            <li
              v-for="shortcut in shortcutsByCategory(category)"
              :key="shortcut.key"
              class="flex items-center justify-between px-3 py-2"
            >
              <span class="text-sm text-gray-700">{{ shortcut.description }}</span>
              <kbd class="rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-600">{{ shortcut.key }}</kbd>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Export / Import -->
    <section class="mt-8">
      <h2 class="text-lg font-semibold text-gray-800">Data</h2>
      <p class="mt-1 text-sm text-gray-500">Export and import your GSD data as JSON for backup and restore.</p>

      <div class="mt-4 flex flex-wrap gap-3">
        <button
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          @click="exportData"
        >
          Export Data
        </button>

        <label class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
          Import Data
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleFileSelect"
          />
        </label>
      </div>

      <p v-if="importMessage" class="mt-3 text-sm" :class="importError ? 'text-red-600' : 'text-green-600'">
        {{ importMessage }}
      </p>
    </section>

    <!-- Import confirmation dialog -->
    <Teleport to="body">
      <div
        v-if="pendingImport"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="cancelImport"
      >
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Import Data</h3>
          <p class="text-sm text-gray-600">
            This file contains {{ pendingImport.items.length }} items,
            {{ pendingImport.projects.length }} projects,
            {{ pendingImport.contexts.length }} contexts,
            {{ (pendingImport.tags ?? []).length }} tags, and
            {{ pendingImport.reviews.length }} reviews.
          </p>
          <p class="text-xs text-gray-400">
            Version: {{ pendingImport.version }} &middot; Exported: {{ formatDate(pendingImport.exportedAt) }}
          </p>
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input v-model="importMode" type="radio" value="replace" class="text-blue-600" />
              Replace all data (destructive)
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input v-model="importMode" type="radio" value="merge" class="text-blue-600" />
              Merge with existing data
            </label>
          </div>
          <p v-if="importMode === 'replace'" class="text-xs text-red-600">
            Warning: This will delete all existing data and replace it with the imported file.
          </p>
          <div class="flex justify-end gap-2">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              @click="cancelImport"
            >
              Cancel
            </button>
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-white"
              :class="importMode === 'replace' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
              @click="executeImport"
            >
              {{ importMode === 'replace' ? 'Replace All Data' : 'Merge Data' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete context confirmation dialog -->
    <Teleport to="body">
      <div
        v-if="deletingContext"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="deletingContext = null"
      >
        <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900">Delete context?</h3>
          <p class="mt-2 text-sm text-gray-600">
            "{{ deletingContext.name }}" will be removed from all items. This cannot be undone.
          </p>
          <div class="mt-4 flex justify-end gap-2">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              @click="deletingContext = null"
            >
              Cancel
            </button>
            <button
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              @click="executeDelete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete tag confirmation dialog -->
    <Teleport to="body">
      <div
        v-if="deletingTag"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="deletingTag = null"
      >
        <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900">Delete tag?</h3>
          <p class="mt-2 text-sm text-gray-600">
            "{{ deletingTag.name }}" will be removed from all items. This cannot be undone.
          </p>
          <div class="mt-4 flex justify-end gap-2">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              @click="deletingTag = null"
            >
              Cancel
            </button>
            <button
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              @click="executeDeleteTag"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Context, Tag, ExportData } from '~/types'
import { KEYBOARD_SHORTCUTS } from '~/composables/useKeyboardShortcuts'

const contextsStore = useContextsStore()
const tagsStore = useTagsStore()
const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()
const reviewsStore = useReviewsStore()
const settingsStore = useSettingsStore()

// --- Context management ---
const newContextName = ref('')
const editingId = ref<string | null>(null)
const editName = ref('')
const deletingContext = ref<Context | null>(null)

function addContext() {
  const name = newContextName.value.trim()
  if (!name) return

  const id = 'ctx-' + crypto.randomUUID().slice(0, 8)
  contextsStore.addContext({ id, name })
  newContextName.value = ''
}

function startEdit(ctx: Context) {
  editingId.value = ctx.id
  editName.value = ctx.name
}

function saveEdit(id: string) {
  const name = editName.value.trim()
  if (!name) return
  contextsStore.updateContext(id, { name })
  editingId.value = null
}

function cancelEdit() {
  editingId.value = null
}

function confirmDelete(ctx: Context) {
  deletingContext.value = ctx
}

function executeDelete() {
  if (!deletingContext.value) return
  itemsStore.removeContextFromAll(deletingContext.value.id)
  contextsStore.removeContext(deletingContext.value.id)
  deletingContext.value = null
}

// --- Tag management ---
const newTagName = ref('')
const editingTagId = ref<string | null>(null)
const editTagName = ref('')
const deletingTag = ref<Tag | null>(null)

function addTag() {
  const name = newTagName.value.trim()
  if (!name) return

  const id = 'tag-' + crypto.randomUUID().slice(0, 8)
  tagsStore.addTag({ id, name })
  newTagName.value = ''
}

function startTagEdit(tag: Tag) {
  editingTagId.value = tag.id
  editTagName.value = tag.name
}

function saveTagEdit(id: string) {
  const name = editTagName.value.trim()
  if (!name) return
  tagsStore.updateTag(id, { name })
  editingTagId.value = null
}

function cancelTagEdit() {
  editingTagId.value = null
}

function confirmDeleteTag(tag: Tag) {
  deletingTag.value = tag
}

function executeDeleteTag() {
  if (!deletingTag.value) return
  itemsStore.removeTagFromAll(deletingTag.value.id)
  tagsStore.removeTag(deletingTag.value.id)
  deletingTag.value = null
}

// --- Export / Import ---
const fileInput = ref<HTMLInputElement | null>(null)
const importMessage = ref('')
const importError = ref(false)
const pendingImport = ref<ExportData | null>(null)
const importMode = ref<'replace' | 'merge'>('merge')

function exportData() {
  const data: ExportData = {
    version: settingsStore.settings.version,
    exportedAt: new Date().toISOString(),
    items: itemsStore.items,
    projects: projectsStore.projects,
    contexts: contextsStore.contexts,
    tags: tagsStore.tags,
    reviews: reviewsStore.reviews,
    settings: settingsStore.settings,
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gsd-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  importMessage.value = ''
  importError.value = false

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      const validationError = validateImport(data)
      if (validationError) {
        importMessage.value = validationError
        importError.value = true
        return
      }
      pendingImport.value = data as ExportData
      importMode.value = 'merge'
    } catch {
      importMessage.value = 'Invalid JSON file. Please select a valid GSD export file.'
      importError.value = true
    }
  }
  reader.readAsText(file)

  // Reset file input so same file can be re-selected
  input.value = ''
}

function validateImport(data: unknown): string | null {
  if (!data || typeof data !== 'object') return 'Invalid file format.'
  const d = data as Record<string, unknown>
  if (!Array.isArray(d.items)) return 'Missing or invalid "items" array.'
  if (!Array.isArray(d.projects)) return 'Missing or invalid "projects" array.'
  if (!Array.isArray(d.contexts)) return 'Missing or invalid "contexts" array.'
  if (!Array.isArray(d.reviews)) return 'Missing or invalid "reviews" array.'
  if (typeof d.version !== 'string') return 'Missing version field.'
  return null
}

function cancelImport() {
  pendingImport.value = null
}

function executeImport() {
  if (!pendingImport.value) return
  const data = pendingImport.value

  if (importMode.value === 'replace') {
    itemsStore.setItems(data.items)
    projectsStore.setProjects(data.projects)
    contextsStore.setContexts(data.contexts)
    if (data.tags) tagsStore.setTags(data.tags)
    reviewsStore.setReviews(data.reviews)
    if (data.settings) settingsStore.setSettings(data.settings)
  } else {
    // Merge: add items that don't already exist (by ID)
    const existingItemIds = new Set(itemsStore.items.map((i) => i.id))
    for (const item of data.items) {
      if (!existingItemIds.has(item.id)) itemsStore.addItem(item)
    }

    const existingProjectIds = new Set(projectsStore.projects.map((p) => p.id))
    for (const project of data.projects) {
      if (!existingProjectIds.has(project.id)) projectsStore.addProject(project)
    }

    const existingContextIds = new Set(contextsStore.contexts.map((c) => c.id))
    for (const context of data.contexts) {
      if (!existingContextIds.has(context.id)) contextsStore.addContext(context)
    }

    if (data.tags) {
      const existingTagIds = new Set(tagsStore.tags.map((t) => t.id))
      for (const tag of data.tags) {
        if (!existingTagIds.has(tag.id)) tagsStore.addTag(tag)
      }
    }

    const existingReviewIds = new Set(reviewsStore.reviews.map((r) => r.id))
    for (const review of data.reviews) {
      if (!existingReviewIds.has(review.id)) reviewsStore.addReview(review)
    }
  }

  pendingImport.value = null
  importMessage.value = `Data ${importMode.value === 'replace' ? 'replaced' : 'merged'} successfully.`
  importError.value = false
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// --- Keyboard shortcuts ---
const shortcutCategories = computed(() => {
  const categories = new Set(KEYBOARD_SHORTCUTS.map((s) => s.category))
  return Array.from(categories)
})

function shortcutsByCategory(category: string) {
  return KEYBOARD_SHORTCUTS.filter((s) => s.category === category)
}
</script>
