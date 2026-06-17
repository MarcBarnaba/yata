import type { Item } from '~/types'

// Escapes a text value per RFC 5545 (TEXT type).
function escapeICS(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// Folds a content line at 75 octets with a leading-space continuation (RFC 5545).
function fold(line: string): string {
  if (line.length <= 75) return line
  const parts: string[] = []
  let rest = line
  while (rest.length > 75) {
    parts.push(rest.slice(0, 75))
    rest = ' ' + rest.slice(75)
  }
  parts.push(rest)
  return parts.join('\r\n')
}

// 'YYYY-MM-DD...' -> 'YYYYMMDD'
function icsDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '')
}

// All-day DTEND is exclusive, so use the day after the due date.
// Uses UTC arithmetic to stay timezone-safe (no off-by-one across DST/offsets).
function icsDatePlusOne(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}`
}

function icsStamp(): string {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Builds an iCalendar (.ics) document of all-day events from dated items.
 * `calName` becomes the calendar's display name in the importing app.
 */
export function itemsToICS(items: Item[], calName: string): string {
  const stamp = icsStamp()
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GSD//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    fold(`X-WR-CALNAME:${escapeICS(calName)}`),
  ]

  for (const item of items) {
    if (!item.dueDate) continue
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${item.id}@gsd`)
    lines.push(`DTSTAMP:${stamp}`)
    lines.push(`DTSTART;VALUE=DATE:${icsDate(item.dueDate)}`)
    lines.push(`DTEND;VALUE=DATE:${icsDatePlusOne(item.dueDate)}`)
    lines.push(fold(`SUMMARY:${escapeICS(item.title)}`))
    if (item.notes) lines.push(fold(`DESCRIPTION:${escapeICS(item.notes)}`))
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadICS(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
