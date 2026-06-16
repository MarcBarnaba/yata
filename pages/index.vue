<template>
  <div>
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div class="flex items-center gap-2 text-sm">
        <Icon :name="healthIcon" size="sm" :class="healthTextClass" />
        <span :class="healthTextClass" class="hidden sm:inline">{{ healthLabel }}</span>
      </div>
    </div>

    <!-- Attention canvas: auto-organized bubbles, biggest/most-urgent first -->
    <TransitionGroup
      v-if="bubbles.length"
      name="bubble"
      tag="div"
      class="mt-6 flex flex-wrap items-stretch gap-3"
    >
      <AttentionBubble v-for="bubble in bubbles" :key="bubble.id" :bubble="bubble" />
    </TransitionGroup>

    <!-- All clear -->
    <div
      v-else
      class="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center"
    >
      <div class="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
        <Icon name="check_circle" size="xl" class="text-green-600" />
      </div>
      <p class="mt-4 text-lg font-semibold text-gray-900">All clear</p>
      <p class="mt-1 text-sm text-gray-500">Nothing needs your attention right now.</p>
      <NuxtLink to="/inbox" class="mt-4 text-sm text-blue-600 hover:text-blue-700">
        Capture something new
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { bubbles } = useAttention()

// Lightweight health summary derived from the canvas itself.
const healthLevel = computed<'green' | 'yellow' | 'red'>(() => {
  if (!bubbles.value.length) return 'green'
  return bubbles.value.some((b) => b.tone === 'red') ? 'red' : 'yellow'
})

const healthIcon = computed(() => {
  if (healthLevel.value === 'green') return 'check_circle'
  if (healthLevel.value === 'yellow') return 'info'
  return 'warning'
})

const healthTextClass = computed(() => {
  if (healthLevel.value === 'green') return 'text-green-600'
  if (healthLevel.value === 'yellow') return 'text-amber-600'
  return 'text-red-600'
})

const healthLabel = computed(() => {
  if (healthLevel.value === 'green') return 'All clear'
  const n = bubbles.value.length
  return `${n} thing${n > 1 ? 's' : ''} need${n > 1 ? '' : 's'} attention`
})
</script>

<style scoped>
.bubble-move {
  transition: transform 300ms ease;
}
.bubble-enter-active {
  transition: opacity 250ms ease, transform 250ms ease;
}
.bubble-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
