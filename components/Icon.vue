<template>
  <span
    class="material-symbols-rounded"
    :class="sizeClass"
    :style="{ fontSize: customSize }"
  >{{ name }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
}>()

const sizeClass = computed(() => {
  if (typeof props.size === 'number') return ''
  const sizes: Record<string, string> = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }
  return sizes[props.size ?? 'md'] || sizes.md
})

const customSize = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`
  return undefined
})
</script>

<style scoped>
.material-symbols-rounded {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
  vertical-align: middle;
  line-height: 1;
}
</style>
