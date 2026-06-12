import React, { useState } from 'react'
import type { ActivityLog } from '../logic/carbonCalculator'
import { getLastDays, formatFriendlyDate } from '../utils/dateHelpers'

interface CarbonChartProps {
  logs: ActivityLog[]
  dailyTarget: number
}

interface DailyStack {
  date: string
  friendlyDate: string
  transport: number
  food: number
  energy: number
  shopping: number
  waste: number
  total: number
}

export const CarbonChart: React.FC<CarbonChartProps> = ({ logs, dailyTarget }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // 1. Gather the last 7 days
  const last7Days = getLastDays(7)

  // 2. Aggregate logs per day by category
  const dailyStacks: DailyStack[] = last7Days.map((date) => {
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

    const total = Math.round((transport + food + energy + shopping + waste) * 10) / 10

    return {
      date,
      friendlyDate: formatFriendlyDate(date),
      transport: Math.round(transport * 10) / 10,
      food: Math.round(food * 10) / 10,
      energy: Math.round(energy * 10) / 10,
      shopping: Math.round(shopping * 10) / 10,
      waste: Math.round(waste * 10) / 10,
      total,
    }
  })

  // 3. Find the maximum height for scaling
  const maxEmissions = Math.max(
    ...dailyStacks.map((d) => d.total),
    dailyTarget,
    10 // base minimum scale height
  )
  const chartMax = maxEmissions * 1.15 // add 15% breathing room at top

  // 4. SVG Layout dimensions
  const width = 500
  const height = 240
  const paddingLeft = 35
  const paddingRight = 15
  const paddingTop = 20
  const paddingBottom = 30

  const plotWidth = width - paddingLeft - paddingRight
  const plotHeight = height - paddingTop - paddingBottom

  // Target line Y coordinate
  const targetY = paddingTop + plotHeight - (dailyTarget / chartMax) * plotHeight

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-xl w-full hover:border-slate-700/80 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">Weekly Activity Trend</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Daily emissions stacked by category (kg CO₂e)
          </p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span className="text-slate-300">Food</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span className="text-slate-300">Transport</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span className="text-slate-300">Energy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
            <span className="text-slate-300">Shopping</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-purple-500" />
            <span className="text-slate-300">Waste</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-red-500" />
            <span className="text-rose-400 font-bold">Target</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label="Stacked bar chart showing weekly carbon footprint history per day by category"
        >
          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const gridVal = chartMax * ratio
            const y = paddingTop + plotHeight - ratio * plotHeight
            return (
              <g key={index} className="opacity-20">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#475569"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  className="text-[9px] font-semibold"
                >
                  {Math.round(gridVal)}
                </text>
              </g>
            )
          })}

          {/* Daily Budget Target Line */}
          <g>
            <line
              x1={paddingLeft}
              y1={targetY}
              x2={width - paddingRight}
              y2={targetY}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="drop-shadow-[0_2px_4px_rgba(239,68,68,0.3)]"
            />
            <text
              x={width - paddingRight - 4}
              y={targetY - 5}
              textAnchor="end"
              fill="#ef4444"
              className="text-[8px] font-extrabold uppercase tracking-wide bg-slate-900 px-1"
            >
              Target ({dailyTarget} kg)
            </text>
          </g>

          {/* Render Stacks */}
          {dailyStacks.map((stack, i) => {
            const colWidth = 26
            const colSpacing = plotWidth / dailyStacks.length
            const x = paddingLeft + i * colSpacing + (colSpacing - colWidth) / 2

            // Calculate heights for stacked categories
            const hFood = (stack.food / chartMax) * plotHeight
            const hTransport = (stack.transport / chartMax) * plotHeight
            const hEnergy = (stack.energy / chartMax) * plotHeight
            const hShopping = (stack.shopping / chartMax) * plotHeight
            const hWaste = (stack.waste / chartMax) * plotHeight

            // Y offsets for stack building
            let currentY = paddingTop + plotHeight
            const yFood = currentY - hFood
            currentY -= hFood
            const yTransport = currentY - hTransport
            currentY -= hTransport
            const yEnergy = currentY - hEnergy
            currentY -= hEnergy
            const yShopping = currentY - hShopping
            currentY -= hShopping
            const yWaste = currentY - hWaste

            const isHovered = hoveredIndex === i

            return (
              <g
                key={stack.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Invisible hover capture column */}
                <rect
                  x={x - (colSpacing - colWidth) / 2}
                  y={paddingTop}
                  width={colSpacing}
                  height={plotHeight}
                  fill="transparent"
                />

                {/* Stack Segment: Waste */}
                {hWaste > 0 && (
                  <rect
                    x={x}
                    y={yWaste}
                    width={colWidth}
                    height={hWaste}
                    className="fill-purple-500 hover:brightness-110 transition-all duration-200"
                    rx={hEnergy + hTransport + hFood + hShopping === 0 ? 3 : 0}
                  />
                )}

                {/* Stack Segment: Shopping */}
                {hShopping > 0 && (
                  <rect
                    x={x}
                    y={yShopping}
                    width={colWidth}
                    height={hShopping}
                    className="fill-indigo-500 hover:brightness-110 transition-all duration-200"
                    rx={hEnergy + hTransport + hFood === 0 && hWaste === 0 ? 3 : 0}
                  />
                )}

                {/* Stack Segment: Energy */}
                {hEnergy > 0 && (
                  <rect
                    x={x}
                    y={yEnergy}
                    width={colWidth}
                    height={hEnergy}
                    className="fill-amber-500 hover:brightness-110 transition-all duration-200"
                    rx={hTransport + hFood === 0 && hShopping === 0 && hWaste === 0 ? 3 : 0}
                  />
                )}

                {/* Stack Segment: Transport */}
                {hTransport > 0 && (
                  <rect
                    x={x}
                    y={yTransport}
                    width={colWidth}
                    height={hTransport}
                    className="fill-blue-500 hover:brightness-110 transition-all duration-200"
                    rx={hFood === 0 && hEnergy === 0 && hShopping === 0 && hWaste === 0 ? 3 : 0}
                  />
                )}

                {/* Stack Segment: Food */}
                {hFood > 0 && (
                  <rect
                    x={x}
                    y={yFood}
                    width={colWidth}
                    height={hFood}
                    className="fill-emerald-500 hover:brightness-110 transition-all duration-200"
                    rx={3}
                  />
                )}

                {/* Hover overlay highlights */}
                {isHovered && (
                  <rect
                    x={x - 2}
                    y={paddingTop - 4}
                    width={colWidth + 4}
                    height={plotHeight + 8}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    className="opacity-40"
                  />
                )}

                {/* X Axis Labels */}
                <text
                  x={x + colWidth / 2}
                  y={height - paddingBottom + 16}
                  textAnchor="middle"
                  fill={isHovered ? '#ffffff' : '#94a3b8'}
                  className="text-[9px] font-bold transition-all duration-200"
                >
                  {stack.friendlyDate}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-slate-800 rounded-xl px-3 py-2 text-[10px] shadow-2xl flex flex-col gap-0.5 text-slate-300 font-semibold z-10 w-44 backdrop-blur-md">
            <div className="font-extrabold text-white text-xs border-b border-slate-800 pb-1 mb-1">
              {dailyStacks[hoveredIndex].friendlyDate} Breakdown
            </div>
            <div className="flex justify-between items-center">
              <span>Food:</span>
              <span className="text-emerald-400">{dailyStacks[hoveredIndex].food.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Transport:</span>
              <span className="text-blue-400">{dailyStacks[hoveredIndex].transport.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Energy:</span>
              <span className="text-amber-400">{dailyStacks[hoveredIndex].energy.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Shopping:</span>
              <span className="text-indigo-400">{dailyStacks[hoveredIndex].shopping.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Waste:</span>
              <span className="text-purple-400">{dailyStacks[hoveredIndex].waste.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between items-center font-bold text-white border-t border-slate-850 mt-1 pt-1">
              <span>Total:</span>
              <span className={dailyStacks[hoveredIndex].total > dailyTarget ? 'text-rose-400' : 'text-emerald-400'}>
                {dailyStacks[hoveredIndex].total.toFixed(1)} kg
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default CarbonChart
