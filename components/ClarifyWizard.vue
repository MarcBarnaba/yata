<template>
  <div class="space-y-6">
    <!-- Progress indicator -->
    <div class="flex items-center gap-2 text-sm text-gray-400">
      <span
        v-for="(label, i) in breadcrumbs"
        :key="i"
        class="flex items-center gap-2"
      >
        <Icon v-if="i > 0" name="chevron_right" size="sm" />
        <span :class="i === breadcrumbs.length - 1 ? 'text-gray-700 font-medium' : ''">
          {{ label }}
        </span>
      </span>
    </div>

    <!-- Step: Is it actionable? -->
    <div v-if="step === 'actionable'" class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900">Is this actionable?</h2>
      <p class="text-sm text-gray-500">
        Does "{{ item.title }}" require a physical action to move forward?
      </p>
      <div class="flex gap-3">
        <button
          class="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-blue-200 bg-blue-50 px-6 py-4 text-base font-medium text-blue-700 hover:border-blue-400 hover:bg-blue-100 transition-colors min-h-[56px]"
          @click="step = 'singleAction'"
        >
          <Icon name="check_circle" size="md" />
          Yes, it's actionable
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-gray-50 px-6 py-4 text-base font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-100 transition-colors min-h-[56px]"
          @click="step = 'notActionable'"
        >
          <Icon name="cancel" size="md" />
          No, it's not
        </button>
      </div>
    </div>

    <!-- Step: Not actionable — choose destination -->
    <div v-if="step === 'notActionable'" class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900">What should happen to it?</h2>
      <div class="space-y-3">
        <button
          class="w-full flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-4 text-left hover:bg-gray-50 hover:border-gray-300 transition-colors min-h-[56px]"
          @click="fileAs('reference')"
        >
          <Icon name="folder" size="md" class="text-gray-400 mt-0.5" />
          <div>
            <span class="font-medium text-gray-900">Reference</span>
            <span class="block text-sm text-gray-500">Keep for future reference — no action needed</span>
          </div>
        </button>
        <button
          class="w-full flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-4 text-left hover:bg-gray-50 hover:border-gray-300 transition-colors min-h-[56px]"
          @click="fileAs('someday')"
        >
          <Icon name="lightbulb" size="md" class="text-gray-400 mt-0.5" />
          <div>
            <span class="font-medium text-gray-900">Someday / Maybe</span>
            <span class="block text-sm text-gray-500">Might want to do this later, but not now</span>
          </div>
        </button>
        <button
          class="w-full flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-4 text-left hover:bg-gray-50 hover:border-gray-300 transition-colors min-h-[56px]"
          @click="fileAs('trashed')"
        >
          <Icon name="delete" size="md" class="text-gray-400 mt-0.5" />
          <div>
            <span class="font-medium text-gray-900">Trash</span>
            <span class="block text-sm text-gray-500">Not needed — delete it</span>
          </div>
        </button>
      </div>
      <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 py-2" @click="step = 'actionable'">
        <Icon name="arrow_back" size="sm" /> Back
      </button>
    </div>

    <!-- Step: Is it a single action? -->
    <div v-if="step === 'singleAction'" class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900">Is it a single action or a project?</h2>
      <p class="text-sm text-gray-500">
        Will it take more than one step to complete?
      </p>
      <div class="flex gap-3">
        <button
          class="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-blue-200 bg-blue-50 px-6 py-4 text-base font-medium text-blue-700 hover:border-blue-400 hover:bg-blue-100 transition-colors min-h-[56px]"
          @click="step = 'configureAction'"
        >
          <Icon name="task_alt" size="md" />
          Single action
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-gray-50 px-6 py-4 text-base font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-100 transition-colors min-h-[56px]"
          @click="step = 'createProject'"
        >
          <Icon name="folder_open" size="md" />
          It's a project
        </button>
      </div>
      <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 py-2" @click="step = 'actionable'">
        <Icon name="arrow_back" size="sm" /> Back
      </button>
    </div>

    <!-- Step: Create project -->
    <div v-if="step === 'createProject'" class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900">Define the project</h2>
      <p class="text-sm text-gray-500">What does the successful outcome look like?</p>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Project title</label>
          <input
            v-model="projectTitle"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Desired outcome</label>
          <textarea
            v-model="projectOutcome"
            rows="2"
            placeholder="Describe what 'done' looks like..."
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">What's the first next action?</label>
          <input
            v-model="firstActionTitle"
            type="text"
            placeholder="The very next physical action..."
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contexts</label>
          <ContextSelector v-model="selectedContexts" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <TagSelector v-model="selectedTags" />
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select
              v-model="selectedDuration"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option :value="null">No estimate</option>
              <option value="5min">5 minutes</option>
              <option value="15min">15 minutes</option>
              <option value="30min">30 minutes</option>
              <option value="1h">1 hour</option>
              <option value="2h+">2+ hours</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Energy</label>
            <select
              v-model="selectedEnergy"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option :value="null">Any energy</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3 pt-4">
        <button
          :disabled="!projectTitle.trim() || !firstActionTitle.trim()"
          class="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px]"
          @click="saveProject"
        >
          <Icon name="folder_open" size="md" />
          Create project
        </button>
        <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 py-2" @click="step = 'singleAction'">
          <Icon name="arrow_back" size="sm" /> Back
        </button>
      </div>
    </div>

    <!-- Step: Configure action (single action or after choosing delegation/calendar) -->
    <div v-if="step === 'configureAction'" class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900">What kind of action?</h2>
      <div class="space-y-3">
        <button
          class="w-full flex items-start gap-3 rounded-lg border-2 border-blue-200 bg-blue-50 px-4 py-4 text-left hover:bg-blue-100 hover:border-blue-300 transition-colors min-h-[56px]"
          @click="step = 'nextAction'"
        >
          <Icon name="arrow_forward" size="md" class="text-blue-600 mt-0.5" />
          <div>
            <span class="font-medium text-blue-800">Do it / Next Action</span>
            <span class="block text-sm text-blue-600">I'll do this myself — add to Next Actions list</span>
          </div>
        </button>
        <button
          class="w-full flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-4 text-left hover:bg-gray-50 hover:border-gray-300 transition-colors min-h-[56px]"
          @click="step = 'delegate'"
        >
          <Icon name="person" size="md" class="text-gray-400 mt-0.5" />
          <div>
            <span class="font-medium text-gray-900">Delegate it</span>
            <span class="block text-sm text-gray-500">Someone else needs to do this — add to Waiting For</span>
          </div>
        </button>
        <button
          class="w-full flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-4 text-left hover:bg-gray-50 hover:border-gray-300 transition-colors min-h-[56px]"
          @click="step = 'calendarAction'"
        >
          <Icon name="calendar_month" size="md" class="text-gray-400 mt-0.5" />
          <div>
            <span class="font-medium text-gray-900">Schedule it</span>
            <span class="block text-sm text-gray-500">Has a specific date — add to Calendar</span>
          </div>
        </button>
      </div>
      <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 py-2" @click="step = 'singleAction'">
        <Icon name="arrow_back" size="sm" /> Back
      </button>
    </div>

    <!-- Step: Next Action — assign contexts, tags, duration, energy -->
    <div v-if="step === 'nextAction'" class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900">Configure action</h2>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contexts</label>
          <p class="text-xs text-gray-400 mb-1">Where or with what tools can you do this?</p>
          <ContextSelector v-model="selectedContexts" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <TagSelector v-model="selectedTags" />
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select
              v-model="selectedDuration"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option :value="null">No estimate</option>
              <option value="5min">5 minutes</option>
              <option value="15min">15 minutes</option>
              <option value="30min">30 minutes</option>
              <option value="1h">1 hour</option>
              <option value="2h+">2+ hours</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Energy</label>
            <select
              v-model="selectedEnergy"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option :value="null">Any energy</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3 pt-4">
        <button
          class="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors min-h-[48px]"
          @click="saveAsNextAction"
        >
          <Icon name="arrow_forward" size="md" />
          Save as Next Action
        </button>
        <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 py-2" @click="step = 'configureAction'">
          <Icon name="arrow_back" size="sm" /> Back
        </button>
      </div>
    </div>

    <!-- Step: Delegate -->
    <div v-if="step === 'delegate'" class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900">Who are you delegating to?</h2>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Delegated to</label>
          <input
            v-model="delegatedTo"
            type="text"
            placeholder="Person or team name"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Follow up date</label>
          <input
            v-model="waitingForDate"
            type="date"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div class="flex items-center gap-3 pt-4">
        <button
          :disabled="!delegatedTo.trim()"
          class="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px]"
          @click="saveAsWaitingFor"
        >
          <Icon name="hourglass_empty" size="md" />
          Save to Waiting For
        </button>
        <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 py-2" @click="step = 'configureAction'">
          <Icon name="arrow_back" size="sm" /> Back
        </button>
      </div>
    </div>

    <!-- Step: Calendar action -->
    <div v-if="step === 'calendarAction'" class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900">When is it due?</h2>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Due date</label>
          <input
            v-model="dueDate"
            type="date"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contexts</label>
          <ContextSelector v-model="selectedContexts" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <TagSelector v-model="selectedTags" />
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select
              v-model="selectedDuration"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option :value="null">No estimate</option>
              <option value="5min">5 minutes</option>
              <option value="15min">15 minutes</option>
              <option value="30min">30 minutes</option>
              <option value="1h">1 hour</option>
              <option value="2h+">2+ hours</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Energy</label>
            <select
              v-model="selectedEnergy"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option :value="null">Any energy</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3 pt-4">
        <button
          :disabled="!dueDate"
          class="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px]"
          @click="saveAsCalendar"
        >
          <Icon name="calendar_month" size="md" />
          Save to Calendar
        </button>
        <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 py-2" @click="step = 'configureAction'">
          <Icon name="arrow_back" size="sm" /> Back
        </button>
      </div>
    </div>

    <!-- Cancel button (always visible) -->
    <div class="border-t border-gray-100 pt-4">
      <button
        class="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 py-2"
        @click="emit('cancel')"
      >
        <Icon name="close" size="sm" />
        Cancel — keep in inbox
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Item, ItemStatus, Duration, EnergyLevel } from '~/types'

