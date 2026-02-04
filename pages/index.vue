<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold">GSD - Get Stuff Done</h1>
    <p class="mt-2 text-gray-600">Dashboard coming soon.</p>
    <div class="mt-4 text-sm text-gray-500">
      <p>Items: {{ itemsStore.items.length }}</p>
      <p>Projects: {{ projectsStore.projects.length }}</p>
      <p>Contexts: {{ contextsStore.contexts.length }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const itemsStore = useItemsStore()
const projectsStore = useProjectsStore()
const contextsStore = useContextsStore()
</script>
