export type ItemStatus =
  | 'inbox'
  | 'next'
  | 'waiting'
  | 'someday'
  | 'reference'
  | 'calendar'
  | 'done'
  | 'trashed'

export type Duration = '5min' | '15min' | '30min' | '1h' | '2h+'

export type EnergyLevel = 'low' | 'medium' | 'high'

export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly'

export interface Recurrence {
  freq: RecurrenceFreq
  interval: number // repeat every N days/weeks/months (>= 1)
}

export interface Item {
  id: string
  title: string
  notes: string
  createdAt: string // ISO datetime
  updatedAt: string // ISO datetime
  status: ItemStatus
  contexts: string[] // context IDs
  tags: string[] // tag IDs
  projectId: string | null
  parentId: string | null // subtask: id of the parent item
  calendarId: string | null // calendar set id
  dueDate: string | null // ISO date
  delegatedTo: string | null
  waitingForDate: string | null // ISO date
  completedAt: string | null // ISO datetime
  previousStatus: ItemStatus | null // status before trashing, for undo
  duration: Duration | null
  energy: EnergyLevel | null
  recurrence: Recurrence | null // routine: regenerate on completion
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

export interface Tag {
  id: string
  name: string
}

export interface Calendar {
  id: string
  name: string
  color: string // hex, e.g. #16a34a
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

export type ThemePref = 'light' | 'dark' | 'system'

export interface Settings {
  version: string
  navCollapsed?: boolean
  calendarView?: 'week' | 'month'
  theme?: ThemePref
}

export interface ExportData {
  version: string
  exportedAt: string
  items: Item[]
  projects: Project[]
  contexts: Context[]
  tags: Tag[]
  calendars: Calendar[]
  reviews: WeeklyReview[]
  settings: Settings
}
