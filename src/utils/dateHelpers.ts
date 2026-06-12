import type { ActivityLog } from '../logic/carbonCalculator'

/**
 * Formats YYYY-MM-DD into a readable short date like "Jun 12" or relative "Today"/"Yesterday"
 */
export function formatFriendlyDate(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0]
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().split('T')[0]

  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Returns an array of the last N dates in YYYY-MM-DD format
 */
export function getLastDays(n: number): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

/**
 * Calculates current streak (consecutive days with at least one log, starting today/yesterday)
 */
export function calculateStreak(logs: ActivityLog[]): number {
  if (logs.length === 0) return 0

  const logDates = new Set(logs.map((l) => l.date))
  const today = new Date().toISOString().split('T')[0]
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().split('T')[0]

  // If there are no logs for today and no logs for yesterday, the streak is broken (0)
  if (!logDates.has(today) && !logDates.has(yesterday)) {
    return 0
  }

  let streak = 0
  const checkDate = logDates.has(today) ? new Date() : yesterdayDate

  while (true) {
    const checkDateString = checkDate.toISOString().split('T')[0]
    if (logDates.has(checkDateString)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
