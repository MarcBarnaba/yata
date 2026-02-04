<template>
  <div>
    <div v-if="!item" class="mt-8 text-center">
      <p class="text-gray-500">Item not found.</p>
      <NuxtLink to="/inbox" class="mt-2 inline-block text-sm text-blue-600 hover:underline">
        Back to Inbox
      </NuxtLink>
    </div>

    <div v-else>
      <div class="flex items-center gap-2 mb-4">
        <NuxtLink to="/inbox" class="text-sm text-gray-500 hover:text-gray-700">
          &larr; Inbox
        </NuxtLink>
      </div>

      <h1 class="text-2xl font-bold text-gray-900">Process Item</h1>
      <p class="mt-1 text-sm text-gray-500">Clarify: "{{ item.title }}"</p>

      <!-- Clarify wizard will be implemented in STORY-004 -->
      <div class="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <p class="text-gray-500">The guided clarify wizard will appear here.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const itemsStore = useItemsStore()

const item = computed(() => {
  const id = route.params.id as string
  return itemsStore.getById(id)
})
</script>
