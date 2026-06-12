import { calculateActivityCarbon } from './carbonEngine'

export interface ActivityLog {
  id: string
  date: string // YYYY-MM-DD
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'waste'
  subCategoryId: string
  subCategoryName: string
  amount: number
  calculatedCarbon: number
  notes?: string
}

/**
 * Calculates carbon footprint in kg CO2e for a given category and option
 */
export function calculateCarbon(
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'waste',
  subCategoryId: string,
  amount: number
): number {
  return calculateActivityCarbon(category, subCategoryId, amount)
}

/**
 * Groups logs by date and sums the carbon emissions
 */
export function getDailyTotals(logs: ActivityLog[]): { [date: string]: number } {
  return logs.reduce((acc, log) => {
    acc[log.date] = (acc[log.date] || 0) + log.calculatedCarbon
    // Round to 2 decimals
    acc[log.date] = Math.round(acc[log.date] * 100) / 100
    return acc
  }, {} as { [date: string]: number })
}

/**
 * Groups logs by category and sums the carbon emissions
 */
export function getCategoryTotals(logs: ActivityLog[]): { [category: string]: number } {
  const totals = { transport: 0, food: 0, energy: 0, shopping: 0, waste: 0 }
  return logs.reduce((acc, log) => {
    if (log.category in acc) {
      acc[log.category] += log.calculatedCarbon
      acc[log.category] = Math.round(acc[log.category] * 100) / 100
    }
    return acc
  }, totals)
}
