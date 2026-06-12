import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dashboard } from '../Dashboard'
import type { ActivityLog } from '../../logic/carbonCalculator'
import type { UserProfileSettings } from '../../data/emissionFactors'
import type { ReactNode } from 'react'

// Mock Recharts elements since jsdom does not support SVG layout dimensions or rendering.
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    BarChart: ({ children }: { children: ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Tooltip: () => <div />,
    ReferenceLine: () => <div />,
    PieChart: ({ children }: { children: ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div />,
    Cell: () => <div />,
    Legend: () => <div />,
  }
})

describe('Dashboard Component Tests', () => {
  const mockSettings: UserProfileSettings = {
    name: 'Everyday Hero',
    dailyTarget: 15.0,
    region: 'Global',
    dietPreference: 'vegetarian',
    carType: 'car_petrol',
    householdSize: 1,
    unit: 'km',
    hasCompletedOnboarding: true,
  }

  it('renders name greeting, daily targets, and total logged footprint correctly', () => {
    const todayStr = new Date().toISOString().split('T')[0]
    const mockLogs: ActivityLog[] = [
      { id: '1', date: todayStr, category: 'food', subCategoryId: 'vegan', subCategoryName: 'Vegan', amount: 1, calculatedCarbon: 2.5 },
      { id: '2', date: todayStr, category: 'transport', subCategoryId: 'car_petrol', subCategoryName: 'Petrol Car', amount: 50, calculatedCarbon: 9.0 }
    ]

    render(
      <Dashboard
        logs={mockLogs}
        settings={mockSettings}
        setActiveTab={vi.fn()}
      />
    )

    // Assert profile name is displayed in greeting
    expect(screen.getByText(/Hello, Everyday Hero/i)).toBeInTheDocument()

    // Assert carbon target information is visible
    expect(screen.getByText(/sustainable daily target/i)).toBeInTheDocument()

    // Assert total carbon is aggregated correctly (2.5 + 9.0 = 11.5 kg CO2e)
    expect(screen.getByText(/Total Footprint/i)).toBeInTheDocument()
    expect(screen.getAllByText(/11.5/i).length).toBeGreaterThanOrEqual(1)

    // Assert daily count matches logs size
    expect(screen.getByText(/Today's Logs/i)).toBeInTheDocument()
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1)
  })

  it('renders prompt instructions when logs database is empty', () => {
    render(
      <Dashboard
        logs={[]}
        settings={mockSettings}
        setActiveTab={vi.fn()}
      />
    )

    // Assert empty-state message appears
    expect(screen.getByText(/Start logging carbon data/i)).toBeInTheDocument()
  })
})
