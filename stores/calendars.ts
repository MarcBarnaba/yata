import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Calendar } from '~/types'
import { persistence } from '~/adapters'

const STORAGE_KEY = 'calendars'

const DEFAULT_CALENDARS: Calendar[] = [
  { id: 'cal-agricoltura', name: 'Agricoltura', color: '#16a34a' },
  { id: 'cal-burocrazia', name: 'Burocrazia', color: '#d97706' },
  { id: 'cal-scadenze', name: 'Scadenze', color: '#dc2626' },
]

export const useCalendarsStore = defineStore('calendars', () => {
  const stored = persistence.load<Calendar[]>(STORAGE_KEY)
  const calendars = ref<Calendar[]>(stored ?? DEFAULT_CALENDARS)

  // Seed defaults on first launch
  if (!stored) {
    persistence.save(STORAGE_KEY, calendars.value)
  }

  function persist() {
    persistence.save(STORAGE_KEY, calendars.value)
  }

  function getById(id: string): Calendar | undefined {
    return calendars.value.find((c) => c.id === id)
  }

  function addCalendar(calendar: Calendar) {
    calendars.value.push(calendar)
    persist()
  }

  function updateCalendar(id: string, updates: Partial<Omit<Calendar, 'id'>>) {
    const index = calendars.value.findIndex((c) => c.id === id)
    if (index === -1) return
    calendars.value[index] = { ...calendars.value[index], ...updates }
    persist()
  }

  function removeCalendar(id: string) {
    calendars.value = calendars.value.filter((c) => c.id !== id)
    persist()
  }

  function setCalendars(newCalendars: Calendar[]) {
    calendars.value = newCalendars
    persist()
  }

  return {
    calendars,
    getById,
    addCalendar,
    updateCalendar,
    removeCalendar,
    setCalendars,
  }
})
