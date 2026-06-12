import React, { useState } from 'react'
import type { UserProfileSettings } from '../data/emissionFactors'
import { PrivacyNote } from './PrivacyNote'
import { ArrowRight, ArrowLeft, Leaf, User, Car, Utensils, Shield, Users, Check } from 'lucide-react'

interface OnboardingProps {
  onComplete: (onboardingSettings: UserProfileSettings) => void
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1)
  const [name, setName] = useState<string>('')
  const [carType, setCarType] = useState<string>('car_petrol')
  const [dietPreference, setDietPreference] = useState<string>('vegetarian')
  const [householdSize, setHouseholdSize] = useState<number>(1)
  const [unit, setUnit] = useState<'km' | 'miles'>('km')

  const handleNext = () => {
    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handleFinish = () => {
    const finalSettings: UserProfileSettings = {
      name: name.trim() || 'Everyday Optimizer',
      dailyTarget: 15.0, // standard daily target
      region: 'Global',
      dietPreference,
      carType,
      householdSize: householdSize > 0 ? householdSize : 1,
      unit,
      hasCompletedOnboarding: true,
    }
    onComplete(finalSettings)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative font-sans select-none overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Onboarding Box */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-all duration-300">
        
        {/* Progress Bar Header */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight">Carbonly</h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Setup Wizard</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-950 border border-slate-800 rounded-full py-1 px-3">
            <span>Step {step} of 3</span>
          </div>
        </div>

        {/* STEP 1: Welcome Screen */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                Welcome to the carbon tracking journey! 🌍
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Carbonly is built for **"The Everyday Optimizer"**—someone who wants to make meaningful progress toward a low-carbon lifestyle through simple daily actions and habits.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex gap-3 items-center">
                <span className="text-xl">📊</span>
                <div>
                  <h3 className="text-xs font-bold text-white">Interactive Carbon Budget</h3>
                  <p className="text-[10px] text-slate-400 font-semibold leading-normal mt-0.5">
                    Track your daily emissions against the global sustainable limits in real-time.
                  </p>
                </div>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex gap-3 items-center">
                <span className="text-xl">💡</span>
                <div>
                  <h3 className="text-xs font-bold text-white">Personalized Recommendations</h3>
                  <p className="text-[10px] text-slate-400 font-semibold leading-normal mt-0.5">
                    Get customized green suggestions based on your logged diets and commutes.
                  </p>
                </div>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex gap-3 items-center">
                <span className="text-xl">🏆</span>
                <div>
                  <h3 className="text-xs font-bold text-white">Gamified Badges & XP</h3>
                  <p className="text-[10px] text-slate-400 font-semibold leading-normal mt-0.5">
                    Earn points and achievements as you lock in sustainable daily habits.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Preferences Setup Screen */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-white tracking-tight">Configure Your Habits</h2>
              <p className="text-[10px] text-slate-400 font-semibold">
                This helps us estimate your default suggestion benchmarks.
              </p>
            </div>

            <div className="space-y-4">
              {/* Profile Name */}
              <div>
                <label htmlFor="onb-name" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Your Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    id="onb-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eco Optimizer"
                    className="w-full bg-slate-950/80 border border-slate-850 rounded-2xl pl-9 pr-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Commute Mode */}
              <div>
                <label htmlFor="onb-commute" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Default Commute Method
                </label>
                <div className="relative flex items-center">
                  <Car className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                  <select
                    id="onb-commute"
                    value={carType}
                    onChange={(e) => setCarType(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-850 rounded-2xl pl-9 pr-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="car_petrol">Petrol Car</option>
                    <option value="car_diesel">Diesel Car</option>
                    <option value="car_electric">Electric Vehicle (EV)</option>
                    <option value="bus">Public Bus</option>
                    <option value="train_metro">Train / Metro</option>
                    <option value="bike_walk">Bicycle / Walking</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Diet Preferences */}
                <div>
                  <label htmlFor="onb-diet" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Diet Choice
                  </label>
                  <div className="relative flex items-center">
                    <Utensils className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                    <select
                      id="onb-diet"
                      value={dietPreference}
                      onChange={(e) => setDietPreference(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-850 rounded-2xl pl-9 pr-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="meat_heavy">Meat-Heavy</option>
                      <option value="mixed">Mixed Diet</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                    </select>
                  </div>
                </div>

                {/* Household Size */}
                <div>
                  <label htmlFor="onb-household" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Household Size
                  </label>
                  <div className="relative flex items-center">
                    <Users className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                    <input
                      type="number"
                      id="onb-household"
                      min="1"
                      value={householdSize}
                      onChange={(e) => setHouseholdSize(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950/80 border border-slate-850 rounded-2xl pl-9 pr-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Units selection */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Preferred Distance Units
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-white font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="onb-unit"
                      checked={unit === 'km'}
                      onChange={() => setUnit('km')}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                    <span>Kilometers (km)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="onb-unit"
                      checked={unit === 'miles'}
                      onChange={() => setUnit('miles')}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                    <span>Miles (mi)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs rounded-2xl hover:bg-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-2xl hover:brightness-110 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Privacy & Finish Screen */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>Privacy & Offline Safety</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                At Carbonly, we believe your habits and schedules should be private.
              </p>
            </div>

            {/* Embed Privacy Note */}
            <PrivacyNote />

            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-[10px] text-emerald-400 font-semibold leading-normal">
                Everything is configured! Your settings targets will fall back to default sustainable benchmarks (5.48 kg CO₂e) to measure progress.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs rounded-2xl hover:bg-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-2xl hover:brightness-110 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <span>Start Tracking</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default Onboarding
