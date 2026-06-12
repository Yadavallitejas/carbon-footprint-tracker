import { describe, it, expect } from 'vitest'
import { getPersonalizedInsights, getRecommendations, getAchievements } from '../recommendationEngine'
import type { ActivityLog } from '../carbonCalculator'

describe('Recommendation Engine Insights & Badges', () => {
  const todayStr = new Date().toISOString().split('T')[0]

  describe('getPersonalizedInsights', () => {
    it('returns fallback shopping insight when logs are empty (empty-state)', () => {
      const insights = getPersonalizedInsights([])
      expect(insights.length).toBeGreaterThanOrEqual(1)
      expect(insights[0].title).toContain('General: Swap Shopping')
    })

    it('triggers commute swap suggestions if user travels > 40 km in fossil car', () => {
      const logs: ActivityLog[] = [
        {
          id: '1',
          date: todayStr,
          category: 'transport',
          subCategoryId: 'car_petrol',
          subCategoryName: 'Petrol Car',
          amount: 50, // 50 km > 40 km threshold
          calculatedCarbon: 9.0,
        },
      ]
      const insights = getPersonalizedInsights(logs)
      const commuteInsight = insights.find((i) => i.actionType === 'commute')
      expect(commuteInsight).toBeDefined()
      expect(commuteInsight?.title).toBe('Switch Commutes to Train/Metro')
      expect(commuteInsight?.estimatedSavingKgCO2e).toBeGreaterThan(0)
    })

    it('triggers diet swap suggestions if user has > 3 meat-heavy meals', () => {
      const logs: ActivityLog[] = [
        {
          id: '1',
          date: todayStr,
          category: 'food',
          subCategoryId: 'meat_heavy',
          subCategoryName: 'High Meat',
          amount: 4, // 4 meals > 3 threshold
          calculatedCarbon: 12.0,
        },
      ]
      const insights = getPersonalizedInsights(logs)
      const dietInsight = insights.find((i) => i.actionType === 'diet')
      expect(dietInsight).toBeDefined()
      expect(dietInsight?.title).toBe('Reduce Red Meat Meals')
      expect(dietInsight?.estimatedSavingKgCO2e).toBeGreaterThan(0)
    })

    it('triggers energy warning if household power is above weekly benchmark', () => {
      const logs: ActivityLog[] = [
        {
          id: '1',
          date: todayStr,
          category: 'energy',
          subCategoryId: 'electricity',
          subCategoryName: 'Electricity',
          amount: 80, // 80 kWh > 70 kWh weekly threshold
          calculatedCarbon: 30.4,
        },
      ]
      const insights = getPersonalizedInsights(logs)
      const energyInsight = insights.find((i) => i.actionType === 'household')
      expect(energyInsight).toBeDefined()
      expect(energyInsight?.title).toBe('Optimize Household Thermostats')
    })

    it('provides positive reinforcement if weekly footprint decreased vs last week', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
      const tenDaysAgoStr = tenDaysAgo.toISOString().split('T')[0]

      const logs: ActivityLog[] = [
        // This week: 10 kg
        { id: '1', date: yesterdayStr, category: 'transport', subCategoryId: 'car_petrol', subCategoryName: 'Petrol Car', amount: 55, calculatedCarbon: 10 },
        // Last week: 20 kg
        { id: '2', date: tenDaysAgoStr, category: 'transport', subCategoryId: 'car_petrol', subCategoryName: 'Petrol Car', amount: 110, calculatedCarbon: 20 },
      ]

      const insights = getPersonalizedInsights(logs)
      const reinforcementInsight = insights.find((i) => i.actionType === 'reinforcement')
      expect(reinforcementInsight).toBeDefined()
      expect(reinforcementInsight?.title).toContain('Progress Locked!')
      expect(reinforcementInsight?.estimatedSavingKgCO2e).toBe(10) // 20 - 10 = 10 kg saved
    })
  })

  describe('getRecommendations', () => {
    it('returns general tips list when no logs are recorded', () => {
      const tips = getRecommendations([], 15.0)
      expect(tips.some((t) => t.id === 'start_logging')).toBe(true)
      expect(tips.some((t) => t.category === 'food')).toBe(true)
    })

    it('recommends public transit if transport is the dominant carbon source', () => {
      const logs: ActivityLog[] = [
        { id: '1', date: todayStr, category: 'transport', subCategoryId: 'car_petrol', subCategoryName: 'Petrol Car', amount: 100, calculatedCarbon: 18 },
      ]
      const tips = getRecommendations(logs, 15.0)
      expect(tips.some((t) => t.id === 'transit_opt')).toBe(true)
    })
  })

  describe('getAchievements', () => {
    it('initializes lock states correctly and tracks progress', () => {
      const badges = getAchievements([])
      // All badges should be locked initially except 'First Steps' progress is 0%
      const commuterBadge = badges.find((b) => b.id === 'green_commuter')
      expect(commuterBadge?.unlocked).toBe(false)
      expect(commuterBadge?.progress).toBe(0)
    })

    it('unlocks badges when log criteria are fulfilled', () => {
      // Log 1 green activity
      const logs: ActivityLog[] = [
        { id: '1', date: todayStr, category: 'transport', subCategoryId: 'walking_cycling', subCategoryName: 'Walking', amount: 5, calculatedCarbon: 0 }
      ]
      const badges = getAchievements(logs)
      const firstStepsBadge = badges.find((b) => b.id === 'first_steps')
      expect(firstStepsBadge?.unlocked).toBe(true)
      expect(firstStepsBadge?.progress).toBe(100)
    })
  })
})