const props = defineProps<{
  item: Item
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()
const router = useRouter()

type WizardStep =
  | 'actionable'
  | 'notActionable'
  | 'singleAction'
  | 'configureAction'
  | 'nextAction'
  | 'delegate'
  | 'calendarAction'
  | 'createProject'

const step = ref<WizardStep>('actionable')

// Form state
const selectedContexts = ref<string[]>([...props.item.contexts])
const selectedTags = ref<string[]>([...(props.item.tags ?? [])])
const selectedDuration = ref<Duration | null>(props.item.duration ?? null)
const selectedEnergy = ref<EnergyLevel | null>(props.item.energy ?? null)
const delegatedTo = ref('')
const waitingForDate = ref('')
const dueDate = ref('')
const projectTitle = ref(props.item.title)
const projectOutcome = ref('')
const firstActionTitle = ref('')

// Breadcrumbs
const breadcrumbs = computed(() => {
  const crumbs = ['Clarify']
  switch (step.value) {
    case 'actionable':
      crumbs.push('Actionable?')
      break
    case 'notActionable':
      crumbs.push('Not actionable', 'File as...')
      break
    case 'singleAction':
      crumbs.push('Actionable', 'Single or project?')
      break
    case 'configureAction':
      crumbs.push('Actionable', 'Single action', 'Type')
      break
    case 'nextAction':
      crumbs.push('Actionable', 'Next Action')
      break
    case 'delegate':
      crumbs.push('Actionable', 'Delegate')
      break
    case 'calendarAction':
      crumbs.push('Actionable', 'Calendar')
      break
    case 'createProject':
      crumbs.push('Actionable', 'Project')
      break
  }
  return crumbs
})

function fileAs(status: ItemStatus) {
  if (status === 'trashed') {
    itemsStore.trashItem(props.item.id)
  } else {
    itemsStore.updateItem(props.item.id, { status })
  }
  emit('done')
  router.push('/inbox')
}

function saveAsNextAction() {
  itemsStore.updateItem(props.item.id, {
    status: 'next',
    contexts: selectedContexts.value,
    tags: selectedTags.value,
    duration: selectedDuration.value,
    energy: selectedEnergy.value,
  })
  emit('done')
  router.push('/inbox')
}

function saveAsWaitingFor() {
  itemsStore.updateItem(props.item.id, {
    status: 'waiting',
    delegatedTo: delegatedTo.value.trim(),
    waitingForDate: waitingForDate.value || null,
  })
  emit('done')
  router.push('/inbox')
}

function saveAsCalendar() {
  itemsStore.updateItem(props.item.id, {
    status: 'calendar',
    dueDate: dueDate.value || null,
    contexts: selectedContexts.value,
    tags: selectedTags.value,
    duration: selectedDuration.value,
    energy: selectedEnergy.value,
  })
  emit('done')
  router.push('/inbox')
}

function saveProject() {
  const now = new Date().toISOString()
  const projectId = crypto.randomUUID()

  // Create project
  projectsStore.addProject({
    id: projectId,
    title: projectTitle.value.trim(),
    outcome: projectOutcome.value.trim(),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  })

  // Convert original inbox item to the first next action linked to the project
  itemsStore.updateItem(props.item.id, {
    title: firstActionTitle.value.trim(),
    status: 'next',
    projectId,
    contexts: selectedContexts.value,
    tags: selectedTags.value,
    duration: selectedDuration.value,
    energy: selectedEnergy.value,
  })

  emit('done')
  router.push('/inbox')
}
</script>
