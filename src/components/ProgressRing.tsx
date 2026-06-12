import React from 'react'

interface ProgressRingProps {
  value: number
  target: number
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ value, target }) => {
  const radius = 80
  const stroke = 12
  const normalizedValue = Math.min(value, target)
  const percentage = target > 0 ? (normalizedValue / target) * 100 : 0
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Dynamic colors based on budget usage
  let strokeColor = 'stroke-emerald-500' // green
  let glowColor = 'shadow-emerald-500/20'
  let bgColor = 'bg-emerald-500/10'

  if (value > target) {
    strokeColor = 'stroke-rose-500' // red (over limit)
    glowColor = 'shadow-rose-500/20'
    bgColor = 'bg-rose-500/10'
  } else if (value > target * 0.8) {
    strokeColor = 'stroke-amber-500' // amber (nearing limit)
    glowColor = 'shadow-amber-500/20'
    bgColor = 'bg-amber-500/10'
  }

  const netValue = Math.max(0, target - value)
  const isOver = value > target
  const overAmount = Math.abs(value - target)

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl shadow-xl transition-all duration-300 hover:border-slate-700/80">
      <div className="relative flex items-center justify-center w-52 h-52">
        {/* Outer subtle glow */}
        <div className={`absolute inset-4 rounded-full ${bgColor} ${glowColor} blur-xl`} />

        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            className="text-slate-800"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="100"
            cy="100"
          />
          {/* Active progress circle */}
          <circle
            className={`transition-all duration-700 ease-out ${strokeColor}`}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="100"
            cy="100"
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {value.toFixed(1)}
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            kg CO₂e
          </span>
          <div className="mt-2 h-px w-8 bg-slate-800" />
          <span className="text-[10px] text-slate-500 mt-1.5 uppercase font-medium">
            Goal: {target} kg
          </span>
        </div>
      </div>

      {/* Status banner */}
      <div className="mt-5 text-center">
        {isOver ? (
          <p className="text-sm font-semibold text-rose-400 flex items-center gap-1 justify-center">
            <span>⚠️</span> {overAmount.toFixed(1)} kg CO₂e over budget
          </p>
        ) : (
          <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1 justify-center">
            <span>🌱</span> {netValue.toFixed(1)} kg CO₂e allowance left
          </p>
        )}
        <p className="text-xs text-slate-400 mt-1 font-medium">
          {percentage.toFixed(0)}% of daily allowance consumed
        </p>
      </div>
    </div>
  )
}
export default ProgressRing
