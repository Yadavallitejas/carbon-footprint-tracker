import type { ActivityLog } from './carbonCalculator'
import { getCategoryTotals } from './carbonCalculator'
import { EMISSION_FACTORS } from '../data/emissionFactors'

export interface Recommendation {
  id: string
  title: string
  description: string
  potentialSavings: string // e.g. "Save ~2.2 kg CO2e"
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'waste' | 'general'
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string // Lucide icon name representation
  unlocked: boolean
  progress: number // percentage 0-100
  progressText: string // e.g. "3/5 logs"
}

export interface PersonalizedInsight {
  title: string
  message: string
  estimatedSavingKgCO2e: number
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'waste' | 'general'
  actionType: 'commute' | 'diet' | 'household' | 'shopping' | 'reinforcement' | 'general'
}

// Static benchmark: average weekly household electricity usage for similar energy optimizers is 70 kWh (10 kWh/day)
const WEEKLY_ELECTRICITY_BENCHMARK_KWH = 70

/**
 * Generates 2-4 personalized, actionable insights based on the last 7 days of logs.
 */
export function getPersonalizedInsights(logs: ActivityLog[]): PersonalizedInsight[] {
  const insights: PersonalizedInsight[] = []

  // 1. Setup date thresholds
  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 7)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(today.getDate() - 14)

  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
  const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split('T')[0]

  // Filter logs for this week and last week
  const thisWeekLogs = logs.filter((log) => log.date >= sevenDaysAgoStr)
  const lastWeekLogs = logs.filter((log) => log.date >= fourteenDaysAgoStr && log.date < sevenDaysAgoStr)

  // A. TRANSPORT RULE
  // If user traveled > 40 km in a petrol/diesel car this week, suggest swapping 3 trips (avg 15km each = 45km total)
  const fossilCarLogs = thisWeekLogs.filter(
    (l) => l.category === 'transport' && ['car_petrol', 'car_diesel'].includes(l.subCategoryId)
  )
  const totalFossilCarDistance = fossilCarLogs.reduce((sum, l) => sum + l.amount, 0)

  if (totalFossilCarDistance > 40) {
    const petrolFactor = EMISSION_FACTORS.transport.find((f) => f.id === 'car_petrol')?.value || 0.18
    const transitFactor = EMISSION_FACTORS.transport.find((f) => f.id === 'train_metro')?.value || 0.04
    // Calculate potential savings for swapping 3 trips of 15km (45km total)
    const distanceToSwap = Math.min(45, totalFossilCarDistance)
    const savings = Math.round(distanceToSwap * (petrolFactor - transitFactor) * 10) / 10

    insights.push({
      title: 'Switch Commutes to Train/Metro',
      message: `You drove ${totalFossilCarDistance.toFixed(0)} km in fossil-fuel vehicles this week. Swapping roughly ${distanceToSwap.toFixed(0)} km of those trips to train or metro transit would cut greenhouse emissions by ${savings} kg CO₂e.`,
      estimatedSavingKgCO2e: savings,
      category: 'transport',
      actionType: 'commute',
    })
  }

  // B. DIET/FOOD RULE
  // If user had > 3 meat-heavy meals this week, suggest swapping 3 meals to vegan/vegetarian
  const meatHeavyMeals = thisWeekLogs.filter(
    (l) => l.category === 'food' && l.subCategoryId === 'meat_heavy'
  )
  const totalMeatMealsCount = meatHeavyMeals.reduce((sum, l) => sum + l.amount, 0)

  if (totalMeatMealsCount > 3) {
    const meatFactor = EMISSION_FACTORS.food.find((f) => f.id === 'meat_heavy')?.value || 3.0
    const veganFactor = EMISSION_FACTORS.food.find((f) => f.id === 'vegan')?.value || 0.5
    // Swap 3 meals
    const mealsToSwap = Math.min(3, totalMeatMealsCount)
    const savings = Math.round(mealsToSwap * (meatFactor - veganFactor) * 10) / 10

    insights.push({
      title: 'Reduce Red Meat Meals',
      message: `You logged ${totalMeatMealsCount} meat-heavy meals this week. Swapping ${mealsToSwap} of these for plant-based vegan plates reduces agricultural greenhouse gas impact by ${savings} kg CO₂e.`,
      estimatedSavingKgCO2e: savings,
      category: 'food',
      actionType: 'diet',
    })
  }

  // C. ENERGY RULE
  // If electricity usage is above weekly standard average (70 kWh), suggest energy-saving hacks
  const electricityLogs = thisWeekLogs.filter(
    (l) => l.category === 'energy' && l.subCategoryId === 'electricity'
  )
  const totalElectricityKwh = electricityLogs.reduce((sum, l) => sum + l.amount, 0)

  if (totalElectricityKwh > WEEKLY_ELECTRICITY_BENCHMARK_KWH) {
    const elecFactor = EMISSION_FACTORS.energy.find((f) => f.id === 'electricity')?.value || 0.38
    // Assuming a 15% reduction in electricity through conservation adjustments
    const kwhSavings = totalElectricityKwh * 0.15
    const savings = Math.round(kwhSavings * elecFactor * 10) / 10

    insights.push({
      title: 'Optimize Household Thermostats',
      message: `Your weekly electricity consumption (${totalElectricityKwh.toFixed(0)} kWh) exceeds the sustainability average benchmark of ${WEEKLY_ELECTRICITY_BENCHMARK_KWH} kWh. Lowering heating by 1°C and unplugging inactive standbys will save ${kwhSavings.toFixed(1)} kWh, reducing grid load by ${savings} kg CO₂e.`,
      estimatedSavingKgCO2e: savings,
      category: 'energy',
      actionType: 'household',
    })
  }

  // D. POSITIVE REINFORCEMENT / RECOVERY RULE
  const thisWeekCarbon = thisWeekLogs.reduce((sum, l) => sum + l.calculatedCarbon, 0)
  const lastWeekCarbon = lastWeekLogs.reduce((sum, l) => sum + l.calculatedCarbon, 0)

  if (lastWeekCarbon > 0 && thisWeekCarbon < lastWeekCarbon) {
    const savings = Math.round((lastWeekCarbon - thisWeekCarbon) * 10) / 10
    insights.push({
      title: 'Carbon Trend: Progress Locked! 🔥',
      message: `Amazing job! Your weekly emissions decreased from ${lastWeekCarbon.toFixed(1)} kg last week to ${thisWeekCarbon.toFixed(1)} kg CO₂e this week, achieving a net reduction of ${savings} kg CO₂e. Keep up these low-carbon daily choices!`,
      estimatedSavingKgCO2e: savings,
      category: 'general',
      actionType: 'reinforcement',
    })
  } else if (thisWeekLogs.length > 0 && lastWeekLogs.length === 0) {
    insights.push({
      title: 'Habit Initiated: Welcome to Carbonly! 🌱',
      message: `Excellent start on your tracking journey! You successfully logged ${thisWeekLogs.length} actions this week. Consistent habits are the foundation of footprint reduction.`,
      estimatedSavingKgCO2e: 0,
      category: 'general',
      actionType: 'reinforcement',
    })
  }

  // Fallback Insight if lists are short
  if (insights.length < 2) {
    insights.push({
      title: 'General: Swap Shopping for Sustainable Brands',
      message: 'General retail garments cost an average of 15kg CO2e per piece. Buying organic cotton or second-hand items saves over 60% of the manufacturing impact.',
      estimatedSavingKgCO2e: 9.0,
      category: 'shopping',
      actionType: 'shopping',
    })
  }

  return insights
}

