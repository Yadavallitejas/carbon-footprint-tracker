import { describe, it, expect } from 'vitest'
import {
  calculateActivityCarbon,
  calculateDailyTotal,
  calculateAggregate,
  calculateWeeklyTotal,
  calculateMonthlyTotal,
  compareAgainstTarget,
} from '../carbonEngine'
import type { ActivityLog } from '../carbonCalculator'
import { SUSTAINABLE_DAILY_TARGET } from '../../data/emissionFactors'

describe('Carbonly Engine Calculations', () => {
  describe('calculateActivityCarbon', () => {
    it('calculates transport emission correctly (petrol car)', () => {
      const result = calculateActivityCarbon('transport', 'car_petrol', 100)
      expect(result).toBe(18.0) // 100km * 0.18 kg CO2e/km
    })

    it('calculates energy emission correctly (LPG cooking gas)', () => {
      const result = calculateActivityCarbon('energy', 'cooking_gas_lpg', 5)
      expect(result).toBe(15.0) // 5kg * 3.0 kg CO2e/kg
    })

    it('calculates food emission correctly (meat-heavy)', () => {
      const result = calculateActivityCarbon('food', 'meat_heavy', 3)
      expect(result).toBe(9.0) // 3 meals * 3.0 kg CO2e/meal
    })

    it('handles zero or negative amounts gracefully', () => {
      expect(calculateActivityCarbon('transport', 'car_petrol', 0)).toBe(0)
      expect(calculateActivityCarbon('transport', 'car_petrol', -50)).toBe(0)
    })

    it('handles unknown categories by returning 0', () => {
      // @ts-expect-error testing invalid category type runtime safety
      expect(calculateActivityCarbon('unknown_category', 'car_petrol', 10)).toBe(0)
    })

    it('handles unknown subcategory options by returning 0', () => {
      expect(calculateActivityCarbon('transport', 'non_existent_vehicle', 10)).toBe(0)
    })

    it('respects custom grid factor for electricity override', () => {
      // Default global grid factor is 0.38 kg CO2e/kWh => 10 kWh = 3.8 kg
      expect(calculateActivityCarbon('energy', 'electricity', 10)).toBe(3.8)
      // Custom green grid factor of 0.15 kg CO2e/kWh => 10 kWh = 1.5 kg
      expect(calculateActivityCarbon('energy', 'electricity', 10, 0.15)).toBe(1.5)
    })
  })

  describe('calculateDailyTotal', () => {
    it('correctly aggregates carbon logs for a specific day', () => {
      const logs: ActivityLog[] = [
        { id: '1', date: '2026-06-12', category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 0.5 },
        { id: '2', date: '2026-06-12', category: 'transport', subCategoryId: 'car_petrol', subCategoryName: 'Petrol Car', amount: 50, calculatedCarbon: 9.0 },
        { id: '3', date: '2026-06-13', category: 'energy', subCategoryId: 'electricity', subCategoryName: 'Electricity', amount: 10, calculatedCarbon: 3.8 }
      ]
      expect(calculateDailyTotal(logs, '2026-06-12')).toBe(9.5)
      expect(calculateDailyTotal(logs, '2026-06-13')).toBe(3.8)
    })

    it('returns 0 if no logs are present for that date', () => {
      const logs: ActivityLog[] = []
      expect(calculateDailyTotal(logs, '2026-06-12')).toBe(0)
    })
  })

  describe('calculateAggregate', () => {
    it('aggregates emissions correctly across a date range', () => {
      const logs: ActivityLog[] = [
        { id: '1', date: '2026-06-10', category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 1.0 },
        { id: '2', date: '2026-06-12', category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 2.0 },
        { id: '3', date: '2026-06-15', category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 4.0 },
      ]
      expect(calculateAggregate(logs, '2026-06-10', '2026-06-12')).toBe(3.0)
    })
  })

  describe('calculateWeeklyTotal', () => {
    it('aggregates weekly emissions correctly based on target date', () => {
      // 2026-06-12 is a Friday
      // Week range: Monday 2026-06-08 to Sunday 2026-06-14
      const logs: ActivityLog[] = [
        { id: '1', date: '2026-06-07', category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 10 }, // Last Sunday
        { id: '2', date: '2026-06-08', category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 2 },  // Monday
        { id: '3', date: '2026-06-12', category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 3 },  // Friday
        { id: '4', date: '2026-06-14', category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 5 },  // Sunday
        { id: '5', date: '2026-06-15', category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 20 }, // Next Monday
      ]
      expect(calculateWeeklyTotal(logs, '2026-06-12')).toBe(10) // 2 + 3 + 5
    })
  })

  describe('calculateMonthlyTotal', () => {
    it('aggregates monthly emissions correctly', () => {
      const logs: ActivityLog[] = [
        { id: '1', date: '2026-06-01', category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 3.5 },
        { id: '2', date: '2026-06-15', category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 4.5 },
        { id: '3', date: '2026-05-31', category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 10 },
      ]
      expect(calculateMonthlyTotal(logs, '2026-06')).toBe(8.0)
    })
  })

  describe('compareAgainstTarget', () => {
    it('correctly assesses emissions under the target limit', () => {
      const comp = compareAgainstTarget(4.5, SUSTAINABLE_DAILY_TARGET)
      expect(comp.isOver).toBe(false)
      expect(comp.difference).toBe(-0.98) // 4.5 - 5.48 = -0.98
      expect(comp.percentOfTarget).toBe(82) // (4.5 / 5.48) * 100
    })

    it('correctly assesses emissions over the target limit', () => {
      const comp = compareAgainstTarget(10.0, SUSTAINABLE_DAILY_TARGET)
      expect(comp.isOver).toBe(true)
      expect(comp.difference).toBe(4.52) // 10 - 5.48 = 4.52
    })

    it('falls back to default sustainable target when target is invalid (e.g. <= 0)', () => {
      const comp = compareAgainstTarget(10.0, -5)
      expect(comp.isOver).toBe(true)
      expect(comp.difference).toBe(4.52) // falls back to 5.48
    })
  })
})
