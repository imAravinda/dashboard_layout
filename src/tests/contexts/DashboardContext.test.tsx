import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { DashboardProvider, useDashboard, DashboardWidget } from '@/components/dashboard/DashboardContext'

// Test wrapper component
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <DashboardProvider>{children}</DashboardProvider>
  )
}

describe('DashboardContext', () => {
  describe('DashboardProvider', () => {
    it('should provide initial context values', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      expect(result.current.widgets).toEqual([])
      expect(result.current.selectedWidget).toBeNull()
      expect(result.current.gridSize).toBe(20)
      expect(result.current.isResizing).toBe(false)
      expect(typeof result.current.addWidget).toBe('function')
      expect(typeof result.current.updateWidget).toBe('function')
      expect(typeof result.current.removeWidget).toBe('function')
      expect(typeof result.current.setSelectedWidget).toBe('function')
      expect(typeof result.current.setIsResizing).toBe('function')
    })

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        renderHook(() => useDashboard())
      }).toThrow('useDashboard must be used within a DashboardProvider')
      
      consoleSpy.mockRestore()
    })
  })

  describe('addWidget', () => {
    it('should add a new widget with generated ID', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const newWidget: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Test Widget',
        x: 100,
        y: 200,
        width: 200,
        height: 150,
        data: { value: 123 },
        config: { theme: 'scientific' },
      }

      act(() => {
        result.current.addWidget(newWidget)
      })

      expect(result.current.widgets).toHaveLength(1)
      expect(result.current.widgets[0]).toMatchObject(newWidget)
      expect(result.current.widgets[0].id).toMatch(/^widget-\d+-[a-z0-9]+$/)
    })

    it('should add multiple widgets', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const widget1: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Widget 1',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }

      const widget2: Omit<DashboardWidget, 'id'> = {
        type: 'line-chart',
        title: 'Widget 2',
        x: 100,
        y: 100,
        width: 200,
        height: 200,
      }

      act(() => {
        result.current.addWidget(widget1)
        result.current.addWidget(widget2)
      })

      expect(result.current.widgets).toHaveLength(2)
      expect(result.current.widgets[0].title).toBe('Widget 1')
      expect(result.current.widgets[1].title).toBe('Widget 2')
    })
  })

  describe('updateWidget', () => {
    it('should update existing widget properties', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const widget: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Original Title',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }

      act(() => {
        result.current.addWidget(widget)
      })

      const widgetId = result.current.widgets[0].id

      act(() => {
        result.current.updateWidget(widgetId, {
          title: 'Updated Title',
          x: 50,
          y: 50,
        })
      })

      expect(result.current.widgets[0].title).toBe('Updated Title')
      expect(result.current.widgets[0].x).toBe(50)
      expect(result.current.widgets[0].y).toBe(50)
      expect(result.current.widgets[0].width).toBe(100) // Should remain unchanged
      expect(result.current.widgets[0].height).toBe(100) // Should remain unchanged
    })

    it('should not update non-existent widget', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.updateWidget('non-existent-id', {
          title: 'Updated Title',
        })
      })

      expect(result.current.widgets).toHaveLength(0)
    })
  })

  describe('removeWidget', () => {
    it('should remove widget by ID', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const widget: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Test Widget',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }

      act(() => {
        result.current.addWidget(widget)
      })

      const widgetId = result.current.widgets[0].id

      act(() => {
        result.current.removeWidget(widgetId)
      })

      expect(result.current.widgets).toHaveLength(0)
    })

    it('should clear selected widget if it was removed', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const widget: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Test Widget',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }

      act(() => {
        result.current.addWidget(widget)
        result.current.setSelectedWidget(result.current.widgets[0].id)
      })

      expect(result.current.selectedWidget).toBe(result.current.widgets[0].id)

      act(() => {
        result.current.removeWidget(result.current.widgets[0].id)
      })

      expect(result.current.selectedWidget).toBeNull()
    })

    it('should not affect other widgets when removing one', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      const widget1: Omit<DashboardWidget, 'id'> = {
        type: 'stat-card',
        title: 'Widget 1',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }

      const widget2: Omit<DashboardWidget, 'id'> = {
        type: 'line-chart',
        title: 'Widget 2',
        x: 100,
        y: 100,
        width: 200,
        height: 200,
      }

      act(() => {
        result.current.addWidget(widget1)
        result.current.addWidget(widget2)
      })

      const widget1Id = result.current.widgets[0].id

      act(() => {
        result.current.removeWidget(widget1Id)
      })

      expect(result.current.widgets).toHaveLength(1)
      expect(result.current.widgets[0].title).toBe('Widget 2')
    })
  })

  describe('setSelectedWidget', () => {
    it('should set selected widget ID', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setSelectedWidget('widget-123')
      })

      expect(result.current.selectedWidget).toBe('widget-123')
    })

    it('should clear selected widget when set to null', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setSelectedWidget('widget-123')
        result.current.setSelectedWidget(null)
      })

      expect(result.current.selectedWidget).toBeNull()
    })
  })

  describe('setIsResizing', () => {
    it('should set resizing state', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setIsResizing(true)
      })

      expect(result.current.isResizing).toBe(true)

      act(() => {
        result.current.setIsResizing(false)
      })

      expect(result.current.isResizing).toBe(false)
    })
  })
})
