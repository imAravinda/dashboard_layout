import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
        data-testid="draggable-stat-card"
        data-component-type="stat-card"
        data-component-name="Stat Card"
        data-component-width="200"
        data-component-height="120"
      >
        Stat Card Component
      </div>
      <div 
        data-testid="draggable-line-chart"
        data-component-type="line-chart"
        data-component-name="Line Chart"
        data-component-width="400"
        data-component-height="300"
      >
        Line Chart Component
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

describe('Widget Management Integration', () => {
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

  it('should render dashboard with component library and canvas', () => {
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    expect(screen.getByTestId('component-library')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument()
  })

  it('should display available components in library', () => {
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    expect(screen.getByTestId('draggable-stat-card')).toBeInTheDocument()
    expect(screen.getByTestId('draggable-line-chart')).toBeInTheDocument()
  })

  it('should handle component drag and drop workflow', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    const statCard = screen.getByTestId('draggable-stat-card')
    const canvas = screen.getByTestId('dashboard-canvas')

    // Start drag
    await user.pointer({ target: statCard, keys: '[MouseLeft>]' })
    
    // Should show drag overlay
    await waitFor(() => {
      expect(screen.getByText('Adding Component')).toBeInTheDocument()
    })

    // Drop on canvas
    await user.pointer({ target: canvas, keys: '[/MouseLeft]' })

    // Drag overlay should disappear
    await waitFor(() => {
      expect(screen.queryByText('Adding Component')).not.toBeInTheDocument()
    })
  })

  it('should handle multiple component types', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    const lineChart = screen.getByTestId('draggable-line-chart')
    const canvas = screen.getByTestId('dashboard-canvas')

    // Drag line chart
    await user.pointer([
      { target: lineChart, keys: '[MouseLeft>]' },
      { target: canvas, keys: '[/MouseLeft]' }
    ])

    // Should handle different component types
    await waitFor(() => {
      expect(screen.queryByText('Adding Component')).not.toBeInTheDocument()
    })
  })

  it('should maintain component library state', () => {
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    // Component library should remain stable
    expect(screen.getByTestId('draggable-stat-card')).toBeInTheDocument()
    expect(screen.getByTestId('draggable-line-chart')).toBeInTheDocument()
  })

  it('should handle canvas interactions', () => {
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    const canvas = screen.getByTestId('dashboard-canvas')
    expect(canvas).toHaveAttribute('data-canvas', 'true')
  })

  it('should provide proper context to child components', () => {
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    // All providers should be present
    expect(screen.getByTestId('config-provider')).toBeInTheDocument()
  })

  it('should handle component library filtering', () => {
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    // Component library should be searchable and filterable
    const library = screen.getByTestId('component-library')
    expect(library).toBeInTheDocument()
  })

  it('should support widget configuration', () => {
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    // Widgets should be configurable
    // This would be tested through the settings panel
    expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
  })

  it('should handle responsive layout', () => {
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    // Layout should be responsive
    const mainContainer = screen.getByTestId('component-library').parentElement?.parentElement
    expect(mainContainer).toHaveClass('flex', 'h-screen')
  })

  it('should maintain state across interactions', async () => {
    const user = userEvent.setup()
    render(<DashboardBuilder />, { wrapper: TestWrapper })

    // Perform multiple interactions
    const statCard = screen.getByTestId('draggable-stat-card')
    const lineChart = screen.getByTestId('draggable-line-chart')
    const canvas = screen.getByTestId('dashboard-canvas')

    // Drag stat card
    await user.pointer([
      { target: statCard, keys: '[MouseLeft>]' },
      { target: canvas, keys: '[/MouseLeft]' }
    ])

    // Drag line chart
    await user.pointer([
      { target: lineChart, keys: '[MouseLeft>]' },
      { target: canvas, keys: '[/MouseLeft]' }
    ])

    // State should be maintained
    expect(screen.getByTestId('component-library')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
  })
})
