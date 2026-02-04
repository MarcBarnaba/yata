import type { PersistenceAdapter } from './persistence'

const KEY_PREFIX = 'gsd:'

export class LocalStorageAdapter implements PersistenceAdapter {
  load<T>(key: string): T | null {
    const raw = localStorage.getItem(KEY_PREFIX + key)
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  save<T>(key: string, data: T): void {
    localStorage.setItem(KEY_PREFIX + key, JSON.stringify(data))
  }

  remove(key: string): void {
    localStorage.removeItem(KEY_PREFIX + key)
  }

  clear(): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(KEY_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }
}
