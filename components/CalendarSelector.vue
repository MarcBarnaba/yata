<template>
  <div class="flex flex-wrap gap-2">
    <button
      type="button"
      class="rounded-full px-3 py-1 text-sm font-medium transition-colors"
      :class="modelValue === null
        ? 'bg-gray-200 text-gray-800 ring-1 ring-gray-300'
        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
      @click="emit('update:modelValue', null)"
    >
      None
    </button>
    <button
      v-for="cal in calendarsStore.calendars"
      :key="cal.id"
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors"
      :class="modelValue === cal.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      :style="modelValue === cal.id ? { backgroundColor: cal.color } : {}"
      @click="emit('update:modelValue', cal.id)"
    >
      <span
        class="h-2 w-2 rounded-full"
        :style="{ backgroundColor: modelValue === cal.id ? '#ffffff' : cal.color }"
      />
      {{ cal.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const calendarsStore = useCalendarsStore()
</script>
