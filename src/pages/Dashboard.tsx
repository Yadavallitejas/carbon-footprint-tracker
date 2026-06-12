import React from 'react'
import type { ActivityLog } from '../logic/carbonCalculator'
import { getCategoryTotals } from '../logic/carbonCalculator'
import type { UserProfileSettings } from '../data/emissionFactors'
import { SUSTAINABLE_DAILY_TARGET } from '../data/emissionFactors'
import { ProgressRing } from '../components/ProgressRing'
import { getPersonalizedInsights } from '../logic/recommendationEngine'
import { getLastDays, formatFriendlyDate } from '../utils/dateHelpers'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Car, Utensils, Zap, Trash2, ArrowRight, Award, ShoppingBag, Sparkles, Leaf } from 'lucide-react'

interface DashboardProps {
  logs: ActivityLog[]
  settings: UserProfileSettings
  setActiveTab: (tab: string) => void
}

export const Dashboard: React.FC<DashboardProps> = ({ logs, settings, setActiveTab }) => {
  const todayStr = new Date().toISOString().split('T')[0]

  // Filter logs for today
  const todayLogs = logs.filter((log) => log.date === todayStr)
  const todayTotal = todayLogs.reduce((sum, log) => sum + log.calculatedCarbon, 0)

  // Overall totals for category breakdown (all logs)
  const categoryTotals = getCategoryTotals(logs)
  const grandTotal = Object.values(categoryTotals).reduce((a, b) => a + b, 0)

  // Get top 2 personalized insights
  const personalizedInsights = getPersonalizedInsights(logs).slice(0, 2)

  // Gather the last 7 days for the trend chart
  const last7Days = getLastDays(7)
  const chartData = last7Days.map((date) => {
    const dayLogs = logs.filter((log) => log.date === date)
    const transport = dayLogs
      .filter((l) => l.category === 'transport')
      .reduce((sum, l) => sum + l.calculatedCarbon, 0)
    const food = dayLogs
      .filter((l) => l.category === 'food')
      .reduce((sum, l) => sum + l.calculatedCarbon, 0)
    const energy = dayLogs
      .filter((l) => l.category === 'energy')
      .reduce((sum, l) => sum + l.calculatedCarbon, 0)
    const shopping = dayLogs
      .filter((l) => l.category === 'shopping')
      .reduce((sum, l) => sum + l.calculatedCarbon, 0)
    const waste = dayLogs
      .filter((l) => l.category === 'waste')
      .reduce((sum, l) => sum + l.calculatedCarbon, 0)

    return {
      name: formatFriendlyDate(date),
      date,
      Food: Math.round(food * 10) / 10,
      Transport: Math.round(transport * 10) / 10,
      Energy: Math.round(energy * 10) / 10,
      Shopping: Math.round(shopping * 10) / 10,
      Waste: Math.round(waste * 10) / 10,
      Total: Math.round((food + transport + energy + shopping + waste) * 10) / 10,
    }
  })

  // Donut chart category breakdown (filter out categories with zero emissions)
  const pieData = [
    { name: 'Food', value: categoryTotals.food, color: '#10b981' },
    { name: 'Transport', value: categoryTotals.transport, color: '#3b82f6' },
    { name: 'Energy', value: categoryTotals.energy, color: '#f59e0b' },
    { name: 'Shopping', value: categoryTotals.shopping, color: '#6366f1' },
    { name: 'Waste', value: categoryTotals.waste, color: '#a855f7' },
  ].filter((item) => item.value > 0)

  // Status check vs sustainable limit
  const isSustainableExceeded = todayTotal > SUSTAINABLE_DAILY_TARGET

  const categoryColors = {
    transport: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    food: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    energy: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    shopping: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    waste: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    general: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  }

  const categoryIcons = {
    transport: Car,
    food: Utensils,
    energy: Zap,
    shopping: ShoppingBag,
    waste: Trash2,
    general: Sparkles,
  }

  return (
    <div className="space-y-6">
      {/* Hero / Landing Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-teal-950/30 border border-emerald-500/10 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 hover:border-emerald-500/20">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
            <span>The Everyday Optimizer Platform</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
            Carbonly
          </h2>
          <p className="text-xs font-extrabold text-emerald-400 tracking-wider uppercase">
            Understand. Track. Reduce.
          </p>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Carbonly is tailored specifically for the <strong>Everyday Optimizer</strong>—individuals looking to understand, track, and reduce their personal carbon footprints. By logging small everyday choices and applying personalized recommendations, you can take control of your climate impact and live sustainably.
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/20">
          <Leaf className="w-7 h-7 text-slate-950" aria-hidden="true" />
        </div>
      </div>

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Hello, {settings.name} 👋
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Optimize your emissions against the global sustainable daily target of {SUSTAINABLE_DAILY_TARGET} kg.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('log')}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-2xl hover:brightness-110 active:scale-95 transition-all duration-200 shadow-lg shadow-emerald-500/10 cursor-pointer"
        >
          <span>Log Activity</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hero Carbon Cockpit Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-1 h-full">
          <ProgressRing value={todayTotal} target={SUSTAINABLE_DAILY_TARGET} />
        </div>

        <div className="md:col-span-2 flex flex-col justify-between p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl shadow-xl hover:border-slate-700/80 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Award className="w-4 h-4 animate-pulse-slow" />
              <span>Sustainable Limit Status</span>
            </div>

            <div>
              {todayLogs.length === 0 ? (
                <h3 className="text-xl font-bold text-white leading-snug">
                  Start logging carbon data to measure your daily impact!
                </h3>
              ) : isSustainableExceeded ? (
                <h3 className="text-xl font-bold text-white leading-snug">
                  You are over the global sustainable budget today.
                </h3>
              ) : (
                <h3 className="text-xl font-bold text-white leading-snug">
                  Great job! You are living within the 1.5°C climate limit today.
                </h3>
              )}
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                To prevent catastrophic warming, climate targets suggest keeping daily individual footprint below {SUSTAINABLE_DAILY_TARGET} kg CO₂e (based on IPCC/UNEP global targets). Your custom goal is set to {settings.dailyTarget} kg.
              </p>
            </div>

            {/* Quick stats totals */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Today's Logs
                </span>
                <span className="text-lg font-black text-white mt-0.5 block">
                  {todayLogs.length}
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Total Footprint
                </span>
                <span className="text-lg font-black text-emerald-400 mt-0.5 block">
                  {grandTotal.toFixed(1)} <span className="text-[10px] font-bold text-slate-400">kg</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-Day Trend Stacked Bar */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-xl hover:border-slate-700/80 transition-all duration-300">
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
              7-Day Activity History
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 mb-4">
              Stacked emissions per day (kg CO₂e)
            </p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: 10 }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <ReferenceLine 
                  y={settings.dailyTarget} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Target', fill: '#ef4444', fontSize: 7, position: 'top' }} 
                />
                <ReferenceLine 
                  y={SUSTAINABLE_DAILY_TARGET} 
                  stroke="#10b981" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Sustainable', fill: '#10b981', fontSize: 7, position: 'top' }} 
                />
                <Bar dataKey="Food" stackId="a" fill="#10b981" />
                <Bar dataKey="Transport" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Energy" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Shopping" stackId="a" fill="#6366f1" />
                <Bar dataKey="Waste" stackId="a" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Visually hidden accessibility summary */}
          <table className="sr-only">
            <caption>Weekly Carbon Emissions History Summary Table</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Food (kg)</th>
                <th scope="col">Transport (kg)</th>
                <th scope="col">Energy (kg)</th>
                <th scope="col">Shopping (kg)</th>
                <th scope="col">Waste (kg)</th>
                <th scope="col">Total (kg)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((d) => (
                <tr key={d.date}>
                  <td>{d.name}</td>
                  <td>{d.Food}</td>
                  <td>{d.Transport}</td>
                  <td>{d.Energy}</td>
                  <td>{d.Shopping}</td>
                  <td>{d.Waste}</td>
                  <td>{d.Total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart 2: Category Donut Breakdown */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-xl hover:border-slate-700/80 transition-all duration-300">
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
              Emissions by Category
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 mb-4">
              Cumulative lifetime breakdown
            </p>
          </div>

          <div className="h-56 flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider text-center p-4">
                <span>📭</span>
                <p className="mt-1">No logs recorded yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: 10 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={6} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: 9, color: '#94a3b8' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Visually hidden accessibility summary */}
          <table className="sr-only">
            <caption>Emissions Category Cumulative Percentages Table</caption>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Emissions (kg CO2e)</th>
              </tr>
            </thead>
            <tbody>
              {pieData.map((d) => (
                <tr key={d.name}>
                  <td>{d.name}</td>
                  <td>{d.value.toFixed(1)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Personalized Recommendations */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-xl hover:border-slate-700/80 transition-all duration-300 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
            Top Recommendations
          </h3>
          <button
            onClick={() => setActiveTab('insights')}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition duration-200 cursor-pointer"
          >
            <span>View all insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personalizedInsights.length === 0 ? (
            <div className="md:col-span-2 p-5 bg-slate-950/80 border border-slate-900 rounded-2xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                🌱
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Start logging commutes or meals</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">
                  Once you log a few transit distances or diet categories, our recommendation engine will trigger custom offset plans.
                </p>
              </div>
            </div>
          ) : (
            personalizedInsights.map((insight, idx) => {
              const IconComponent = categoryIcons[insight.category] || Sparkles
              const badgeColors = categoryColors[insight.category] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'

              return (
                <div
                  key={idx}
                  className="p-5 bg-slate-950/80 border border-slate-900 hover:border-slate-850 rounded-2xl flex flex-col justify-between gap-4 transition duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center border ${badgeColors}`}>
                        <IconComponent className="w-3.5 h-3.5" />
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
            })
          )}
        </div>
      </div>
    </div>
  )
}
export default Dashboard