/**
 * Dynamically computes highlights based on logs
 */
export function getRecommendations(logs: ActivityLog[], dailyTarget: number): Recommendation[] {
  const totals = getCategoryTotals(logs)
  const totalEmissions = Object.values(totals).reduce((a, b) => a + b, 0)

  const recommendations: Recommendation[] = [
    {
      id: 'general_target',
      title: 'Review Daily Budget',
      description: `Aim to keep your average daily footprint below your target of ${dailyTarget} kg CO2e. Small choices yield compound benefits!`,
      potentialSavings: 'Varies',
      category: 'general',
    },
  ]

  if (totalEmissions === 0) {
    return [
      {
        id: 'start_logging',
        title: 'Start Logging!',
        description: 'Log your first daily activities in Transport, Food, Energy, or Waste to see real-time impact insights.',
        potentialSavings: 'Up to 20 kg/day',
        category: 'general',
      },
      {
        id: 'diet_general',
        title: 'Adopt Plant-rich Meals',
        description: 'Replacing beef/pork meals with plant-based options saves an average of 2.5 kg CO2e per plate.',
        potentialSavings: '2.5 kg per meal',
        category: 'food',
      },
      {
        id: 'transport_general',
        title: 'Active Commuting',
        description: 'For trips under 3km, walk or cycle instead of driving to completely eliminate commute emissions.',
        potentialSavings: '0.18 kg per km',
        category: 'transport',
      },
    ]
  }

  // Find dominant category
  const sortedCategories = Object.entries(totals).sort((a, b) => b[1] - a[1])
  const topCategory = sortedCategories[0][0]

  if (topCategory === 'transport' && totals.transport > 0) {
    recommendations.push({
      id: 'transit_opt',
      title: 'Switch to Public Transit or EV',
      description: 'Your transport emissions represent your biggest footprint. Switching petrol miles to public transit or an electric vehicle saves over 70% in emissions.',
      potentialSavings: 'Save ~0.14 kg CO2e/km',
      category: 'transport',
    })
  }

  if (topCategory === 'food' && totals.food > 0) {
    recommendations.push({
      id: 'meatless_monday',
      title: 'Try Vegetarian/Vegan Alternatives',
      description: 'Food is currently your highest emission source. Replacing red meat with plant-based meals cuts plate carbon output by 80%.',
      potentialSavings: 'Save ~2.2 kg CO2e/meal',
      category: 'food',
    })
  }

  if (topCategory === 'energy' && totals.energy > 0) {
    recommendations.push({
      id: 'led_lighting',
      title: 'Swap to LED Bulbs & Standby Power',
      description: 'Your household energy use is high. Turn off appliances at the outlet and switch to LEDs to save energy immediately.',
      potentialSavings: 'Save ~0.5 kg CO2e/day',
      category: 'energy',
    })
  }

  if (topCategory === 'waste' && totals.waste > 0) {
    recommendations.push({
      id: 'composting_organics',
      title: 'Start Composting Organics',
      description: 'Organic waste rotting in landfills produces methane. Composting converts it to soil, reducing footprint significantly.',
      potentialSavings: 'Save ~0.4 kg CO2e/kg',
      category: 'waste',
    })
  }

  return recommendations
}

