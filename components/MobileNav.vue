<template>
  <nav class="relative flex items-center justify-around border-t border-gray-200 bg-white">
    <MobileNavLink to="/" icon="dashboard" label="Home" />
    <MobileNavLink to="/inbox" icon="inbox" label="Inbox" :badge="inboxCount" />

    <!-- Center FAB placeholder to maintain spacing -->
    <div class="w-16" />

    <MobileNavLink to="/next-actions" icon="arrow_forward" label="Actions" />
    <button
      class="flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[56px] px-2 py-1 text-gray-500"
      @click="$emit('open-menu')"
    >
      <Icon name="menu" size="lg" />
      <span class="text-[10px] font-medium">More</span>
    </button>

    <!-- Floating Action Button - positioned above the nav bar -->
    <button
      class="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 active:bg-blue-800 transition-colors"
      @click="$emit('open-capture')"
    >
      <Icon name="add" size="xl" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import MobileNavLink from '~/components/MobileNavLink.vue'

defineEmits<{
  'open-menu': []
  'open-capture': []
}>()

const itemsStore = useItemsStore()
const inboxCount = computed(() => itemsStore.inbox.length)
</script>
