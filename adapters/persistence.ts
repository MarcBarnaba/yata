export interface PersistenceAdapter {
  load<T>(key: string): T | null
  save<T>(key: string, data: T): void
  remove(key: string): void
  clear(): void
}
