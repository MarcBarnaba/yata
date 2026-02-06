<template>
  <NuxtLink
    :to="to"
    class="relative flex items-center rounded-lg text-sm font-medium transition-colors min-h-[44px]"
    :class="[
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
      collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
    ]"
    :title="collapsed ? label : undefined"
  >
    <Icon :name="icon" size="md" class="flex-shrink-0" />
    <Transition name="fade">
      <span v-if="!collapsed" class="flex-1">{{ label }}</span>
    </Transition>
    <span
      v-if="badge && badge > 0 && !collapsed"
      class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
    >
      {{ badge }}
    </span>
    <span
      v-if="badge && badge > 0 && collapsed"
      class="absolute top-0.5 right-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold bg-blue-600 text-white"
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
  collapsed?: boolean
}>()

const route = useRoute()

const isActive = computed(() => {
  if (props.to === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(props.to)
})
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
