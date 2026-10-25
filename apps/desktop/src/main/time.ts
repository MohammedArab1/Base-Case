/** Local-calendar helpers. Reviews and streaks follow the user's day, not UTC. */
export function startOfLocalDay(now: Date): Date {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  return start
}

export function localDayKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Counts consecutive days ending today that contain at least one entry. */
export function streakLength(days: ReadonlySet<string>, now: Date): number {
  let streak = 0
  const cursor = new Date(now)
  cursor.setHours(0, 0, 0, 0)

  while (days.has(localDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