/**
 * Checks and computes achievement metrics
 */
export function getAchievements(logs: ActivityLog[]): Achievement[] {
  // 1. Green Commuter (log walking, cycling, or transit 5 times)
  const commuterLogs = logs.filter(
    (l) =>
      l.category === 'transport' &&
      ['walking_cycling', 'public_transit', 'car_electric'].includes(l.subCategoryId)
  ).length
  const commuterUnlocked = commuterLogs >= 5

  // 2. Plant Powered (log vegetarian or vegan meals 5 times)
  const greenMeals = logs.filter(
    (l) => l.category === 'food' && ['vegetarian', 'vegan'].includes(l.subCategoryId)
  ).length
  const plantUnlocked = greenMeals >= 5

  // 3. Zero Waster (log compost or recycling 5 times)
  const ecoWaste = logs.filter(
    (l) => l.category === 'waste' && ['recycled', 'compost'].includes(l.subCategoryId)
  ).length
  const wasteUnlocked = ecoWaste >= 5

  // 4. Energy Saver (log any energy saving or low energy items - e.g. electricity/gas under 15 kWh)
  const lowEnergyLogs = logs.filter((l) => l.category === 'energy' && l.amount <= 15).length
  const energyUnlocked = lowEnergyLogs >= 3

  // 5. Climate Champion (log at least 15 activities in total)
  const totalLogs = logs.length
  const championUnlocked = totalLogs >= 15

  // 6. First Steps (log first activity)
  const firstStepsUnlocked = totalLogs >= 1

  return [
    {
      id: 'first_steps',
      title: 'First Steps',
      description: 'Log your very first carbon activity to begin the journey.',
      icon: 'Footprints',
      unlocked: firstStepsUnlocked,
      progress: firstStepsUnlocked ? 100 : 0,
      progressText: firstStepsUnlocked ? 'Unlocked!' : '0/1 logged',
    },
    {
      id: 'green_commuter',
      title: 'Green Commuter',
      description: 'Log 5 eco-friendly transport choices (walk, bike, transit, or EV).',
      icon: 'Bike',
      unlocked: commuterUnlocked,
      progress: Math.min(100, (commuterLogs / 5) * 100),
      progressText: commuterUnlocked ? 'Unlocked!' : `${commuterLogs}/5 steps`,
    },
    {
      id: 'plant_powered',
      title: 'Plant Powered',
      description: 'Fuel your day with 5 plant-rich meals (vegetarian or vegan).',
      icon: 'Leaf',
      unlocked: plantUnlocked,
      progress: Math.min(100, (greenMeals / 5) * 100),
      progressText: plantUnlocked ? 'Unlocked!' : `${greenMeals}/5 meals`,
    },
    {
      id: 'zero_waster',
      title: 'Zero Waste Advocate',
      description: 'Compost or recycle waste materials 5 times.',
      icon: 'Trash2',
      unlocked: wasteUnlocked,
      progress: Math.min(100, (ecoWaste / 5) * 100),
      progressText: wasteUnlocked ? 'Unlocked!' : `${ecoWaste}/5 sorts`,
    },
    {
      id: 'energy_saver',
      title: 'Smart Energy Saver',
      description: 'Log highly efficient energy consumption (< 15 kWh) 3 times.',
      icon: 'Zap',
      unlocked: energyUnlocked,
      progress: Math.min(100, (lowEnergyLogs / 3) * 100),
      progressText: energyUnlocked ? 'Unlocked!' : `${lowEnergyLogs}/3 logs`,
    },
    {
      id: 'climate_champion',
      title: 'Climate Champion',
      description: 'Build a durable habit by logging 15 total daily actions.',
      icon: 'Trophy',
      unlocked: championUnlocked,
      progress: Math.min(100, (totalLogs / 15) * 100),
      progressText: championUnlocked ? 'Unlocked!' : `${totalLogs}/15 logged`,
    },
  ]
}
