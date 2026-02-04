<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="ctx in contextsStore.contexts"
      :key="ctx.id"
      type="button"
      class="rounded-full px-3 py-1 text-sm font-medium transition-colors"
      :class="isSelected(ctx.id)
        ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      @click="toggle(ctx.id)"
    >
      {{ ctx.name }}
    </button>
    <span v-if="contextsStore.contexts.length === 0" class="text-sm text-gray-400">
      No contexts available
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const contextsStore = useContextsStore()

function isSelected(id: string): boolean {
  return props.modelValue.includes(id)
}

function toggle(id: string) {
  if (isSelected(id)) {
    emit('update:modelValue', props.modelValue.filter((c) => c !== id))
  } else {
    emit('update:modelValue', [...props.modelValue, id])
  }
}
</script>
