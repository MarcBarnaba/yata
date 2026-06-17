import type { Item } from '~/types'

/**
 * Builds a complete Item from a partial, filling every field with a sensible
 * default. Use for all new item creation so adding a field stays a one-place
 * change. Pass at least a `title`; override any other field via `partial`.
 */
export function makeItem(partial: Partial<Item> & { title: string }): Item {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title: partial.title,
    notes: '',
    createdAt: now,
    updatedAt: now,
    status: 'inbox',
    contexts: [],
    tags: [],
    projectId: null,
    parentId: null,
    calendarId: null,
    dueDate: null,
    delegatedTo: null,
    waitingForDate: null,
    completedAt: null,
    previousStatus: null,
    duration: null,
    energy: null,
    ...partial,
  }
}
