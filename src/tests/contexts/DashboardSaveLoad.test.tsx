import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { DashboardProvider, useDashboard, DashboardWidget } from '@/components/dashboard/DashboardContext'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Test wrapper component
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <DashboardProvider>{children}</DashboardProvider>
  )
}

describe('Dashboard Save/Load Functionality', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('saveDashboard', () => {
    it('should save dashboard to localStorage', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const testWidget: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Test Widget',
        x: 100,
        y: 200,
        width: 200,
        height: 150,
        data: { value: 123 },
        config: { theme: 'scientific' },
      }

      // Add widget
      act(() => {
        result.current.addWidget(testWidget)
      })

      // Save dashboard
      act(() => {
        result.current.saveDashboard()
      })

      // Check localStorage
      const savedData = localStorageMock.getItem('dashboard-layout-widgets')
      expect(savedData).toBeTruthy()
      
      const parsedData = JSON.parse(savedData!)
      expect(parsedData.widgets).toHaveLength(1)
      expect(parsedData.widgets[0]).toMatchObject(testWidget)
      expect(parsedData.timestamp).toBeDefined()
      expect(parsedData.version).toBe('1.0.0')
    })

    it('should clear hasUnsavedChanges after saving', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const testWidget: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Test Widget',
        x: 0,
        y: 0,
        width: 200,
        height: 150,
      }

      // Add widget (should set hasUnsavedChanges to true)
      act(() => {
        result.current.addWidget(testWidget)
      })

      expect(result.current.hasUnsavedChanges).toBe(true)

      // Save dashboard
      act(() => {
        result.current.saveDashboard()
      })

      expect(result.current.hasUnsavedChanges).toBe(false)
    })
  })

  describe('loadDashboard', () => {
    it('should load dashboard from localStorage', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const testData = {
        widgets: [
          {
            id: 'test-widget-1',
            type: 'stat-card',
            title: 'Loaded Widget',
            x: 100,
            y: 200,
            width: 200,
            height: 150,
            data: { value: 456 },
            config: { theme: 'scientific' },
          }
        ],
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }

      // Set up localStorage
      localStorageMock.setItem('dashboard-layout-widgets', JSON.stringify(testData))

      // Load dashboard
      act(() => {
        result.current.loadDashboard()
      })

      expect(result.current.widgets).toHaveLength(1)
      expect(result.current.widgets[0]).toMatchObject(testData.widgets[0])
      expect(result.current.hasUnsavedChanges).toBe(false)
    })

    it('should handle empty localStorage gracefully', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      // Load dashboard with empty localStorage
      act(() => {
        result.current.loadDashboard()
      })

      expect(result.current.widgets).toHaveLength(0)
      expect(result.current.hasUnsavedChanges).toBe(false)
    })

    it('should handle invalid JSON gracefully', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      // Set invalid JSON in localStorage
      localStorageMock.setItem('dashboard-layout-widgets', 'invalid json')

      // Load dashboard should not throw error
      act(() => {
        result.current.loadDashboard()
      })

      expect(result.current.widgets).toHaveLength(0)
    })
  })

  describe('clearDashboard', () => {
    it('should clear dashboard and localStorage', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const testWidget: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Test Widget',
        x: 0,
        y: 0,
        width: 200,
        height: 150,
      }

      // Add widget and save
      act(() => {
        result.current.addWidget(testWidget)
        result.current.saveDashboard()
      })

      expect(result.current.widgets).toHaveLength(1)
      expect(localStorageMock.getItem('dashboard-layout-widgets')).toBeTruthy()

      // Clear dashboard
      act(() => {
        result.current.clearDashboard()
      })

      expect(result.current.widgets).toHaveLength(0)
      expect(result.current.selectedWidget).toBeNull()
      expect(result.current.hasUnsavedChanges).toBe(false)
      expect(localStorageMock.getItem('dashboard-layout-widgets')).toBeNull()
    })
  })

  describe('hasUnsavedChanges', () => {
    it('should be true after adding widget', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const testWidget: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Test Widget',
        x: 0,
        y: 0,
        width: 200,
        height: 150,
      }

      act(() => {
        result.current.addWidget(testWidget)
      })

      expect(result.current.hasUnsavedChanges).toBe(true)
    })

    it('should be true after updating widget', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const testWidget: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Test Widget',
        x: 0,
        y: 0,
        width: 200,
        height: 150,
      }

      act(() => {
        result.current.addWidget(testWidget)
        result.current.saveDashboard() // Save to clear unsaved changes
      })

      expect(result.current.hasUnsavedChanges).toBe(false)

      act(() => {
        result.current.updateWidget(result.current.widgets[0].id, { title: 'Updated Title' })
      })

      expect(result.current.hasUnsavedChanges).toBe(true)
    })

    it('should be true after removing widget', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const testWidget: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Test Widget',
        x: 0,
        y: 0,
        width: 200,
        height: 150,
      }

      act(() => {
        result.current.addWidget(testWidget)
        result.current.saveDashboard() // Save to clear unsaved changes
      })

      expect(result.current.hasUnsavedChanges).toBe(false)

      act(() => {
        result.current.removeWidget(result.current.widgets[0].id)
      })

      expect(result.current.hasUnsavedChanges).toBe(true)
    })
  })

  describe('auto-save functionality', () => {
    it('should auto-save after changes', async () => {
      vi.useFakeTimers()
      
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const testWidget: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Test Widget',
        x: 0,
        y: 0,
        width: 200,
        height: 150,
      }

      // Add widget
      act(() => {
        result.current.addWidget(testWidget)
      })

      expect(result.current.hasUnsavedChanges).toBe(true)

      // Fast-forward time to trigger auto-save
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // Wait for auto-save to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.hasUnsavedChanges).toBe(false)
      expect(localStorageMock.getItem('dashboard-layout-widgets')).toBeTruthy()

      vi.useRealTimers()
    })
  })
})
