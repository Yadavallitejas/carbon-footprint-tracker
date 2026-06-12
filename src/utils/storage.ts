import type { ActivityLog } from '../logic/carbonCalculator'
import type { UserProfileSettings } from '../data/emissionFactors'
import { DEFAULT_SETTINGS } from '../data/emissionFactors'

const LOGS_KEY = 'cf_tracker_logs'
const SETTINGS_KEY = 'cf_tracker_settings'

/**
 * Strips HTML tags from user inputs to prevent XSS or injection.
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  return text.replace(/<\/?[^>]+(>|$)/g, '').trim()
}

/**
 * Centralized localStorage wrapper to retrieve activity logs.
 * Includes sanitization for notes fields to prevent storage-based XSS.
 */
export function getLogs(): ActivityLog[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOGS_KEY) : null
    if (!raw) return []
    const parsed = JSON.parse(raw) as ActivityLog[]
    return parsed.map((log) => ({
      ...log,
      notes: log.notes ? sanitizeText(log.notes) : undefined,
    }))
  } catch (e) {
    console.error('Failed to read logs from localStorage', e)
    return []
  }
}

/**
 * Centralized localStorage wrapper to write activity logs.
 * Includes sanitization and try/catch error handling.
 */
export function saveLogs(logs: ActivityLog[]): void {
  try {
    const sanitized = logs.map((log) => ({
      ...log,
      notes: log.notes ? sanitizeText(log.notes) : undefined,
    }))
    localStorage.setItem(LOGS_KEY, JSON.stringify(sanitized))
  } catch (e) {
    console.error('Failed to save logs to localStorage', e)
  }
}

/**
 * Adds a new activity log to the database.
 */
export function addLog(log: ActivityLog): void {
  const logs = getLogs()
  const sanitizedLog = {
    ...log,
    notes: log.notes ? sanitizeText(log.notes) : undefined,
  }
  logs.unshift(sanitizedLog)
  saveLogs(logs)
}

/**
 * Deletes an activity log from the database by ID.
 */
export function deleteLog(id: string): void {
  const logs = getLogs()
  const filtered = logs.filter((log) => log.id !== id)
  saveLogs(filtered)
}

/**
 * Centralized localStorage wrapper to retrieve user profile settings.
 * Includes sanitization and defaults fallback.
 */
export function getSettings(): UserProfileSettings {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SETTINGS_KEY) : null
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as UserProfileSettings
    return {
      ...parsed,
      name: sanitizeText(parsed.name || DEFAULT_SETTINGS.name),
    }
  } catch (e) {
    console.error('Failed to read settings from localStorage', e)
    return DEFAULT_SETTINGS
  }
}

/**
 * Centralized localStorage wrapper to write user profile settings.
 * Includes sanitization and try/catch error handling.
 */
export function saveSettings(settings: UserProfileSettings): void {
  try {
    const sanitizedSettings = {
      ...settings,
      name: sanitizeText(settings.name || DEFAULT_SETTINGS.name),
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitizedSettings))
  } catch (e) {
    console.error('Failed to save settings to localStorage', e)
  }
}

/**
 * Safely clears all data from localStorage with error handling.
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(LOGS_KEY)
    localStorage.removeItem(SETTINGS_KEY)
  } catch (e) {
    console.error('Failed to clear data in localStorage', e)
  }
}

/**
 * Generates sample data over the last 7 days for the demo / hackathon.
 */
