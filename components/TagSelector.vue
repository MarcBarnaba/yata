<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="tag in tagsStore.tags"
      :key="tag.id"
      type="button"
      class="rounded-full px-3 py-1 text-sm font-medium transition-colors"
      :class="isSelected(tag.id)
        ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      @click="toggle(tag.id)"
    >
      {{ tag.name }}
    </button>
    <span v-if="tagsStore.tags.length === 0" class="text-sm text-gray-400">
      No tags available
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

const tagsStore = useTagsStore()

function isSelected(id: string): boolean {
  return props.modelValue.includes(id)
}

function toggle(id: string) {
  if (isSelected(id)) {
    emit('update:modelValue', props.modelValue.filter((t) => t !== id))
  } else {
    emit('update:modelValue', [...props.modelValue, id])
  }
}
</script>
