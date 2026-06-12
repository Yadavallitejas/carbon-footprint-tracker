export interface EmissionFactor {
  id: string
  name: string
  value: number // kg CO2e per unit
  unit: string
}

export interface CategoryFactors {
  [key: string]: EmissionFactor[]
}

/**
 * Global average emission factors in kg CO2e.
 * 
 * References:
 * - Transport: Defra / UK Government Greenhouse Gas Conversion Factors
 * - Food: Poore & Nemecek (2018), Science (lifecycle food analysis)
 * - Energy: IEA (International Energy Agency) for global grids, IPCC for LPG
 * - Shopping: Carbon Trust and WRAP reports on electronics/clothing lifecycles
 */
export const EMISSION_FACTORS: CategoryFactors = {
  transport: [
    { id: 'car_petrol', name: 'Petrol Car', value: 0.18, unit: 'km' },
    { id: 'car_diesel', name: 'Diesel Car', value: 0.17, unit: 'km' },
    { id: 'car_electric', name: 'Electric Vehicle (EV)', value: 0.05, unit: 'km' },
    { id: 'bus', name: 'Bus', value: 0.08, unit: 'km' },
    { id: 'train_metro', name: 'Train / Metro', value: 0.04, unit: 'km' },
    { id: 'flight_short', name: 'Flight (Short Haul < 1500km)', value: 0.15, unit: 'km' },
    { id: 'flight_long', name: 'Flight (Long Haul > 1500km)', value: 0.11, unit: 'km' },
    { id: 'bike_walk', name: 'Bicycle / Walking', value: 0.0, unit: 'km' },
  ],
  food: [
    { id: 'meat_heavy', name: 'High Meat (Beef, Lamb, Pork)', value: 3.0, unit: 'meal' },
    { id: 'mixed', name: 'Mixed (Meat + Veg)', value: 1.5, unit: 'meal' },
    { id: 'vegetarian', name: 'Vegetarian Meal', value: 0.8, unit: 'meal' },
    { id: 'vegan', name: 'Vegan Meal', value: 0.5, unit: 'meal' },
  ],
  energy: [
    { id: 'electricity', name: 'Grid Electricity', value: 0.38, unit: 'kWh' },
    { id: 'cooking_gas_lpg', name: 'LPG Cooking Gas', value: 3.0, unit: 'kg' },
    { id: 'natural_gas', name: 'Natural Gas', value: 0.18, unit: 'kWh' },
    { id: 'heating_oil', name: 'Heating Oil', value: 0.26, unit: 'kWh' },
  ],
  shopping: [
    { id: 'clothing_item', name: 'Clothing Item', value: 15.0, unit: 'pcs' },
    { id: 'electronics', name: 'Electronics (Phone/PC)', value: 150.0, unit: 'pcs' },
    { id: 'online_order', name: 'General Online Order', value: 5.0, unit: 'orders' },
  ],
  waste: [
    { id: 'landfill', name: 'Landfill Trash', value: 0.5, unit: 'kg' },
    { id: 'recycled', name: 'Recycled Materials', value: 0.05, unit: 'kg' },
    { id: 'compost', name: 'Organic Compost', value: 0.1, unit: 'kg' },
  ],
}

export interface UserProfileSettings {
  name: string
  dailyTarget: number // kg CO2e
  region: string
  dietPreference: string
  carType: string
  householdSize: number
  unit: 'km' | 'miles'
  hasCompletedOnboarding: boolean
}

export const DEFAULT_SETTINGS: UserProfileSettings = {
  name: 'Everyday Optimizer',
  dailyTarget: 15.0,
  region: 'Global',
  dietPreference: 'vegetarian',
  carType: 'car_petrol',
  householdSize: 1,
  unit: 'km',
  hasCompletedOnboarding: false,
}

/**
 * Sustainable Daily target based on IPCC / UNEP targets to limit warming to 1.5°C.
 * Limit of 2 tonnes (2000 kg) CO2e/year per person => 5.48 kg CO2e/day.
 */
export const SUSTAINABLE_DAILY_TARGET = 5.48
