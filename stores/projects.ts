import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project, ProjectStatus } from '~/types'
import { LocalStorageAdapter } from '~/adapters/localStorage'

const persistence = new LocalStorageAdapter()
const STORAGE_KEY = 'projects'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>(persistence.load<Project[]>(STORAGE_KEY) ?? [])

  function persist() {
    persistence.save(STORAGE_KEY, projects.value)
  }

  // Getters
  const active = computed(() => projects.value.filter((p) => p.status === 'active'))
  const completed = computed(() => projects.value.filter((p) => p.status === 'completed'))

  function getById(id: string): Project | undefined {
    return projects.value.find((p) => p.id === id)
  }

  // Actions
  function addProject(project: Project) {
    projects.value.push(project)
    persist()
  }

  function updateProject(id: string, updates: Partial<Omit<Project, 'id'>>) {
    const index = projects.value.findIndex((p) => p.id === id)
    if (index === -1) return
    projects.value[index] = {
      ...projects.value[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    persist()
  }

  function removeProject(id: string) {
    projects.value = projects.value.filter((p) => p.id !== id)
    persist()
  }

  function setProjects(newProjects: Project[]) {
    projects.value = newProjects
    persist()
  }

  return {
    projects,
    active,
    completed,
    getById,
    addProject,
    updateProject,
    removeProject,
    setProjects,
  }
})
