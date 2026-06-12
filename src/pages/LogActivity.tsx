import React, { useState, useEffect } from 'react'
import type { ActivityLog } from '../logic/carbonCalculator'
import { calculateActivityCarbon } from '../logic/carbonEngine'
import { EMISSION_FACTORS } from '../data/emissionFactors'
import { formatFriendlyDate } from '../utils/dateHelpers'
import { Car, Utensils, Zap, Trash2, Calendar, FileText, Plus, ShoppingBag } from 'lucide-react'

interface LogActivityProps {
  logs: ActivityLog[]
  onAddLog: (log: ActivityLog) => void
  onDeleteLog: (id: string) => void
  unit: 'km' | 'miles'
}

type CategoryType = 'transport' | 'food' | 'energy' | 'shopping' | 'waste'

export const LogActivity: React.FC<LogActivityProps> = ({ logs, onAddLog, onDeleteLog, unit }) => {
  const [activeCat, setActiveCat] = useState<CategoryType>('transport')
  const [subCatId, setSubCatId] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState<string>('')
  const [previewImpact, setPreviewImpact] = useState<number>(0)
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  
  // Validation and Error states
  const [errors, setErrors] = useState<{ amount?: string; date?: string }>({})
  const [successMessage, setSuccessMessage] = useState<string>('')

  // Sync default subcategory and amounts when category changes
  useEffect(() => {
    const defaultSub = EMISSION_FACTORS[activeCat][0]?.id || ''
    setSubCatId(defaultSub)
    
    // Set standard default amounts per category (adjusted for miles if active)
    let defaultAmount = 1
    if (activeCat === 'transport') {
      defaultAmount = unit === 'miles' ? 10 : 15
    } else if (activeCat === 'energy') {
      defaultAmount = 10
    } else if (activeCat === 'waste') {
      defaultAmount = 2
    }
    
    setAmount(defaultAmount)
    setNotes('')
    setErrors({}) // Clear errors when switching tabs
  }, [activeCat, unit])

  // Calculate preview on state change
  useEffect(() => {
    if (subCatId && amount > 0 && !isNaN(amount)) {
      // If imperial mode is selected, convert input miles to metric km for carbon calculations
      const calculationAmount = activeCat === 'transport' && unit === 'miles' ? amount * 1.60934 : amount
      const footprint = calculateActivityCarbon(activeCat, subCatId, calculationAmount)
      setPreviewImpact(footprint)
    } else {
      setPreviewImpact(0)
    }
  }, [activeCat, subCatId, amount, unit])

  // Dynamic input validators
  const handleAmountChange = (val: number) => {
    setAmount(val)
    if (isNaN(val)) {
      setErrors((prev) => ({ ...prev, amount: 'Amount is required.' }))
    } else if (val <= 0) {
      setErrors((prev) => ({ ...prev, amount: 'Amount must be greater than zero.' }))
    } else {
      setErrors((prev) => ({ ...prev, amount: undefined }))
    }
  }

  const handleDateChange = (val: string) => {
    setDate(val)
    if (!val) {
      setErrors((prev) => ({ ...prev, date: 'Date is required.' }))
    } else {
      const today = new Date().toISOString().split('T')[0]
      if (val > today) {
        setErrors((prev) => ({ ...prev, date: 'Date cannot be in the future.' }))
      } else {
        setErrors((prev) => ({ ...prev, date: undefined }))
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Run full validation check
    const hasAmountError = isNaN(amount) || amount <= 0
    const today = new Date().toISOString().split('T')[0]
    const hasDateError = !date || date > today

    const newErrors: { amount?: string; date?: string } = {}
    if (isNaN(amount)) newErrors.amount = 'Amount is required.'
    else if (amount <= 0) newErrors.amount = 'Amount must be greater than zero.'

    if (!date) newErrors.date = 'Date is required.'
    else if (date > today) newErrors.date = 'Date cannot be in the future.'

    if (hasAmountError || hasDateError) {
      setErrors(newErrors)
      return
    }

    const factorName = EMISSION_FACTORS[activeCat].find((f) => f.id === subCatId)?.name || ''
    // Save metric distance internally
    const dbAmount = activeCat === 'transport' && unit === 'miles' ? Math.round(amount * 1.60934 * 10) / 10 : amount

    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date,
      category: activeCat,
      subCategoryId: subCatId,
      subCategoryName: factorName,
      amount: dbAmount,
      calculatedCarbon: previewImpact,
      notes: notes.trim() || undefined,
    }

    onAddLog(newLog)

    // Setup success banner text
    let unitType = 'choice'
    if (activeCat === 'transport') unitType = 'trip'
    else if (activeCat === 'food') unitType = 'meal'
    else if (activeCat === 'energy') unitType = 'energy use'
    else if (activeCat === 'shopping') unitType = 'shopping order'

    setSuccessMessage(`This ${unitType} added ${previewImpact.toFixed(1)} kg CO₂e to your day.`)

    // Trigger visual success notification
    setShowConfetti(true)
    setTimeout(() => {
      setShowConfetti(false)
      setSuccessMessage('')
    }, 3500)

    // Reset notes
    setNotes('')
  }

  const getUnitDisplay = () => {
    const defaultUnit = EMISSION_FACTORS[activeCat].find((f) => f.id === subCatId)?.unit || ''
    if (activeCat === 'transport' && defaultUnit === 'km' && unit === 'miles') {
      return 'mi'
    }
    return defaultUnit
  }

  const categoryIcons = {
    transport: Car,
    food: Utensils,
    energy: Zap,
    shopping: ShoppingBag,
    waste: Trash2,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Log Daily Activity</h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Select a category to record your consumption and immediately view its carbon equivalent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* Input Form Card */}
        <div className="md:col-span-3 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          {/* Confetti micro-interaction overlay */}
          {showConfetti && (
            <div 
              role="alert" 
              aria-live="assertive"
              className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center backdrop-blur-sm transition-all duration-300 z-10"
            >
              <div className="bg-slate-900 border border-emerald-500/20 px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center max-w-xs text-center">
                <span className="text-3xl animate-bounce">🌱</span>
                <span className="text-xs font-black text-white mt-2">Activity Recorded!</span>
                <span className="text-[10px] text-emerald-400 font-semibold mt-1.5 leading-relaxed">
                  {successMessage}
                </span>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div 
            role="tablist" 
            aria-label="Activity categories" 
            className="grid grid-cols-5 gap-2 mb-6"
          >
            {(['transport', 'food', 'energy', 'shopping', 'waste'] as CategoryType[]).map((cat) => {
              const Icon = categoryIcons[cat]
              const isSelected = activeCat === cat
              return (
                <button
                  key={cat}
                  id={`tab-${cat}`}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`panel-${cat}`}
                  type="button"
                  onClick={() => setActiveCat(cat)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold'
                      : 'border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700/60'
                  }`}
                >
                  <Icon className="w-4 h-4 pointer-events-none" aria-hidden="true" />
                  <span className="text-[10px] font-bold capitalize pointer-events-none">{cat}</span>
                </button>
              )
            })}
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            id={`panel-${activeCat}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeCat}`}
          >
            {/* Subcategory selection */}
            <div>
              <label 
                htmlFor="log-type" 
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5"
              >
                Type
              </label>
              <select
                id="log-type"
                value={subCatId}
                onChange={(e) => setSubCatId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-850 rounded-2xl px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {EMISSION_FACTORS[activeCat].map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.value} kg CO₂e/{option.id === 'car_petrol' || option.id === 'car_diesel' || option.id === 'car_electric' || option.id === 'bus' || option.id === 'train_metro' || option.id === 'flight_short' || option.id === 'flight_long' ? getUnitDisplay() : option.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Slider / Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label 
                  htmlFor="log-amount" 
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  Amount / Consumption
                </label>
                <span className="text-xs font-extrabold text-white">
                  {isNaN(amount) ? 0 : amount} {getUnitDisplay()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  id="log-amount-slider"
                  aria-label="Drag to adjust amount"
                  min="0.5"
                  max={
                    activeCat === 'transport'
                      ? (unit === 'miles' ? '120' : '200')
                      : activeCat === 'energy'
                      ? '100'
                      : activeCat === 'shopping'
                      ? '10'
                      : '15'
                  }
                  step={activeCat === 'food' || activeCat === 'shopping' ? '1' : '0.5'}
                  value={isNaN(amount) ? 0.5 : amount}
                  onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-500 bg-slate-950/80 border border-slate-850 h-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  id="log-amount"
                  min="0.1"
                  step="0.1"
                  value={isNaN(amount) ? '' : amount}
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? 'amount-error' : undefined}
                  onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
                  className={`w-20 bg-slate-950/80 border rounded-xl px-2.5 py-1 text-center text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    errors.amount ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-850'
                  }`}
                />
              </div>
              {errors.amount && (
                <p 
                  id="amount-error" 
                  role="alert" 
                  aria-live="assertive"
                  className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1"
                >
                  <span>⚠️</span> {errors.amount}
                </p>
              )}
            </div>

            {/* Date Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="log-date" 
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5"
                >
                  Date
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" aria-hidden="true" />
                  <input
                    type="date"
                    id="log-date"
                    value={date}
                    aria-invalid={!!errors.date}
                    aria-describedby={errors.date ? 'date-error' : undefined}
                    onChange={(e) => handleDateChange(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full bg-slate-950/80 border rounded-2xl pl-9 pr-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.date ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-850'
                    }`}
                  />
                </div>
                {errors.date && (
                  <p 
                    id="date-error" 
                    role="alert" 
                    aria-live="assertive"
                    className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1"
                  >
                    <span>⚠️</span> {errors.date}
                  </p>
                )}
              </div>
              <div>
                <label 
                  htmlFor="log-notes" 
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5"
                >
                  Notes (Optional)
                </label>
                <div className="relative flex items-center">
                  <FileText className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    id="log-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Work commute"
                    className="w-full bg-slate-950/80 border border-slate-850 rounded-2xl pl-9 pr-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-800/40">
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-bold block">
                  Estimated Footprint
                </span>
                <span className="text-lg font-black text-emerald-400">
                  +{previewImpact.toFixed(2)} kg CO₂e
                </span>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-2xl hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition duration-200 cursor-pointer shadow-lg shadow-emerald-500/5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Log</span>
              </button>
            </div>
          </form>
        </div>

        {/* Recent logs breakdown column */}
        <div className="md:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-xl hover:border-slate-700/80 transition-all duration-300 flex flex-col max-h-[385px]">
          <h3 className="text-sm font-extrabold text-white tracking-wide mb-3 flex items-center justify-between">
            <span>Recent Activities</span>
            <span className="text-[9px] bg-slate-950 px-2 py-0.5 border border-slate-800 rounded-md font-bold text-slate-400">
              {logs.length} logged
            </span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <span className="text-xl">📭</span>
                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">
                  No logs recorded yet
                </p>
                <p className="text-[9px] text-slate-650 leading-relaxed font-semibold mt-0.5 max-w-[150px]">
                  Fill out the form to add your first daily carbon log.
                </p>
              </div>
            ) : (
              logs.slice(0, 10).map((log) => {
                const Icon = categoryIcons[log.category] || FileText
                const colorClasses = {
                  transport: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  food: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  energy: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                  shopping: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                  waste: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                }

                // Show imperial distances in the logs list if unit is miles
                const displayedAmount = log.category === 'transport' && unit === 'miles' 
                  ? Math.round(log.amount / 1.60934 * 10) / 10 
                  : log.amount
                const displayedUnit = log.category === 'transport' && unit === 'miles' 
                  ? 'mi' 
                  : (EMISSION_FACTORS[log.category].find((f) => f.id === log.subCategoryId)?.unit || '')

                return (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl flex items-center justify-between gap-3 group hover:border-slate-800 transition duration-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorClasses[log.category]}`}>
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold text-white line-clamp-1">
                            {log.subCategoryName}
                          </span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase">
                            {formatFriendlyDate(log.date)}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium line-clamp-1">
                          {displayedAmount} {displayedUnit}
                          {log.notes ? ` • ${log.notes}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-slate-200">
                        {log.calculatedCarbon.toFixed(1)} kg
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteLog(log.id)}
                        className="p-1 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded transition duration-200 opacity-0 group-hover:opacity-100 cursor-pointer focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-rose-500 focus-visible:outline-none"
                        title="Delete entry"
                        aria-label={`Delete ${log.subCategoryName} entry`}
                      >
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default LogActivity
