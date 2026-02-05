<template>
  <nav class="flex items-center justify-around border-t border-gray-200 bg-white">
    <MobileNavLink to="/" icon="dashboard" label="Home" />
    <MobileNavLink to="/inbox" icon="inbox" label="Inbox" :badge="inboxCount" />
    <MobileNavLink to="/next-actions" icon="arrow_forward" label="Actions" />
    <MobileNavLink to="/projects" icon="folder" label="Projects" />
    <button
      class="flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[56px] px-2 py-1 text-gray-500"
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
}>()

const itemsStore = useItemsStore()
const inboxCount = computed(() => itemsStore.inbox.length)
</script>
