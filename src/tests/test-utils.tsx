import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardProvider } from '@/components/dashboard/DashboardContext'

// Mock the ConfigContext
const MockConfigProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="config-provider">{children}</div>
)

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DashboardProvider>
          <MockConfigProvider>
            {children}
          </MockConfigProvider>
        </DashboardProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Helper function to create a test widget
export const createTestWidget = (overrides: Partial<any> = {}) => ({
  id: 'test-widget-1',
  type: 'stat-card',
  title: 'Test Widget',
  x: 0,
  y: 0,
  width: 200,
  height: 120,
  data: { value: 123 },
  config: { theme: 'scientific' },
  ...overrides,
})

// Helper function to create a test component
export const createTestComponent = (overrides: Partial<any> = {}) => ({
  id: 'test-component',
  name: 'Test Component',
  description: 'Test Description',
  category: 'Test',
  defaultSize: { width: 200, height: 120 },
  ...overrides,
})

// Mock data generators
export const mockChartData = {
  'line-chart': {
    xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar'] },
    yAxis: { type: 'value' },
    series: [{ data: [1, 2, 3], type: 'line' }]
  },
  'bar-chart': {
    xAxis: { type: 'category', data: ['A', 'B', 'C'] },
    yAxis: { type: 'value' },
    series: [{ data: [1, 2, 3], type: 'bar' }]
  },
  'pie-chart': {
    series: [{
      type: 'pie',
      data: [{ value: 1, name: 'A' }, { value: 2, name: 'B' }]
    }]
  }
}

export const mockStatData = {
  value: 1234,
  label: 'Test Stat',
  change: '+5%',
  trend: 'up'
}

export const mockTableData = {
  columns: ['Col1', 'Col2'],
  data: [['A', 'B'], ['C', 'D']]
}

// Mock functions
export const mockFunctions = {
  addWidget: vi.fn(),
  updateWidget: vi.fn(),
  removeWidget: vi.fn(),
  setSelectedWidget: vi.fn(),
  setIsResizing: vi.fn(),
  getConfig: vi.fn(() => ({})),
  setConfig: vi.fn(),
}

// Test constants
export const TEST_CONSTANTS = {
  GRID_SIZE: 20,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  WIDGET_MIN_WIDTH: 100,
  WIDGET_MIN_HEIGHT: 80,
}
