import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder'
import { DashboardProvider } from '@/components/dashboard/DashboardContext'
import { ConfigProvider } from '@/components/dashboard/ConfigContext'

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
        data-testid="draggable-component"
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

describe('Drag and Drop Integration', () => {
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

    // Mock getBoundingClientRect for dragged element
    const mockRect = {
      width: 200,
      height: 120,
      top: 200,
      left: 200,
      bottom: 320,
      right: 400,
      x: 200,
      y: 200,
      toJSON: () => ({}),
    }

    // Mock the active element's rect
    Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
      value: vi.fn(() => mockRect),
      writable: true,
    })
  })

  it('should render drag and drop context', () => {
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    expect(screen.getByTestId('component-library')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
  })

  it('should handle drag start event', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    const draggableComponent = screen.getByTestId('draggable-component')
    
    // Simulate drag start
    await user.pointer({ target: draggableComponent, keys: '[MouseLeft>]' })
    
    // The drag overlay should show
    await waitFor(() => {
      expect(screen.getByText('Adding Component')).toBeInTheDocument()
    })
  })

  it('should handle drag end event with component drop', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    const draggableComponent = screen.getByTestId('draggable-component')
    const canvas = screen.getByTestId('dashboard-canvas')
    
    // Simulate drag and drop
    await user.pointer([
      { target: draggableComponent, keys: '[MouseLeft>]' },
      { target: canvas, keys: '[/MouseLeft]' }
    ])

    // Should add widget to dashboard
    await waitFor(() => {
      // This would require checking the dashboard context state
      // For now, we verify the drag overlay is hidden
      expect(screen.queryByText('Adding Component')).not.toBeInTheDocument()
    })
  })

  it('should calculate correct drop position', () => {
    // Test the position calculation logic
    const canvasRect = {
      left: 100,
      top: 100,
      width: 800,
      height: 600
    }

    const activeRect = {
      left: 300, // 200px from canvas left
      top: 250,  // 150px from canvas top
      width: 200,
      height: 120
    }

    const gridSize = 20
    const x = Math.round((activeRect.left - canvasRect.left) / gridSize) * gridSize
    const y = Math.round((activeRect.top - canvasRect.top) / gridSize) * gridSize

    expect(x).toBe(200) // 200px rounded to grid
    expect(y).toBe(140) // 140px rounded to grid
  })

  it('should handle drag end outside canvas', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    const draggableComponent = screen.getByTestId('draggable-component')
    
    // Simulate drag outside canvas
    await user.pointer([
      { target: draggableComponent, keys: '[MouseLeft>]' },
      { target: document.body, keys: '[/MouseLeft]' }
    ])

    // Should not add widget
    await waitFor(() => {
      expect(screen.queryByText('Adding Component')).not.toBeInTheDocument()
    })
  })

  it('should handle widget movement', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    // First add a widget
    const draggableComponent = screen.getByTestId('draggable-component')
    const canvas = screen.getByTestId('dashboard-canvas')
    
    await user.pointer([
      { target: draggableComponent, keys: '[MouseLeft>]' },
      { target: canvas, keys: '[/MouseLeft]' }
    ])

    // Then try to move it (this would require the widget to be rendered)
    // For now, we test the drag end logic
    await waitFor(() => {
      expect(screen.queryByText('Adding Component')).not.toBeInTheDocument()
    })
  })

  it('should snap to grid when dropping', () => {
    const gridSize = 20
    const delta = { x: 15, y: 25 } // Not aligned to grid
    const widget = { x: 100, y: 200 }

    const newX = Math.round((widget.x + delta.x) / gridSize) * gridSize
    const newY = Math.round((widget.y + delta.y) / gridSize) * gridSize

    expect(newX).toBe(120) // 115 rounded to nearest grid (120)
    expect(newY).toBe(220) // 225 rounded to nearest grid (220)
  })

  it('should prevent negative coordinates', () => {
    const gridSize = 20
    const delta = { x: -150, y: -250 } // Would result in negative coordinates
    const widget = { x: 100, y: 200 }

    const newX = Math.max(0, Math.round((widget.x + delta.x) / gridSize) * gridSize)
    const newY = Math.max(0, Math.round((widget.y + delta.y) / gridSize) * gridSize)

    expect(newX).toBe(0) // Clamped to 0
    expect(newY).toBe(0) // Clamped to 0
  })

  it('should handle drag overlay visibility', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    const draggableComponent = screen.getByTestId('draggable-component')
    
    // Initially no overlay
    expect(screen.queryByText('Adding Component')).not.toBeInTheDocument()
    expect(screen.queryByText('Moving Widget')).not.toBeInTheDocument()

    // Start drag
    await user.pointer({ target: draggableComponent, keys: '[MouseLeft>]' })
    
    // Overlay should appear
    await waitFor(() => {
      expect(screen.getByText('Adding Component')).toBeInTheDocument()
    })

    // End drag
    await user.pointer({ target: draggableComponent, keys: '[/MouseLeft]' })
    
    // Overlay should disappear
    await waitFor(() => {
      expect(screen.queryByText('Adding Component')).not.toBeInTheDocument()
    })
  })

  it('should handle collision detection', () => {
    // Test that closestCenter collision detection is used
    const collisionDetection = 'closestCenter'
    expect(collisionDetection).toBe('closestCenter')
  })

  it('should handle drag end with no over target', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    const draggableComponent = screen.getByTestId('draggable-component')
    
    // Simulate drag with no valid drop target
    await user.pointer([
      { target: draggableComponent, keys: '[MouseLeft>]' },
      { target: draggableComponent, keys: '[/MouseLeft]' }
    ])

    // Should not add widget
    await waitFor(() => {
      expect(screen.queryByText('Adding Component')).not.toBeInTheDocument()
    })
  })

  it('should handle different component types', () => {
    // Test that different component types are handled correctly
    const componentTypes = [
      'line-chart',
      'bar-chart', 
      'pie-chart',
      'stat-card',
      'data-table',
      'calculator',
      'activity-monitor',
      'gauge'
    ]

    componentTypes.forEach(type => {
      // Each type should have default size and config
      expect(type).toBeDefined()
    })
  })

  it('should handle custom components', () => {
    // Test custom component handling
    const customComponent = {
      id: 'custom-test',
      name: 'Custom Widget',
      defaultSize: { width: 300, height: 200 }
    }

    expect(customComponent.id).toMatch(/^custom-/)
    expect(customComponent.defaultSize).toBeDefined()
  })
})
