<template>
  <NuxtLink
    :to="to"
    class="relative flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[56px] px-2 py-1 transition-colors"
    :class="isActive ? 'text-blue-600' : 'text-gray-500'"
  >
    <Icon :name="icon" size="lg" />
    <span class="text-[10px] font-medium">{{ label }}</span>
    <span
      v-if="badge && badge > 0"
      class="absolute top-1 right-2 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold bg-blue-600 text-white"
    >
      {{ badge }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  to: string
  icon: string
  label: string
  badge?: number
}>()

const route = useRoute()

const isActive = computed(() => {
  if (props.to === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(props.to)
})
</script>
