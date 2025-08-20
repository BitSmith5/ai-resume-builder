import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '../store'

// Helper to reset store before each test
const resetStore = () => {
  const { result } = renderHook(() => useAppStore())
  act(() => {
    result.current.resetStore()
  })
}

describe('App Store', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('User Management', () => {
    it('should initialize with no user and not authenticated', () => {
      const { result } = renderHook(() => useAppStore())
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should set user and update authentication status', () => {
      const { result } = renderHook(() => useAppStore())
      const testUser = { id: '1', name: 'John Doe', email: 'john@example.com' }
      
      act(() => {
        result.current.setUser(testUser)
      })
      
      expect(result.current.user).toEqual(testUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should set user to null and update authentication status', () => {
      const { result } = renderHook(() => useAppStore())
      
      // First set a user
      act(() => {
        result.current.setUser({ id: '1', name: 'John Doe' })
      })
      
      // Then clear it
      act(() => {
        result.current.setUser(null)
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should set authentication status independently', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.setAuthenticated(true)
      })
      
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toBeNull() // User should remain null
    })
  })

  describe('Notification Management', () => {
    it('should initialize with empty notifications', () => {
      const { result } = renderHook(() => useAppStore())
      
      expect(result.current.notifications).toEqual([])
    })

    it('should add notification with generated ID', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.addNotification({
          message: 'Test notification',
          severity: 'success'
        })
      })
      
      expect(result.current.notifications).toHaveLength(1)
      expect(result.current.notifications[0].message).toBe('Test notification')
      expect(result.current.notifications[0].severity).toBe('success')
      expect(result.current.notifications[0].id).toMatch(/^notification-\d+$/)
      expect(result.current.notifications[0].duration).toBe(6000)
    })

    it('should add notification with custom duration', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.addNotification({
          message: 'Custom duration',
          severity: 'info',
          duration: 10000
        })
      })
      
      expect(result.current.notifications[0].duration).toBe(10000)
    })

    it('should add notification with action', () => {
      const { result } = renderHook(() => useAppStore())
      const mockAction = jest.fn()
      
      act(() => {
        result.current.addNotification({
          message: 'With action',
          severity: 'warning',
          action: {
            label: 'Undo',
            onClick: mockAction
          }
        })
      })
      
      expect(result.current.notifications[0].action).toEqual({
        label: 'Undo',
        onClick: mockAction
      })
    })

    it('should remove notification by ID', () => {
      const { result } = renderHook(() => useAppStore())
      
      // Add two notifications
      act(() => {
        result.current.addNotification({
          message: 'First notification',
          severity: 'success'
        })
        result.current.addNotification({
          message: 'Second notification',
          severity: 'error'
        })
      })
      
      expect(result.current.notifications).toHaveLength(2)
      
      // Remove first notification
      const firstId = result.current.notifications[0].id
      act(() => {
        result.current.removeNotification(firstId)
      })
      
      expect(result.current.notifications).toHaveLength(1)
      expect(result.current.notifications[0].message).toBe('Second notification')
    })

    it('should clear all notifications', () => {
      const { result } = renderHook(() => useAppStore())
      
      // Add notifications
      act(() => {
        result.current.addNotification({
          message: 'First notification',
          severity: 'success'
        })
        result.current.addNotification({
          message: 'Second notification',
          severity: 'error'
        })
      })
      
      expect(result.current.notifications).toHaveLength(2)
      
      // Clear all
      act(() => {
        result.current.clearNotifications()
      })
      
      expect(result.current.notifications).toEqual([])
    })
  })

  describe('Store Reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useAppStore())
      
      // Add some state
      act(() => {
        result.current.setUser({ id: '1', name: 'John Doe' })
        result.current.addNotification({
          message: 'Test notification',
          severity: 'success'
        })
      })
      
      expect(result.current.user).not.toBeNull()
      expect(result.current.notifications).toHaveLength(1)
      
      // Reset store
      act(() => {
        result.current.resetStore()
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.notifications).toEqual([])
    })
  })
})
