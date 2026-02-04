export type ItemStatus =
  | 'inbox'
  | 'next'
  | 'waiting'
  | 'someday'
  | 'reference'
  | 'calendar'
  | 'done'
  | 'trashed'

export interface Item {
  id: string
  title: string
  notes: string
  createdAt: string // ISO datetime
  updatedAt: string // ISO datetime
  status: ItemStatus
  contexts: string[] // context IDs
  projectId: string | null
  dueDate: string | null // ISO date
  delegatedTo: string | null
  waitingForDate: string | null // ISO date
  completedAt: string | null // ISO datetime
}

export type ProjectStatus = 'active' | 'completed' | 'trashed'

export interface Project {
  id: string
  title: string
  outcome: string
  status: ProjectStatus
  createdAt: string // ISO datetime
  updatedAt: string // ISO datetime
}

export interface Context {
  id: string
  name: string
}

export interface ReviewStats {
  inboxCount: number
  nextActionsCount: number
  projectsCount: number
  projectsWithoutNextAction: number
  waitingForCount: number
  somedayCount: number
}

export interface WeeklyReview {
  id: string
  completedAt: string // ISO datetime
  stats: ReviewStats
}

export interface Settings {
  version: string
}

export interface ExportData {
  version: string
  exportedAt: string
  items: Item[]
  projects: Project[]
  contexts: Context[]
  reviews: WeeklyReview[]
  settings: Settings
}
