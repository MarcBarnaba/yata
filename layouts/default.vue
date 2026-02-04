<template>
  <div class="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-50">
    <!-- Desktop sidebar -->
    <aside class="hidden md:flex md:w-60 lg:w-64 flex-shrink-0 bg-white border-r border-gray-200">
      <AppNav />
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto pb-16 md:pb-0">
      <div class="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>

    <!-- Mobile bottom nav -->
    <div class="fixed bottom-0 inset-x-0 md:hidden bg-white z-40">
      <MobileNav @open-menu="mobileMenuOpen = true" />
    </div>

    <!-- Mobile slide-out menu -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 bg-black/40 z-50 md:hidden"
          @click="mobileMenuOpen = false"
        />
      </Transition>
      <Transition name="slide">
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-xl md:hidden"
        >
          <AppNav />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 200ms ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 200ms ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
