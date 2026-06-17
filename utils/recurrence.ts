import type { Recurrence } from '~/types'

/**
 * Advances an ISO date string (YYYY-MM-DD...) by one recurrence step.
 * Uses UTC arithmetic to stay timezone-safe (no off-by-one across DST/offsets),
 * matching utils/ics.ts. Returns a YYYY-MM-DD string.
 */
export function advanceISODate(iso: string, rec: Recurrence): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const n = Math.max(1, rec.interval)
  switch (rec.freq) {
    case 'daily':
      dt.setUTCDate(dt.getUTCDate() + n)
      break
    case 'weekly':
      dt.setUTCDate(dt.getUTCDate() + n * 7)
      break
    case 'monthly':
      dt.setUTCMonth(dt.getUTCMonth() + n)
      break
  }
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`
}

const UNIT: Record<Recurrence['freq'], string> = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
}

/** Human label, e.g. "Daily", "Every 2 weeks". */
export function recurrenceLabel(rec: Recurrence): string {
  const n = Math.max(1, rec.interval)
  if (n === 1) {
    return { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }[rec.freq]
  }
  return `Every ${n} ${UNIT[rec.freq]}s`
}
