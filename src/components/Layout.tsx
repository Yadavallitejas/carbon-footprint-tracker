import React from 'react'
import { LayoutDashboard, PlusCircle, Lightbulb, Settings as SettingsIcon, Flame, Trophy } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  activeTab: string
  setActiveTab: (tab: string) => void
  streak: number
  totalEcoPoints: number
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  streak,
  totalEcoPoints,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'log', label: 'Log Activity', icon: PlusCircle },
    { id: 'insights', label: 'Insights & Simulator', icon: Lightbulb },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-white">
      {/* Skip to Content link for Keyboard & Screen Reader Users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-500 focus:text-slate-950 focus:px-4 focus:py-2.5 focus:rounded-2xl focus:font-black focus:outline-none"
      >
        Skip to Content
      </a>

      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-slate-950 font-black text-xl">C</span>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Carbonly <span className="text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold uppercase tracking-wider">v1.0</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">PromptWars Challenge 3</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Eco Points */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800/80 rounded-full py-1 px-3 shadow-sm hover:border-slate-700/80 transition duration-200">
              <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse-slow" />
              <span className="text-[11px] font-bold text-slate-200">
                {totalEcoPoints} <span className="text-amber-400 font-extrabold">XP</span>
              </span>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 rounded-full py-1 px-3 shadow-sm hover:border-slate-700/80 transition duration-200">
              <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-orange-500 animate-bounce-slow' : 'text-slate-500'}`} />
              <span className="text-[11px] font-bold text-slate-200">
                {streak} {streak === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r border-slate-900/60 p-6 flex-shrink-0">
          <nav aria-label="Sidebar navigation" className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-950/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110 text-emerald-400' : 'group-hover:scale-110'}`} aria-hidden="true" />
                  {item.label}
                </button>
              )
            })}
          </nav>
          <div className="mt-8 p-4 bg-gradient-to-br from-emerald-950/30 to-slate-900/40 border border-emerald-500/10 rounded-2xl">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mb-1">
              Hackathon Demo
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal font-medium">
              Seed sample database logs in Settings to instantly preview full features and graphs.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav aria-label="Mobile navigation bar" className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 px-4 py-2 flex justify-around shadow-2xl">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-300 ${
                isActive ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[9px] font-bold tracking-tight">{item.label.split(' ')[0]}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer Landmark */}
      <footer className="relative z-10 border-t border-slate-900/60 bg-slate-950/40 py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 text-[10px] text-slate-400 font-semibold leading-normal">
          &copy; {new Date().getFullYear()} Carbonly. All rights reserved. Built client-side for absolute privacy.
        </div>
      </footer>
    </div>
  )
}
export default Layout
