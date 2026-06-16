import type { Project } from '~/types'

export type BubbleTone = 'red' | 'amber' | 'purple' | 'green' | 'indigo' | 'blue' | 'gray'
export type BubbleSize = 'lg' | 'md' | 'sm'
export type BubbleKind =
  | 'overdue'
  | 'dueSoon'
  | 'datedOverflow'
  | 'waiting'
  | 'staleProject'
  | 'staleOverflow'
  | 'review'
  | 'inbox'
  | 'quickWin'
  | 'dream'

export interface AttentionBubble {
  id: string
  kind: BubbleKind
  title: string
  subtitle?: string
  count?: number
  icon: string
  tone: BubbleTone
  size: BubbleSize
  score: number
  to: string
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

// Whole calendar-days between today (start of day) and an ISO date.
// Negative = in the past, 0 = today, positive = in the future.
function daysUntil(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  if (Number.isNaN(target.getTime())) return Infinity
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY)
}

function sizeForScore(score: number): BubbleSize {
  if (score >= 70) return 'lg'
  if (score >= 35) return 'md'
  return 'sm'
}

const MAX_DATED = 6
const MAX_STALE = 3
const MAX_WAITING = 3

/**
 * Derives the "attention canvas" — a list of bubbles, each representing
 * something that needs the user's attention now, ranked by urgency.
 * Computed entirely from existing item/project/review fields (no schema change).
 */
export function useAttention() {
  const itemsStore = useItemsStore()
  const projectsStore = useProjectsStore()
  const reviewsStore = useReviewsStore()

  // Active projects without a 'next' action — same rule as the legacy dashboard.
  const staleProjects = computed<Project[]>(() =>
    projectsStore.active.filter(
      (p) => !itemsStore.byProject(p.id).some((i) => i.status === 'next'),
    ),
  )

  const reviewOverdue = computed(() => {
    const last = reviewsStore.lastReview
    if (!last) return true
    return daysUntil(last.completedAt) < -7
  })

  const lastReviewLabel = computed(() => {
    const last = reviewsStore.lastReview
    if (!last) return 'Never done'
    const days = -daysUntil(last.completedAt)
    if (days <= 0) return 'Done today'
    if (days === 1) return 'Done yesterday'
    return `${days} days ago`
  })

  const bubbles = computed<AttentionBubble[]>(() => {
    const out: AttentionBubble[] = []

    // --- Dated items: overdue + due within 3 days ---
    const dated = itemsStore.items
      .filter((i) => i.dueDate && i.status !== 'done' && i.status !== 'trashed')
      .map((i) => ({ item: i, d: daysUntil(i.dueDate as string) }))
      .filter(({ d }) => d <= 3)
      .sort((a, b) => a.d - b.d)
      .map(({ item, d }): AttentionBubble => {
        if (d < 0) {
          const overdueBy = -d
          const score = 100 + Math.min(overdueBy, 30)
          return {
            id: `overdue:${item.id}`,
            kind: 'overdue',
            title: item.title,
            subtitle: overdueBy === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueBy} days`,
            icon: 'event_busy',
            tone: 'red',
            size: sizeForScore(score),
            score,
            to: '/calendar',
          }
        }
        const score = 70 - d * 10
        return {
          id: `due:${item.id}`,
          kind: 'dueSoon',
          title: item.title,
          subtitle: d === 0 ? 'Due today' : d === 1 ? 'Due tomorrow' : `Due in ${d} days`,
          icon: 'schedule',
          tone: 'amber',
          size: sizeForScore(score),
          score,
          to: '/calendar',
        }
      })

    out.push(...dated.slice(0, MAX_DATED))
    const datedHidden = dated.length - MAX_DATED
    if (datedHidden > 0) {
      out.push({
        id: 'dated:overflow',
        kind: 'datedOverflow',
        title: `+${datedHidden} more scheduled`,
        subtitle: 'View calendar',
        icon: 'calendar_month',
        tone: 'amber',
        size: sizeForScore(32),
        score: 32,
        to: '/calendar',
      })
    }

    // --- Waiting-for follow-ups that are due ---
    itemsStore.waiting
      .filter((i) => i.waitingForDate && daysUntil(i.waitingForDate) <= 0)
      .slice(0, MAX_WAITING)
      .forEach((item) => {
        out.push({
          id: `waiting:${item.id}`,
          kind: 'waiting',
          title: item.title,
          subtitle: item.delegatedTo ? `Waiting on ${item.delegatedTo}` : 'Time to follow up',
          icon: 'hourglass_empty',
          tone: 'purple',
          size: sizeForScore(60),
          score: 60,
          to: '/waiting-for',
        })
      })

    // --- Stale projects ---
    const stale = staleProjects.value
    stale.slice(0, MAX_STALE).forEach((p) => {
      out.push({
        id: `stale:${p.id}`,
        kind: 'staleProject',
        title: p.title,
        subtitle: 'Needs a next action',
        icon: 'assignment_late',
        tone: 'amber',
        size: sizeForScore(50),
        score: 50,
        to: `/projects/${p.id}`,
      })
    })
    if (stale.length > MAX_STALE) {
      const hidden = stale.length - MAX_STALE
      out.push({
        id: 'stale:overflow',
        kind: 'staleOverflow',
        title: `+${hidden} project${hidden > 1 ? 's' : ''} need attention`,
        subtitle: 'Define a next action',
        icon: 'folder_special',
        tone: 'amber',
        size: sizeForScore(34),
        score: 34,
        to: '/projects',
      })
    }

    // --- Weekly review ---
    if (reviewOverdue.value) {
      out.push({
        id: 'review',
        kind: 'review',
        title: 'Weekly Review',
        subtitle: `${lastReviewLabel.value} — overdue`,
        icon: 'checklist',
        tone: 'red',
        size: sizeForScore(45),
        score: 45,
        to: '/review',
      })
    }

    // --- Inbox to process ---
    const inboxCount = itemsStore.inbox.length
    if (inboxCount > 0) {
      const score = 30 + Math.min(inboxCount, 10)
      out.push({
        id: 'inbox',
        kind: 'inbox',
        title: `${inboxCount} to process`,
        subtitle: 'Clear your inbox',
        count: inboxCount,
        icon: 'inbox',
        tone: 'amber',
        size: sizeForScore(score),
        score,
        to: '/inbox',
      })
    }

    // --- Quick wins (momentum) ---
    const quickWins = itemsStore.nextActions.filter(
      (i) => i.duration === '5min' || i.duration === '15min',
    )
    if (quickWins.length > 0) {
      out.push({
        id: 'quickwin',
        kind: 'quickWin',
        title: `${quickWins.length} quick win${quickWins.length > 1 ? 's' : ''}`,
        subtitle: 'Build momentum',
        count: quickWins.length,
        icon: 'bolt',
        tone: 'green',
        size: sizeForScore(20),
        score: 20,
        to: '/next-actions',
      })
    }

    // --- Dream nudge: bring a someday closer to reality ---
    const somedayCount = itemsStore.someday.length
    if (somedayCount > 0) {
      out.push({
        id: 'dream',
        kind: 'dream',
        title: 'Turn a someday into action',
        subtitle: `${somedayCount} in Someday/Maybe`,
        icon: 'lightbulb',
        tone: 'indigo',
        size: sizeForScore(10),
        score: 10,
        to: '/someday',
      })
    }

    return out.sort((a, b) => b.score - a.score)
  })

  return { bubbles }
}
