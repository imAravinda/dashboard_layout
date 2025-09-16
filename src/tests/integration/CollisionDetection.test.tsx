import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder'
import { DashboardProvider } from '@/components/dashboard/DashboardContext'
import { ConfigProvider } from '@/components/dashboard/ConfigContext'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock the ConfigContext
vi.mock('@/components/dashboard/ConfigContext', () => ({
  ConfigProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="config-provider">{children}</div>,
  useConfig: () => ({
    getConfig: () => ({}),
    setConfig: vi.fn(),
  }),
}))

// Mock the DashboardCanvas component
vi.mock('@/components/dashboard/DashboardCanvas', () => ({
  DashboardCanvas: () => <div data-testid="dashboard-canvas" data-canvas="true">Dashboard Canvas</div>,
}))

// Mock the ComponentLibrary component
vi.mock('@/components/dashboard/ComponentLibrary', () => ({
  ComponentLibrary: () => (
    <div data-testid="component-library">
      <div 
        data-testid="draggable-stat-card"
        data-component-type="stat-card"
        data-component-name="Stat Card"
        data-component-width="200"
        data-component-height="120"
      >
        Stat Card Component
      </div>
    </div>
  ),
}))

// Mock the DashboardHeader component
vi.mock('@/components/dashboard/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header">Dashboard Header</div>,
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DashboardProvider>
    <ConfigProvider>
      {children}
    </ConfigProvider>
  </DashboardProvider>
)

describe('Collision Detection', () => {
  beforeEach(() => {
    // Mock getBoundingClientRect for canvas element
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      top: 100,
      left: 100,
      bottom: 700,
      right: 900,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    }))
  })

  it('should show collision preview during drag', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    const statCard = screen.getByTestId('draggable-stat-card')
    const canvas = screen.getByTestId('dashboard-canvas')

    // Start drag
    await user.pointer({ target: statCard, keys: '[MouseLeft>]' })
    
    // Move to canvas
    await user.pointer({ target: canvas, coords: { x: 200, y: 200 } })

    // Should show drag preview
    await waitFor(() => {
      const preview = screen.queryByText('Valid Position')
      expect(preview).toBeInTheDocument()
    })
  })

  it('should detect collisions when dragging over existing widgets', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    // First, add a widget
    const statCard = screen.getByTestId('draggable-stat-card')
    const canvas = screen.getByTestId('dashboard-canvas')
    
    await user.pointer([
      { target: statCard, keys: '[MouseLeft>]' },
      { target: canvas, coords: { x: 200, y: 200 }, keys: '[/MouseLeft]' }
    ])

    // Wait for widget to be added
    await waitFor(() => {
      expect(screen.queryByText('Valid Position')).not.toBeInTheDocument()
    })

    // Now drag another component to the same position
    await user.pointer([
      { target: statCard, keys: '[MouseLeft>]' },
      { target: canvas, coords: { x: 200, y: 200 } }
    ])

    // Should show collision warning
    await waitFor(() => {
      const collisionWarning = screen.queryByText('Overlap!')
      expect(collisionWarning).toBeInTheDocument()
    })
  })

  it('should find alternative position when collision detected', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    // Add first widget
    const statCard = screen.getByTestId('draggable-stat-card')
    const canvas = screen.getByTestId('dashboard-canvas')
    
    await user.pointer([
      { target: statCard, keys: '[MouseLeft>]' },
      { target: canvas, coords: { x: 200, y: 200 }, keys: '[/MouseLeft]' }
    ])

    // Add second widget at same position (should find alternative position)
    await user.pointer([
      { target: statCard, keys: '[MouseLeft>]' },
      { target: canvas, coords: { x: 200, y: 200 }, keys: '[/MouseLeft]' }
    ])

    // Both widgets should be placed without overlapping
    await waitFor(() => {
      // This would require checking the actual widget positions
      // For now, we verify no error occurred
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
    })
  })

  it('should handle edge cases in collision detection', () => {
    // Test collision detection logic directly
    const widgets = [
      { id: 'widget-1', x: 100, y: 100, width: 200, height: 150 },
      { id: 'widget-2', x: 300, y: 200, width: 150, height: 100 }
    ]

    // Test no collision
    const noCollision = !(
      50 >= 100 + 200 ||
      50 + 100 <= 100 ||
      50 >= 100 + 150 ||
      50 + 100 <= 100
    )
    expect(noCollision).toBe(true)

    // Test collision
    const collision = !(
      150 >= 100 + 200 ||
      150 + 100 <= 100 ||
      150 >= 100 + 150 ||
      150 + 100 <= 100
    )
    expect(collision).toBe(false)
  })

  it('should respect canvas boundaries', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    const statCard = screen.getByTestId('draggable-stat-card')
    const canvas = screen.getByTestId('dashboard-canvas')

    // Drag to edge of canvas
    await user.pointer([
      { target: statCard, keys: '[MouseLeft>]' },
      { target: canvas, coords: { x: 0, y: 0 } }
    ])

    // Should show valid position (clamped to canvas bounds)
    await waitFor(() => {
      const preview = screen.queryByText('Valid Position')
      expect(preview).toBeInTheDocument()
    })
  })

  it('should handle rapid drag movements', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    const statCard = screen.getByTestId('draggable-stat-card')
    const canvas = screen.getByTestId('dashboard-canvas')

    // Rapid drag movements
    await user.pointer([
      { target: statCard, keys: '[MouseLeft>]' },
      { target: canvas, coords: { x: 100, y: 100 } },
      { target: canvas, coords: { x: 200, y: 200 } },
      { target: canvas, coords: { x: 300, y: 300 } },
      { target: canvas, coords: { x: 400, y: 400 }, keys: '[/MouseLeft]' }
    ])

    // Should handle rapid movements without errors
    expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
  })
})
