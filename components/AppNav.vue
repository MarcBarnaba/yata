<template>
  <nav class="flex flex-col h-full w-full">
    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
      <Transition name="fade">
        <NuxtLink
          v-if="!isCollapsed"
          to="/"
          class="text-xl font-bold text-gray-900 hover:text-blue-600"
        >
          GSD
        </NuxtLink>
      </Transition>
      <button
        v-if="!forceExpanded"
        class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        :class="{ 'mx-auto': isCollapsed }"
        :title="isCollapsed ? 'Expand navigation' : 'Collapse navigation'"
        @click="settingsStore.toggleNavCollapsed()"
      >
        <Icon :name="isCollapsed ? 'chevron_right' : 'chevron_left'" size="md" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto py-2">
      <div class="px-2 space-y-0.5">
        <NavLink to="/" icon="dashboard" label="Dashboard" :collapsed="isCollapsed" />
        <NavLink to="/inbox" icon="inbox" label="Inbox" :badge="inboxCount" :collapsed="isCollapsed" />
      </div>

      <Transition name="fade">
        <div v-if="!isCollapsed" class="mt-4 px-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</span>
        </div>
      </Transition>
      <div class="mt-1 px-2 space-y-0.5" :class="{ 'mt-4': isCollapsed }">
        <NavLink to="/next-actions" icon="arrow_forward" label="Next Actions" :collapsed="isCollapsed" />
        <NavLink to="/waiting-for" icon="hourglass_empty" label="Waiting For" :collapsed="isCollapsed" />
        <NavLink to="/calendar" icon="calendar_month" label="Calendar" :collapsed="isCollapsed" />
      </div>

      <Transition name="fade">
        <div v-if="!isCollapsed" class="mt-4 px-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Organize</span>
        </div>
      </Transition>
      <div class="mt-1 px-2 space-y-0.5" :class="{ 'mt-4': isCollapsed }">
        <NavLink to="/projects" icon="folder" label="Projects" :collapsed="isCollapsed" />
        <NavLink to="/someday" icon="lightbulb" label="Someday / Maybe" :collapsed="isCollapsed" />
        <NavLink to="/reference" icon="description" label="Reference" :collapsed="isCollapsed" />
      </div>

      <Transition name="fade">
        <div v-if="!isCollapsed" class="mt-4 px-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Review</span>
        </div>
      </Transition>
      <div class="mt-1 px-2 space-y-0.5" :class="{ 'mt-4': isCollapsed }">
        <NavLink to="/review" icon="checklist" label="Weekly Review" :collapsed="isCollapsed" />
      </div>

      <Transition name="fade">
        <div v-if="!isCollapsed" class="mt-4 px-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Archive</span>
        </div>
      </Transition>
      <div class="mt-1 px-2 space-y-0.5" :class="{ 'mt-4': isCollapsed }">
        <NavLink to="/completed" icon="check_circle" label="Completed" :collapsed="isCollapsed" />
        <NavLink to="/trash" icon="delete" label="Trash" :badge="trashedCount" :collapsed="isCollapsed" />
      </div>
    </div>

    <div class="border-t border-gray-200 py-2 px-2">
      <NavLink to="/settings" icon="settings" label="Settings" :collapsed="isCollapsed" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import NavLink from '~/components/NavLink.vue'

const props = defineProps<{
  forceExpanded?: boolean
}>()

const itemsStore = useItemsStore()
const settingsStore = useSettingsStore()

const inboxCount = computed(() => itemsStore.inbox.length)
const trashedCount = computed(() => itemsStore.trashed.length)
const isCollapsed = computed(() => props.forceExpanded ? false : settingsStore.navCollapsed)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
