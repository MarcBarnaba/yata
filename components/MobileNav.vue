<template>
  <nav class="flex items-center gap-1 rounded-full border border-white/60 bg-white/45 px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur-2xl backdrop-saturate-150 [-webkit-backdrop-filter:blur(24px)_saturate(1.5)] dark:border-white/10 dark:bg-slate-900/55 dark:ring-white/5">
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
