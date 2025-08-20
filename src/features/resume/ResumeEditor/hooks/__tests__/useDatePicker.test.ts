import { renderHook, act } from '@testing-library/react'
import { useDatePicker } from '../useDatePicker'

describe('useDatePicker', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDatePicker())
    
    expect(result.current.datePickerOpen).toBe(false)
    expect(result.current.datePickerPosition).toEqual({ x: 0, y: 0 })
    expect(result.current.datePickerCallbackRef.current).toBeNull()
  })

  it('should open date picker with position and callback', () => {
    const { result } = renderHook(() => useDatePicker())
    const mockCallback = jest.fn()
    const position = { x: 100, y: 200 }
    
    act(() => {
      result.current.openDatePicker(position, mockCallback)
    })
    
    expect(result.current.datePickerOpen).toBe(true)
    expect(result.current.datePickerPosition).toEqual(position)
    expect(result.current.datePickerCallbackRef.current).toBe(mockCallback)
  })

  it('should close date picker and clear callback', () => {
    const { result } = renderHook(() => useDatePicker())
    const mockCallback = jest.fn()
    
    // First open the date picker
    act(() => {
      result.current.openDatePicker({ x: 0, y: 0 }, mockCallback)
    })
    
    expect(result.current.datePickerOpen).toBe(true)
    expect(result.current.datePickerCallbackRef.current).toBe(mockCallback)
    
    // Then close it
    act(() => {
      result.current.closeDatePicker()
    })
    
    expect(result.current.datePickerOpen).toBe(false)
    expect(result.current.datePickerCallbackRef.current).toBeNull()
  })

  it('should handle date selection and call callback', () => {
    const { result } = renderHook(() => useDatePicker())
    const mockCallback = jest.fn()
    const testDate = '2024-01-15'
    
    // Open date picker with callback
    act(() => {
      result.current.openDatePicker({ x: 0, y: 0 }, mockCallback)
    })
    
    // Select a date
    act(() => {
      result.current.handleDateSelect(testDate)
    })
    
    // Callback should be called with the selected date
    expect(mockCallback).toHaveBeenCalledWith(testDate)
    expect(mockCallback).toHaveBeenCalledTimes(1)
    
    // Date picker should be closed after selection
    expect(result.current.datePickerOpen).toBe(false)
    expect(result.current.datePickerCallbackRef.current).toBeNull()
  })

  it('should not call callback if none is set', () => {
    const { result } = renderHook(() => useDatePicker())
    
    // Try to select a date without opening the picker first
    act(() => {
      result.current.handleDateSelect('2024-01-15')
    })
    
    // Should not crash and should close the picker
    expect(result.current.datePickerOpen).toBe(false)
  })

  it('should allow manual position setting', () => {
    const { result } = renderHook(() => useDatePicker())
    const newPosition = { x: 300, y: 400 }
    
    act(() => {
      result.current.setDatePickerPosition(newPosition)
    })
    
    expect(result.current.datePickerPosition).toEqual(newPosition)
  })

  it('should allow manual open/close setting', () => {
    const { result } = renderHook(() => useDatePicker())
    
    act(() => {
      result.current.setDatePickerOpen(true)
    })
    
    expect(result.current.datePickerOpen).toBe(true)
    
    act(() => {
      result.current.setDatePickerOpen(false)
    })
    
    expect(result.current.datePickerOpen).toBe(false)
  })

  it('should maintain callback reference across re-renders', () => {
    const { result, rerender } = renderHook(() => useDatePicker())
    const mockCallback = jest.fn()
    
    act(() => {
      result.current.openDatePicker({ x: 0, y: 0 }, mockCallback)
    })
    
    // Rerender the hook
    rerender()
    
    // Callback should still be available
    expect(result.current.datePickerCallbackRef.current).toBe(mockCallback)
    
    // And should still work
    act(() => {
      result.current.handleDateSelect('2024-01-15')
    })
    
    expect(mockCallback).toHaveBeenCalledWith('2024-01-15')
  })
})
