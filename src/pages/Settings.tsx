import React, { useState } from 'react'
import type { UserProfileSettings } from '../data/emissionFactors'
import { PrivacyNote } from '../components/PrivacyNote'
import { Database, AlertTriangle, Check, RefreshCcw, Download } from 'lucide-react'
import type { ActivityLog } from '../logic/carbonCalculator'

interface SettingsProps {
  settings: UserProfileSettings
  onSaveSettings: (settings: UserProfileSettings) => void
  onSeedData: () => void
  onClearData: () => void
  logs: ActivityLog[] // to allow data export
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onSaveSettings,
  onSeedData,
  onClearData,
  logs,
}) => {
  const [name, setName] = useState<string>(settings.name)
  const [dailyTarget, setDailyTarget] = useState<number>(settings.dailyTarget)
  const [region, setRegion] = useState<string>(settings.region || 'Global')
  
  // New preference states
  const [carType, setCarType] = useState<string>(settings.carType || 'car_petrol')
  const [dietPreference, setDietPreference] = useState<string>(settings.dietPreference || 'vegetarian')
  const [householdSize, setHouseholdSize] = useState<number>(settings.householdSize || 1)
  const [unit, setUnit] = useState<'km' | 'miles'>(settings.unit || 'km')

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)
  const [seedSuccess, setSeedSuccess] = useState<boolean>(false)
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveSettings({
      name: name.trim() || 'Everyday Optimizer',
      dailyTarget: dailyTarget > 0 ? dailyTarget : 15.0,
      region,
      dietPreference,
      carType,
      householdSize: householdSize > 0 ? householdSize : 1,
      unit,
      hasCompletedOnboarding: settings.hasCompletedOnboarding,
    })

    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const handleSeed = () => {
    onSeedData()
    setSeedSuccess(true)
    setTimeout(() => setSeedSuccess(false), 2000)
  }

  const handleClear = () => {
    onClearData()
    setConfirmDelete(false)
    // Force reload to trigger Onboarding wizard again
    window.location.reload()
  }

  // Trigger browser download of logs and settings
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ logs, settings }, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `carbonly_export_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Configuration Settings</h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Customize your daily tracking budget, manage database files, and seed hackathon configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* Profile Details Form */}
        <form
          onSubmit={handleSubmit}
          className="md:col-span-3 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4 hover:border-slate-700/80 transition-all duration-300"
        >
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800/60 pb-2.5">
            Optimizer Profile
          </h3>

          {/* Name */}
          <div>
            <label htmlFor="set-name" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Profile Name
            </label>
            <input
              type="text"
              id="set-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-850 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g. Everyday Optimizer"
            />
          </div>

          {/* Daily CO2 Target */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="set-target" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Daily Carbon Target (kg CO₂e)
              </label>
              <span className="text-xs font-extrabold text-white">{dailyTarget} kg</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                id="set-target-slider"
                min="5"
                max="50"
                step="1"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(parseInt(e.target.value))}
                className="flex-1 accent-emerald-500 bg-slate-950/80 border border-slate-850 h-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                id="set-target"
                min="5"
                max="100"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(parseInt(e.target.value) || 15)}
                className="w-20 bg-slate-950/80 border border-slate-850 rounded-xl px-2.5 py-1 text-center text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* New Preferences Setup Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Diet preferences */}
            <div>
              <label htmlFor="set-diet" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Diet Preference
              </label>
              <select
                id="set-diet"
                value={dietPreference}
                onChange={(e) => setDietPreference(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-850 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="meat_heavy">High Meat</option>
                <option value="mixed">Mixed Diet</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>

            {/* Commute Mode */}
            <div>
              <label htmlFor="set-commute" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Commute Mode
              </label>
              <select
                id="set-commute"
                value={carType}
                onChange={(e) => setCarType(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-850 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="car_petrol">Petrol Car</option>
                <option value="car_diesel">Diesel Car</option>
                <option value="car_electric">Electric Vehicle (EV)</option>
                <option value="bus">Public Bus</option>
                <option value="train_metro">Train / Metro</option>
                <option value="bike_walk">Bicycle / Walking</option>
              </select>
            </div>

            {/* Household size */}
            <div>
              <label htmlFor="set-household" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Household Size
              </label>
              <input
                type="number"
                id="set-household"
                min="1"
                value={householdSize}
                onChange={(e) => setHouseholdSize(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950/80 border border-slate-850 rounded-2xl px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Distance units */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Distance Units
              </label>
              <div className="flex gap-4 py-2">
                <label className="flex items-center gap-1.5 text-xs text-white font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="set-unit"
                    checked={unit === 'km'}
                    onChange={() => setUnit('km')}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                  <span>Kilometers (km)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-white font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="set-unit"
                    checked={unit === 'miles'}
                    onChange={() => setUnit('miles')}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                  <span>Miles (mi)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Region settings */}
          <div>
            <label htmlFor="set-region" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Energy Grid Region
            </label>
            <select
              id="set-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-850 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="Global">Global Average Grid (0.38 kg CO₂e/kWh)</option>
              <option value="NorthAmerica">US / Canada Grid (0.42 kg CO₂e/kWh)</option>
              <option value="Europe">EU Green Grid (0.24 kg CO₂e/kWh)</option>
              <option value="Asia">Asia Coal-Heavy Grid (0.58 kg CO₂e/kWh)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800/40 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Profile Settings Saved
              </span>
            ) : (
              <div />
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-2xl hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Save Preferences
            </button>
          </div>
        </form>

        {/* Data Seeding & Administration Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4 hover:border-slate-700/80 transition-all duration-300">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800/60 pb-2.5">
              Storage & Backups
            </h3>

            {/* Export data */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Export Carbon Data
              </span>
              <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                Download your logged footprints database and settings profiles as a JSON file.
              </p>
              <button
                type="button"
                onClick={handleExportData}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-750 text-slate-200 hover:text-white text-xs font-bold rounded-2xl transition duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Data (JSON)</span>
              </button>
            </div>

            {/* Seed demo data */}
            <div className="space-y-2 pt-3 border-t border-slate-800/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Generate Mock Activity
              </span>
              <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                Generate a random 7-day log history to test the graphs instantly.
              </p>
              <button
                type="button"
                onClick={handleSeed}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-750 text-slate-200 hover:text-white text-xs font-bold rounded-2xl transition duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {seedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Database Seeded!</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Seed 7-Day Demo Logs</span>
                  </>
                )}
              </button>
            </div>

            {/* Reset all data */}
            <div className="space-y-2 pt-3 border-t border-slate-800/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Reset Application Cache
              </span>
              <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                Wipes all stored logs and triggers the onboarding screen again.
              </p>

              {confirmDelete ? (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
                  <p className="text-[9px] font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Confirm database purge?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] rounded-lg transition duration-150 cursor-pointer"
                    >
                      Purge Cache
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-1.5 bg-slate-950 border border-slate-850 text-slate-400 font-extrabold text-[10px] rounded-lg transition duration-150 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-950/20 hover:bg-rose-950/30 border border-rose-900/30 hover:border-rose-900/50 text-rose-400 text-xs font-bold rounded-2xl transition duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>Wipe All Database Logs</span>
                </button>
              )}
            </div>
          </div>

          {/* Privacy Note Widget */}
          <PrivacyNote />
        </div>
      </div>
    </div>
  )
}
export default Settings