export function seedSampleData(): void {
  const today = new Date()
  const sampleLogs: ActivityLog[] = []

  const transportOptions = [
    { id: 'car_petrol', name: 'Petrol Car', carbonPerKm: 0.18, category: 'transport' },
    { id: 'public_transit', name: 'Bus / Train', carbonPerKm: 0.04, category: 'transport' },
    { id: 'walking_cycling', name: 'Walking / Cycling', carbonPerKm: 0, category: 'transport' },
  ]

  const foodOptions = [
    { id: 'meat_heavy', name: 'High Meat (Beef, Lamb, Pork)', carbon: 3.0, category: 'food' },
    { id: 'meat_light', name: 'Low Meat (Poultry, Fish)', carbon: 1.2, category: 'food' },
    { id: 'vegetarian', name: 'Vegetarian Meal', carbon: 0.8, category: 'food' },
    { id: 'vegan', name: 'Vegan Meal', carbon: 0.5, category: 'food' },
  ]

  const shoppingOptions = [
    { id: 'clothing_item', name: 'Clothing Item', factor: 15.0 },
    { id: 'online_order', name: 'General Online Order', factor: 5.0 },
  ]

  // Generate logs for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateString = date.toISOString().split('T')[0]

    // 1. Food entries (2-3 meals per day)
    const meal1 = foodOptions[Math.floor(Math.random() * foodOptions.length)]
    sampleLogs.push({
      id: `sample-food-1-${i}`,
      date: dateString,
      category: 'food',
      subCategoryId: meal1.id,
      subCategoryName: meal1.name,
      amount: 1,
      calculatedCarbon: meal1.carbon || 0,
      notes: 'Lunch',
    })

    const meal2 = foodOptions[Math.floor(Math.random() * foodOptions.length)]
    sampleLogs.push({
      id: `sample-food-2-${i}`,
      date: dateString,
      category: 'food',
      subCategoryId: meal2.id,
      subCategoryName: meal2.name,
      amount: 1,
      calculatedCarbon: meal2.carbon || 0,
      notes: 'Dinner',
    })

    // 2. Transport entry (most days)
    if (i !== 3) {
      const trans = transportOptions[Math.floor(Math.random() * transportOptions.length)]
      const distance = Math.floor(Math.random() * 30) + 5 // 5 to 35 km
      sampleLogs.push({
        id: `sample-trans-${i}`,
        date: dateString,
        category: 'transport',
        subCategoryId: trans.id,
        subCategoryName: trans.name,
        amount: distance,
        calculatedCarbon: Math.round(distance * (trans.carbonPerKm || 0) * 100) / 100,
        notes: i % 2 === 0 ? 'Commute to work' : 'Running errands',
      })
    }

    // 3. Energy logs (once every 2 days)
    if (i % 2 === 0) {
      const kwh = Math.floor(Math.random() * 15) + 5 // 5 to 20 kWh
      sampleLogs.push({
        id: `sample-energy-${i}`,
        date: dateString,
        category: 'energy',
        subCategoryId: 'electricity',
        subCategoryName: 'Grid Electricity',
        amount: kwh,
        calculatedCarbon: Math.round(kwh * 0.38 * 100) / 100,
        notes: 'Daily home electricity use',
      })
    }

    // 4. Waste logs (once every 3 days)
    if (i % 3 === 0) {
      const kgWaste = Math.floor(Math.random() * 3) + 1 // 1 to 4 kg
      const wasteType = Math.random() > 0.4
        ? { id: 'recycled', name: 'Recycled Materials', factor: 0.05 }
        : { id: 'landfill', name: 'Landfill Trash', factor: 0.5 }
      sampleLogs.push({
        id: `sample-waste-${i}`,
        date: dateString,
        category: 'waste',
        subCategoryId: wasteType.id,
        subCategoryName: wasteType.name,
        amount: kgWaste,
        calculatedCarbon: Math.round(kgWaste * wasteType.factor * 100) / 100,
        notes: 'Sorting trash',
      })
    }

    // 5. Shopping logs (once every 2 days)
    if (i % 2 === 1) {
      const shop = shoppingOptions[Math.floor(Math.random() * shoppingOptions.length)]
      const quantity = Math.floor(Math.random() * 2) + 1 // 1 to 2 items
      sampleLogs.push({
        id: `sample-shopping-${i}`,
        date: dateString,
        category: 'shopping',
        subCategoryId: shop.id,
        subCategoryName: shop.name,
        amount: quantity,
        calculatedCarbon: Math.round(quantity * shop.factor * 100) / 100,
        notes: shop.id === 'clothing_item' ? 'Bought new shirt' : 'Online package',
      })
    }
  }

  saveLogs(sampleLogs)
}
