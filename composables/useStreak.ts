/**
 * A simple motivation streak: the number of consecutive days (ending today or
 * yesterday) on which at least one item was completed. Derived entirely from
 * `completedAt` timestamps, so it needs no extra storage and syncs for free.
 */
export function useStreak() {
  const itemsStore = useItemsStore()

  function localKey(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }

  // Distinct local days on which something was completed.
  const activeDays = computed(() => {
    const days = new Set<string>()
    for (const item of itemsStore.items) {
      if (item.status === 'done' && item.completedAt) {
        days.add(localKey(new Date(item.completedAt)))
      }
    }
    return days
  })

  const todayDone = computed(() => activeDays.value.has(localKey(new Date())))

  const current = computed(() => {
    const days = activeDays.value
    const cursor = new Date()
    // If nothing done today yet, the streak can still be alive from yesterday.
    if (!days.has(localKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1)
      if (!days.has(localKey(cursor))) return 0
    }
    let count = 0
    while (days.has(localKey(cursor))) {
      count++
      cursor.setDate(cursor.getDate() - 1)
    }
    return count
  })

  return { current, todayDone }
}
