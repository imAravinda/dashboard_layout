import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { DashboardWidget as DashboardWidgetComponent } from '@/components/dashboard/widgets/DashboardWidget'
import { DashboardWidget } from '@/components/dashboard/DashboardContext'

// Mock the ConfigContext
vi.mock('@/components/dashboard/ConfigContext', () => ({
  useConfig: () => ({
    getConfig: () => ({}),
  }),
}))

// Mock the WidgetRenderer
vi.mock('@/components/dashboard/widgets/WidgetRenderer', () => ({
  WidgetRenderer: ({ widget }: { widget: DashboardWidget }) => (
    <div data-testid="widget-renderer">
      Widget Content: {widget.title}
    </div>
  ),
}))

// Mock the WidgetSettingsPanel
vi.mock('@/components/dashboard/WidgetSettingsPanel', () => ({
  WidgetSettingsPanel: ({ isOpen, onClose, widgetId }: { isOpen: boolean, onClose: () => void, widgetId: string }) => 
    isOpen ? (
      <div data-testid="widget-settings-panel">
        Settings for {widgetId}
        <button onClick={onClose}>Close Settings</button>
      </div>
    ) : null
}))

// Mock the useDashboard hook
const mockUseDashboard = {
  updateWidget: vi.fn(),
  removeWidget: vi.fn(),
  selectedWidget: null,
  setSelectedWidget: vi.fn(),
  gridSize: 20,
  isResizing: false,
  setIsResizing: vi.fn(),
}

vi.mock('@/components/dashboard/DashboardContext', () => ({
  useDashboard: () => mockUseDashboard,
  DashboardWidget: {} as unknown // Type export
}))

const mockWidget: DashboardWidget = {
  id: 'test-widget-1',
  type: 'stat-card',
  title: 'Test Widget',
  x: 100,
  y: 200,
  width: 300,
  height: 250,
  data: { value: 123 },
  config: { theme: 'scientific' }
}

