<template>
  <nav class="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white px-2 py-1.5 shadow-lg">
    <MobileNavLink to="/today" icon="today" label="Today" />
    <MobileNavLink to="/inbox" icon="inbox" label="Inbox" :badge="inboxCount" />

    <!-- Capture (center, prominent) -->
    <button
      class="mx-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-transform hover:bg-blue-700 active:scale-95"
      aria-label="Capture"
      @click="$emit('open-capture')"
    >
      <Icon name="add" size="xl" />
    </button>

    <MobileNavLink to="/next-actions" icon="arrow_forward" label="Next" />

    <button
      class="flex min-h-[60px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-gray-500"
      @click="$emit('open-menu')"
    >
      <Icon name="menu" size="lg" />
      <span class="text-[10px] font-medium">More</span>
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
