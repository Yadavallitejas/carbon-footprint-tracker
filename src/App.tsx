import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { LogActivity } from './pages/LogActivity'
import { Insights } from './pages/Insights'
import { Settings } from './pages/Settings'
import { Onboarding } from './components/Onboarding'
import type { ActivityLog } from './logic/carbonCalculator'
import type { UserProfileSettings } from './data/emissionFactors'
import {
  getLogs,
  addLog,
  deleteLog,
  getSettings,
  saveSettings,
  seedSampleData,
  clearAllData,
} from './utils/storage'
import { calculateStreak } from './utils/dateHelpers'

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [settings, setSettings] = useState<UserProfileSettings>({
    name: 'Everyday Optimizer',
    dailyTarget: 15.0,
    region: 'Global',
    dietPreference: 'vegetarian',
    carType: 'car_petrol',
    householdSize: 1,
    unit: 'km',
    hasCompletedOnboarding: false,
  })
  const [streak, setStreak] = useState<number>(0)
  const [totalEcoPoints, setTotalEcoPoints] = useState<number>(0)

  // 1. Initial load from local storage
  useEffect(() => {
    setLogs(getLogs())
    setSettings(getSettings())
  }, [])

  // 2. Re-calculate metrics (streak & XP) whenever logs or settings change
  useEffect(() => {
    setStreak(calculateStreak(logs))

    // Calculate XP:
    // - 20 XP for every logged action
    // - 30 XP bonus for logging low-carbon items (< 1.5 kg CO2e)
    // - 50 XP bonus for consecutive days logged (streak multiplier: streak * 10 XP)
    let xp = logs.length * 20
    const lowCarbonLogs = logs.filter((l) => l.calculatedCarbon < 1.5).length
    xp += lowCarbonLogs * 30
    xp += streak * 50

    setTotalEcoPoints(xp)
  }, [logs, streak])

  // 3. Form action handlers
  const handleAddLog = (log: ActivityLog) => {
    addLog(log)
    setLogs(getLogs())
  }

  const handleDeleteLog = (id: string) => {
    deleteLog(id)
    setLogs(getLogs())
  }

  const handleSaveSettings = (updatedSettings: UserProfileSettings) => {
    saveSettings(updatedSettings)
    setSettings(getSettings())
  }

  const handleSeedData = () => {
    seedSampleData()
    setLogs(getLogs())
    setSettings(getSettings())
  }

  const handleClearData = () => {
    clearAllData()
    setLogs([])
    setSettings(getSettings()) // Restores defaults
  }

  const handleCompleteOnboarding = (onboardingSettings: UserProfileSettings) => {
    saveSettings(onboardingSettings)
    setSettings(getSettings())
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard logs={logs} settings={settings} setActiveTab={setActiveTab} />
      case 'log':
        return (
          <LogActivity 
            logs={logs} 
            onAddLog={handleAddLog} 
            onDeleteLog={handleDeleteLog} 
            unit={settings.unit} 
          />
        )
      case 'insights':
        return <Insights logs={logs} settings={settings} />
      case 'settings':
        return (
          <Settings
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onSeedData={handleSeedData}
            onClearData={handleClearData}
            logs={logs}
          />
        )
      default:
        return <Dashboard logs={logs} settings={settings} setActiveTab={setActiveTab} />
    }
  }

  // Intercept if first-run onboarding is not complete
  if (!settings.hasCompletedOnboarding) {
    return <Onboarding onComplete={handleCompleteOnboarding} />
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      streak={streak}
      totalEcoPoints={totalEcoPoints}
    >
      {renderContent()}
    </Layout>
  )
}

export default App
