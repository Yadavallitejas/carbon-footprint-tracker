import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LogActivity } from '../LogActivity'

describe('LogActivity Component Tests', () => {
  const mockOnAddLog = vi.fn()
  const mockOnDeleteLog = vi.fn()

  it('submits valid transport activity in metric (km), triggers onAddLog, and shows success modal', async () => {
    mockOnAddLog.mockClear()
    render(
      <LogActivity
        logs={[]}
        onAddLog={mockOnAddLog}
        onDeleteLog={mockOnDeleteLog}
        unit="km"
      />
    )

    // Change amount to 25
    const amountInput = screen.getByLabelText(/Amount \/ Consumption/i)
    fireEvent.change(amountInput, { target: { value: '25' } })

    // Add notes
    const notesInput = screen.getByLabelText(/Notes \(Optional\)/i)
    fireEvent.change(notesInput, { target: { value: 'Commute to office' } })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Save Log/i })
    fireEvent.click(submitButton)

    // Assert callback and saved values
    expect(mockOnAddLog).toHaveBeenCalledTimes(1)
    const passedLog = mockOnAddLog.mock.calls[0][0]
    expect(passedLog.amount).toBe(25)
    expect(passedLog.category).toBe('transport')
    expect(passedLog.notes).toBe('Commute to office')

    // Assert success micro-animation alert displays
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/Activity Recorded!/i)).toBeInTheDocument()
  })

  it('displays inline validation errors when submitting zero or negative values', () => {
    mockOnAddLog.mockClear()
    render(
      <LogActivity
        logs={[]}
        onAddLog={mockOnAddLog}
        onDeleteLog={mockOnDeleteLog}
        unit="km"
      />
    )

    // Set invalid negative value
    const amountInput = screen.getByLabelText(/Amount \/ Consumption/i)
    fireEvent.change(amountInput, { target: { value: '-10' } })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Save Log/i })
    fireEvent.click(submitButton)

    // Assert validation triggers and prevents saving
    expect(screen.getByText(/Amount must be greater than zero/i)).toBeInTheDocument()
    expect(mockOnAddLog).not.toHaveBeenCalled()
  })

  it('converts miles inputs to kilometers in stored logs when unit is set to miles', () => {
    mockOnAddLog.mockClear()
    render(
      <LogActivity
        logs={[]}
        onAddLog={mockOnAddLog}
        onDeleteLog={mockOnDeleteLog}
        unit="miles"
      />
    )

    // Input 10 miles
    const amountInput = screen.getByLabelText(/Amount \/ Consumption/i)
    fireEvent.change(amountInput, { target: { value: '10' } })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Save Log/i })
    fireEvent.click(submitButton)

    // Assert that amount is converted internally to kilometers (10 * 1.60934 = 16.0934 => rounded to 16.1 km)
    expect(mockOnAddLog).toHaveBeenCalledTimes(1)
    const passedLog = mockOnAddLog.mock.calls[0][0]
    expect(passedLog.amount).toBe(16.1)
  })
})
