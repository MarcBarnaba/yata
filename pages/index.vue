<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
    <p class="mt-2 text-gray-500">Your GTD system at a glance.</p>
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
