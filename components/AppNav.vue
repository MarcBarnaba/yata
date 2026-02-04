<template>
  <nav class="flex flex-col h-full">
    <div class="p-4 border-b border-gray-200">
      <NuxtLink to="/" class="text-xl font-bold text-gray-900 hover:text-blue-600">
        GSD
      </NuxtLink>
    </div>

    <div class="flex-1 overflow-y-auto py-2">
      <div class="px-2 space-y-0.5">
        <NavLink to="/" icon="□" label="Dashboard" />
        <NavLink to="/inbox" icon="↓" label="Inbox" :badge="inboxCount" />
      </div>

      <div class="mt-4 px-3">
        <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</span>
      </div>
      <div class="mt-1 px-2 space-y-0.5">
        <NavLink to="/next-actions" icon="→" label="Next Actions" />
        <NavLink to="/waiting-for" icon="⏳" label="Waiting For" />
        <NavLink to="/calendar" icon="📅" label="Calendar" />
      </div>

      <div class="mt-4 px-3">
        <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Organize</span>
      </div>
      <div class="mt-1 px-2 space-y-0.5">
        <NavLink to="/projects" icon="▸" label="Projects" />
        <NavLink to="/someday" icon="💭" label="Someday / Maybe" />
        <NavLink to="/reference" icon="📁" label="Reference" />
      </div>

      <div class="mt-4 px-3">
        <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Review</span>
      </div>
      <div class="mt-1 px-2 space-y-0.5">
        <NavLink to="/review" icon="✓" label="Weekly Review" />
      </div>
    </div>

    <div class="border-t border-gray-200 py-2 px-2">
      <NavLink to="/settings" icon="⚙" label="Settings" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import NavLink from '~/components/NavLink.vue'

const itemsStore = useItemsStore()
const inboxCount = computed(() => itemsStore.inbox.length)
</script>
