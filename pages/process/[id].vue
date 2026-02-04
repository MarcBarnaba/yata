<template>
  <div>
    <div v-if="!item" class="mt-8 text-center">
      <p class="text-gray-500">Item not found.</p>
      <NuxtLink to="/inbox" class="mt-2 inline-block text-sm text-blue-600 hover:underline">
        Back to Inbox
      </NuxtLink>
    </div>

    <div v-else-if="item.status !== 'inbox'" class="mt-8 text-center">
      <p class="text-gray-500">This item has already been processed.</p>
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

      <h1 class="text-xl font-bold text-gray-900">{{ item.title }}</h1>
      <p v-if="item.notes" class="mt-1 text-sm text-gray-500">{{ item.notes }}</p>

      <div class="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <ClarifyWizard
          :item="item"
          @done="onDone"
          @cancel="router.push('/inbox')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const itemsStore = useItemsStore()

const item = computed(() => {
  const id = route.params.id as string
  return itemsStore.getById(id)
})

function onDone() {
  // Navigation handled by ClarifyWizard
}
</script>
