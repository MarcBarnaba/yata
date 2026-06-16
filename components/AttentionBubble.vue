<template>
  <NuxtLink
    :to="bubble.to"
    class="group flex items-start gap-3 rounded-2xl border p-4 transition-colors min-h-[44px]"
    :class="[toneClass, sizeClass]"
  >
    <span
      class="flex items-center justify-center rounded-full flex-shrink-0"
      :class="[iconWrapClass, iconWrapSizeClass]"
    >
      <Icon :name="bubble.icon" :size="bubble.size" />
    </span>

    <div class="flex-1 min-w-0">
      <p class="font-semibold truncate" :class="titleSizeClass">{{ bubble.title }}</p>
      <p v-if="bubble.subtitle" class="text-sm opacity-70 truncate mt-0.5">
        {{ bubble.subtitle }}
      </p>
    </div>

    <span
      v-if="bubble.count"
      class="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold flex-shrink-0"
      :class="badgeClass"
    >
      {{ bubble.count }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { AttentionBubble, BubbleTone, BubbleSize } from '~/composables/useAttention'

const props = defineProps<{ bubble: AttentionBubble }>()

// Full literal class strings so Tailwind's JIT can detect them.
const toneClasses: Record<BubbleTone, string> = {
  red: 'border-red-200 bg-red-50 hover:bg-red-100 text-red-900',
  amber: 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900',
  purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900',
  green: 'border-green-200 bg-green-50 hover:bg-green-100 text-green-900',
  indigo: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900',
  blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900',
  gray: 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900',
}

const iconWrapClasses: Record<BubbleTone, string> = {
  red: 'bg-red-100 text-red-600',
  amber: 'bg-amber-100 text-amber-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
}

const badgeClasses: Record<BubbleTone, string> = {
  red: 'bg-red-200 text-red-800',
  amber: 'bg-amber-200 text-amber-800',
  purple: 'bg-purple-200 text-purple-800',
  green: 'bg-green-200 text-green-800',
  indigo: 'bg-indigo-200 text-indigo-800',
  blue: 'bg-blue-200 text-blue-800',
  gray: 'bg-gray-200 text-gray-700',
}

const sizeClasses: Record<BubbleSize, string> = {
  lg: 'flex-[2_1_280px]',
  md: 'flex-[1_1_220px]',
  sm: 'flex-[1_1_160px]',
}

const iconWrapSizeClasses: Record<BubbleSize, string> = {
  lg: 'w-12 h-12',
  md: 'w-10 h-10',
  sm: 'w-9 h-9',
}

const titleSizeClasses: Record<BubbleSize, string> = {
  lg: 'text-lg',
  md: 'text-base',
  sm: 'text-sm',
}

const toneClass = computed(() => toneClasses[props.bubble.tone])
const iconWrapClass = computed(() => iconWrapClasses[props.bubble.tone])
const badgeClass = computed(() => badgeClasses[props.bubble.tone])
const sizeClass = computed(() => sizeClasses[props.bubble.size])
const iconWrapSizeClass = computed(() => iconWrapSizeClasses[props.bubble.size])
const titleSizeClass = computed(() => titleSizeClasses[props.bubble.size])
</script>