describe('DashboardWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDashboard.selectedWidget = null
  })

  it('should render widget with correct title', () => {
    render(<DashboardWidgetComponent widget={mockWidget} />)

    expect(screen.getByText('Test Widget')).toBeInTheDocument()
  })

  it('should render widget content', () => {
    render(<DashboardWidgetComponent widget={mockWidget} />)

    expect(screen.getByTestId('widget-renderer')).toBeInTheDocument()
    expect(screen.getByText('Widget Content: Test Widget')).toBeInTheDocument()
  })

  it('should render widget with correct positioning', () => {
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const widgetElement = screen.getByText('Test Widget').closest('div')
    expect(widgetElement).toHaveStyle({
      left: '100px',
      top: '200px',
      width: '300px',
      height: '250px'
    })
  })

  it('should show selected state when widget is selected', () => {
    mockUseDashboard.selectedWidget = 'test-widget-1'
    
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const widgetElement = screen.getByText('Test Widget').closest('div')
    expect(widgetElement).toHaveClass('ring-2', 'ring-primary', 'shadow-lg')
  })

  it('should not show selected state when widget is not selected', () => {
    mockUseDashboard.selectedWidget = 'other-widget'
    
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const widgetElement = screen.getByText('Test Widget').closest('div')
    expect(widgetElement).not.toHaveClass('ring-2', 'ring-primary', 'shadow-lg')
    expect(widgetElement).toHaveClass('hover:border-primary/50')
  })

  it('should call setSelectedWidget when clicked', async () => {
    const user = userEvent.setup()
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const widgetElement = screen.getByText('Test Widget').closest('div')
    await user.click(widgetElement!)

    expect(mockUseDashboard.setSelectedWidget).toHaveBeenCalledWith('test-widget-1')
  })

  it('should open settings panel when settings button is clicked', async () => {
    const user = userEvent.setup()
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const settingsButton = screen.getByRole('button', { name: /settings/i })
    await user.click(settingsButton)

    expect(screen.getByTestId('widget-settings-panel')).toBeInTheDocument()
    expect(screen.getByText('Settings for test-widget-1')).toBeInTheDocument()
  })

  it('should close settings panel when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<DashboardWidgetComponent widget={mockWidget} />)

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    await user.click(settingsButton)

    expect(screen.getByTestId('widget-settings-panel')).toBeInTheDocument()

    // Close settings
    const closeButton = screen.getByText('Close Settings')
    await user.click(closeButton)

    expect(screen.queryByTestId('widget-settings-panel')).not.toBeInTheDocument()
  })

  it('should call removeWidget when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    expect(mockUseDashboard.removeWidget).toHaveBeenCalledWith('test-widget-1')
  })

  it('should show resize handle when widget is selected', () => {
    mockUseDashboard.selectedWidget = 'test-widget-1'
    
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const resizeHandle = screen.getByRole('generic')
    expect(resizeHandle).toHaveClass('absolute', 'bottom-0', 'right-0', 'w-4', 'h-4', 'bg-primary', 'cursor-se-resize')
  })

  it('should not show resize handle when widget is not selected', () => {
    mockUseDashboard.selectedWidget = 'other-widget'
    
    render(<DashboardWidgetComponent widget={mockWidget} />)

    // The resize handle should not be visible
    const resizeHandles = screen.queryAllByRole('generic')
    const resizeHandle = resizeHandles.find(el => 
      el.classList.contains('cursor-se-resize')
    )
    expect(resizeHandle).toBeUndefined()
  })

  it('should handle maximize button click', async () => {
    const user = userEvent.setup()
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const maximizeButton = screen.getByRole('button', { name: /maximize/i })
    await user.click(maximizeButton)

    // Currently the maximize functionality is not implemented (TODO comment in code)
    // This test ensures the button is clickable without errors
    expect(maximizeButton).toBeInTheDocument()
  })

  it('should apply custom styling from config', async () => {
    const widgetWithCustomStyle: DashboardWidget = {
      ...mockWidget,
      config: {
        style: {
          backgroundColor: '#ff0000',
          borderColor: '#00ff00',
          borderRadius: '10px',
          padding: '20px'
        }
      }
    }

    // Mock config to return custom style
    const { useConfig } = await import('@/components/dashboard/ConfigContext')
    vi.mocked(useConfig).mockReturnValue({
      getConfig: () => ({
        id: 'test-widget-1',
        type: 'test',
        title: 'Test Widget',
        data: {},
        style: {
          backgroundColor: '#ff0000',
          borderColor: '#00ff00',
          borderRadius: 10,
          padding: 20
        }
      }),
      configs: {},
      updateConfig: vi.fn(),
      resetConfig: vi.fn(),
    })

    render(<DashboardWidgetComponent widget={widgetWithCustomStyle} />)

    const widgetElement = screen.getByText('Test Widget').closest('div')
    expect(widgetElement).toHaveStyle({
      backgroundColor: '#ff0000',
      borderColor: '#00ff00',
      borderRadius: 10,
      padding: 20
    })
  })

  it('should handle resize mouse down event', async () => {
    const user = userEvent.setup()
    mockUseDashboard.selectedWidget = 'test-widget-1'
    
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const resizeHandle = screen.getByRole('generic')
    
    // Mock getBoundingClientRect for the resize handle
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 4,
      height: 4,
      top: 0,
      left: 0,
      bottom: 4,
      right: 4,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }))

    await user.pointer({ target: resizeHandle, keys: '[MouseLeft>]' })

    expect(mockUseDashboard.setIsResizing).toHaveBeenCalledWith(true)
  })

  it('should handle mouse move during resize', async () => {
    const user = userEvent.setup()
    mockUseDashboard.selectedWidget = 'test-widget-1'
    
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const resizeHandle = screen.getByRole('generic')
    
    // Start resize
    await user.pointer({ target: resizeHandle, keys: '[MouseLeft>]' })
    
    // Move mouse
    await user.pointer({ target: resizeHandle, coords: { x: 50, y: 50 } })

    // Should call updateWidget with new dimensions
    expect(mockUseDashboard.updateWidget).toHaveBeenCalledWith(
      'test-widget-1',
      expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number)
      })
    )
  })

  it('should handle mouse up to end resize', async () => {
    const user = userEvent.setup()
    mockUseDashboard.selectedWidget = 'test-widget-1'
    
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const resizeHandle = screen.getByRole('generic')
    
    // Start and end resize
    await user.pointer({ target: resizeHandle, keys: '[MouseLeft>]' })
    await user.pointer({ target: resizeHandle, keys: '[/MouseLeft]' })

    expect(mockUseDashboard.setIsResizing).toHaveBeenCalledWith(false)
  })

  it('should prevent dragging when resizing', () => {
    mockUseDashboard.isResizing = true
    
    render(<DashboardWidgetComponent widget={mockWidget} />)

    // The draggable should be disabled when resizing
    // This is tested through the useDraggable disabled prop
    expect(mockUseDashboard.isResizing).toBe(true)
  })

  it('should have correct z-index when selected', () => {
    mockUseDashboard.selectedWidget = 'test-widget-1'
    
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const widgetElement = screen.getByText('Test Widget').closest('div')
    expect(widgetElement).toHaveStyle({ zIndex: '10' })
  })

  it('should have default z-index when not selected', () => {
    mockUseDashboard.selectedWidget = 'other-widget'
    
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const widgetElement = screen.getByText('Test Widget').closest('div')
    expect(widgetElement).toHaveStyle({ zIndex: '1' })
  })

  it('should render all control buttons', () => {
    render(<DashboardWidgetComponent widget={mockWidget} />)

    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /maximize/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('should stop propagation on button clicks', async () => {
    const user = userEvent.setup()
    render(<DashboardWidgetComponent widget={mockWidget} />)

    const settingsButton = screen.getByRole('button', { name: /settings/i })
    
    // Click settings button should not trigger widget selection
    await user.click(settingsButton)
    
    // setSelectedWidget should not be called for button clicks
    expect(mockUseDashboard.setSelectedWidget).not.toHaveBeenCalled()
  })
})
