import React, { useState } from 'react'
import type { ActivityLog } from '../logic/carbonCalculator'
import type { UserProfileSettings } from '../data/emissionFactors'
import { getAchievements, getPersonalizedInsights } from '../logic/recommendationEngine'
import { Lightbulb, Award, BarChart2, Footprints, Bike, Leaf, Trash2, Zap, Trophy, Car, Utensils, ShoppingBag, Sparkles } from 'lucide-react'

interface InsightsProps {
  logs: ActivityLog[]
  settings: UserProfileSettings
}

export const Insights: React.FC<InsightsProps> = ({ logs, settings }) => {
  const achievements = getAchievements(logs)
  const personalizedInsights = getPersonalizedInsights(logs)

  // What-If Simulator States
  const isMiles = settings.unit === 'miles'
  const [commuteSwap, setCommuteSwap] = useState<number>(isMiles ? 30 : 50) // km or miles/week swapped car -> public transit
  const [mealSwap, setMealSwap] = useState<number>(3) // meat meals/week swapped to vegan
  const [energyReduction, setEnergyReduction] = useState<number>(3) // kWh electricity reduced/day

  React.useEffect(() => {
    setCommuteSwap(isMiles ? 30 : 50)
  }, [isMiles])

  // Math for annual savings
  // 1. Car commute petrol vs transit: (0.18 - 0.04) kg/km * km * 52 weeks
  const annualCommuteSavings = commuteSwap * (isMiles ? 1.60934 : 1) * (0.18 - 0.04) * 52
  // 2. Meal swap meat-heavy vs vegan: (3.0 - 0.5) kg/meal * meals * 52 weeks
  const annualMealSavings = mealSwap * (3.0 - 0.5) * 52
  // 3. Energy reduction: 0.38 kg/kWh * kWh * 365 days
  const annualEnergySavings = energyReduction * 0.38 * 365

  const totalAnnualSavings = annualCommuteSavings + annualMealSavings + annualEnergySavings

  // Mapping string to Lucide Icon React components
  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    Footprints: Footprints,
    Bike: Bike,
    Leaf: Leaf,
    Trash2: Trash2,
    Zap: Zap,
    Trophy: Trophy,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Insights & Optimization</h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Simulate carbon-offset strategies, analyze recommendations, and review achievements.
        </p>
      </div>

      {/* Simulator Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-xl hover:border-slate-700/80 transition-all duration-300">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
          <BarChart2 className="w-4 h-4 animate-pulse-slow" />
          <span>Interactive "What-If" Simulator</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          {/* Controls */}
          <div className="md:col-span-3 space-y-4">
            {/* Transit Commute Swap */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  Car commute swapped to transit/walking
                </label>
                <span className="text-xs font-extrabold text-white">{commuteSwap} {isMiles ? 'mi' : 'km'} / week</span>
              </div>
              <input
                type="range"
                min="0"
                max={isMiles ? 120 : 200}
                step="5"
                value={commuteSwap}
                onChange={(e) => setCommuteSwap(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950/80 border border-slate-850 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 font-semibold mt-0.5 block">
                Calculated at {isMiles ? (0.14 * 1.60934).toFixed(3) : '0.14'} kg CO₂e saved per {isMiles ? 'mile' : 'kilometer'}
              </span>
            </div>

            {/* Diet meal swaps */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  Meat-heavy meals swapped to vegan
                </label>
                <span className="text-xs font-extrabold text-white">{mealSwap} meals / week</span>
              </div>
              <input
                type="range"
                min="0"
                max="21"
                step="1"
                value={mealSwap}
                onChange={(e) => setMealSwap(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950/80 border border-slate-850 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 font-semibold mt-0.5 block">
                Calculated at 2.5 kg CO₂e saved per meal
              </span>
            </div>

            {/* Household electricity reductions */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  Daily household electricity saved
                </label>
                <span className="text-xs font-extrabold text-white">{energyReduction} kWh / day</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={energyReduction}
                onChange={(e) => setEnergyReduction(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950/80 border border-slate-850 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 font-semibold mt-0.5 block">
                Calculated at 0.38 kg CO₂e saved per kWh
              </span>
            </div>
          </div>

          {/* Result Output Card */}
          <div className="md:col-span-2 bg-slate-950/80 border border-slate-850/80 p-5 rounded-2xl flex flex-col justify-center items-center text-center shadow-inner h-full min-h-[180px]">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Projected Annual Savings
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-2 block tracking-tight">
              {totalAnnualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg
            </span>
            <span className="text-xs text-white font-extrabold mt-1 block">CO₂e per year</span>

            <div className="mt-4 pt-3 border-t border-slate-850 w-full flex items-center justify-between text-[10px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1">🚗 {Math.round(annualCommuteSavings)} kg</span>
              <span className="flex items-center gap-1">🥗 {Math.round(annualMealSavings)} kg</span>
              <span className="flex items-center gap-1">⚡ {Math.round(annualEnergySavings)} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gamified Achievements Board */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Achievements & Badges</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {achievements.map((badge) => {
            const BadgeIcon = iconMap[badge.icon] || Award
            const isUnlocked = badge.unlocked

            return (
              <div
                key={badge.id}
                className={`p-4 border rounded-2xl flex flex-col items-center text-center transition-all duration-300 ${
                  isUnlocked
                    ? 'bg-slate-900/60 border-emerald-500/20 shadow-md shadow-emerald-950/10'
                    : 'bg-slate-900/30 border-slate-850 opacity-60'
                }`}
              >
                {/* Badge Icon circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-500'
                  }`}
                >
                  <BadgeIcon className="w-6 h-6" />
                </div>

                <h4 className="text-xs font-black text-white">{badge.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-normal h-8 flex items-center justify-center">
                  {badge.description}
                </p>

                {/* Progress bar */}
                <div className="w-full mt-3 space-y-1">
                  <div className="flex justify-between text-[8px] font-bold text-slate-400">
                    <span>Progress</span>
                    <span>{badge.progressText}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUnlocked ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Personalized Actionable Insights */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-xl hover:border-slate-700/80 transition-all duration-300">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider mb-4">
          <Lightbulb className="w-4 h-4 text-emerald-400 animate-pulse-slow" />
          <span>Personalized Actionable Insights for {settings.name}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {personalizedInsights.map((insight, idx) => {
            const insightIconMap = {
              transport: Car,
              food: Utensils,
              energy: Zap,
              shopping: ShoppingBag,
              waste: Trash2,
              general: Sparkles,
            }
            
            const categoryColors = {
              transport: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
              food: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              energy: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              shopping: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
              waste: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
              general: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            }

            const IconComponent = insightIconMap[insight.category] || Sparkles
            const badgeColors = categoryColors[insight.category] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'

            return (
              <div
                key={idx}
                className="p-5 bg-slate-950/80 border border-slate-900 hover:border-slate-850 rounded-2xl flex flex-col justify-between gap-4 transition duration-200 hover:scale-[1.01]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${badgeColors}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    {insight.estimatedSavingKgCO2e > 0 && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-1 px-2.5 rounded-full text-[9px] font-extrabold uppercase">
                        Save -{insight.estimatedSavingKgCO2e.toFixed(1)} kg CO₂e
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{insight.title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
export default Insights
