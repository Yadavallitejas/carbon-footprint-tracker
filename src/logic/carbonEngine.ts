import type { ActivityLog } from './carbonCalculator'
import { EMISSION_FACTORS, SUSTAINABLE_DAILY_TARGET } from '../data/emissionFactors'

export interface ComparisonResult {
  difference: number // kg CO2e difference (positive if over, negative if under)
  percentOfTarget: number // percent of the target used (0 to 100+)
  isOver: boolean // true if emissions exceeded the target
}

/**
 * Calculates the carbon footprint of a specific activity.
 * 
 * Formula: Carbon (kg CO2e) = Amount * Emission Factor (kg CO2e / unit)
 * 
 * For electricity, a custom grid factor (e.g. from regional settings) can override
 * the default global average grid factor.
 * 
 * @param category The high-level category: 'transport', 'food', 'energy', 'shopping', or 'waste'
 * @param subCategoryId The specific activity factor identifier (e.g., 'car_petrol')
 * @param amount The numerical value of consumption (e.g. km traveled, kWh used, meals consumed)
 * @param customGridFactor Optional custom electricity emission factor in kg CO2e/kWh (overrides default 0.38)
 * @returns Calculated emissions in kg CO2e, rounded to 2 decimal places
 */
export function calculateActivityCarbon(
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'waste',
  subCategoryId: string,
  amount: number,
  customGridFactor?: number
): number {
  if (amount <= 0) return 0

  const factors = EMISSION_FACTORS[category]
  if (!factors) return 0

  const factor = factors.find((f) => f.id === subCategoryId)
  if (!factor) return 0

  let coefficient = factor.value

  // Override grid factor for electricity if custom regional factor is specified
  if (category === 'energy' && subCategoryId === 'electricity' && typeof customGridFactor === 'number') {
    coefficient = customGridFactor
  }

  const result = coefficient * amount
  return Math.round(result * 100) / 100
}

/**
 * Calculates the total carbon footprint for a specific day.
 * 
 * Formula: Sum(calculatedCarbon) for all logs on that date
 * 
 * @param logs Array of all activity logs
 * @param date The date string to check in YYYY-MM-DD format
 * @returns Total daily emissions in kg CO2e
 */
export function calculateDailyTotal(logs: ActivityLog[], date: string): number {
  const dailyTotal = logs
    .filter((log) => log.date === date)
    .reduce((sum, log) => sum + log.calculatedCarbon, 0)
  return Math.round(dailyTotal * 100) / 100
}

/**
 * Calculates aggregate emissions over a custom date range (inclusive).
 * 
 * Formula: Sum(calculatedCarbon) for all logs matching dates between start and end inclusive
 * 
 * @param logs Array of all activity logs
 * @param startDate Start date string in YYYY-MM-DD format
 * @param endDate End date string in YYYY-MM-DD format
 * @returns Total aggregate emissions in kg CO2e
 */
export function calculateAggregate(logs: ActivityLog[], startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  const aggregate = logs
    .filter((log) => {
      const logTime = new Date(log.date).getTime()
      return logTime >= start && logTime <= end
    })
    .reduce((sum, log) => sum + log.calculatedCarbon, 0)

  return Math.round(aggregate * 100) / 100
}

/**
 * Calculates the total emissions for the calendar week containing the specified date.
 * Calendar week is defined here as Monday to Sunday.
 * 
 * @param logs Array of all activity logs
 * @param dateStr Any date string within the target week in YYYY-MM-DD format
 * @returns Total weekly emissions in kg CO2e
 */
export function calculateWeeklyTotal(logs: ActivityLog[], dateStr: string): number {
  const current = new Date(dateStr)
  const day = current.getDay()
  // Adjust to find Monday
  const distanceToMonday = day === 0 ? -6 : 1 - day // Sunday is 0, Monday is 1
  
  const monday = new Date(current)
  monday.setDate(current.getDate() + distanceToMonday)
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const mondayStr = monday.toISOString().split('T')[0]
  const sundayStr = sunday.toISOString().split('T')[0]

  return calculateAggregate(logs, mondayStr, sundayStr)
}

/**
 * Calculates the total emissions for the calendar month specified.
 * 
 * @param logs Array of all activity logs
 * @param monthStr Year and month in YYYY-MM format (e.g. "2026-06")
 * @returns Total monthly emissions in kg CO2e
 */
export function calculateMonthlyTotal(logs: ActivityLog[], monthStr: string): number {
  const monthlyTotal = logs
    .filter((log) => log.date.startsWith(monthStr))
    .reduce((sum, log) => sum + log.calculatedCarbon, 0)
  return Math.round(monthlyTotal * 100) / 100
}

/**
 * Compares an emissions figure against the IPCC/UNEP sustainable daily target budget (5.48 kg CO2e).
 * 
 * Formula:
 * - Difference = Emissions - Target
 * - PercentOfTarget = (Emissions / Target) * 100
 * - IsOver = Emissions > Target
 * 
 * @param totalEmissions Calculated emissions in kg CO2e
 * @param customTarget Optional custom daily target (falls back to SUSTAINABLE_DAILY_TARGET = 5.48)
 * @returns Object indicating difference, percentage, and budget status
 */
export function compareAgainstTarget(
  totalEmissions: number,
  customTarget: number = SUSTAINABLE_DAILY_TARGET
): ComparisonResult {
  const target = customTarget > 0 ? customTarget : SUSTAINABLE_DAILY_TARGET
  const difference = Math.round((totalEmissions - target) * 100) / 100
  const percentOfTarget = target > 0 ? Math.round((totalEmissions / target) * 100) : 0
  const isOver = totalEmissions > target

  return {
    difference,
    percentOfTarget,
    isOver,
  }
}
