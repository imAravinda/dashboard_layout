import { render, screen } from '@testing-library/react'
import { StatCardWidget } from '@/components/dashboard/widgets/stats/StatCardWidget'
import { DashboardWidget } from '@/components/dashboard/DashboardContext'

// Mock the ConfigContext
vi.mock('@/components/dashboard/ConfigContext', () => ({
  useConfig: () => ({
    getConfig: () => ({}),
  }),
}))

const mockWidget: DashboardWidget = {
  id: 'test-widget-1',
  type: 'stat-card',
  title: 'Test Stat Card',
  x: 0,
  y: 0,
  width: 200,
  height: 120,
  data: {
    value: 1234,
    label: 'Total Sales',
    change: '+12.5%',
    trend: 'up'
  }
}

const mockWidgetWithNegativeTrend: DashboardWidget = {
  id: 'test-widget-2',
  type: 'stat-card',
  title: 'Test Stat Card',
  x: 0,
  y: 0,
  width: 200,
  height: 120,
  data: {
    value: 567,
    label: 'Failed Requests',
    change: '-5.2%',
    trend: 'down'
  }
}

const mockWidgetWithNumberValue: DashboardWidget = {
  id: 'test-widget-3',
  type: 'stat-card',
  title: 'Test Stat Card',
  x: 0,
  y: 0,
  width: 200,
  height: 120,
  data: {
    value: 9876543,
    label: 'Large Number',
    change: '+1.3%',
    trend: 'up'
  }
}

const mockWidgetWithStringValue: DashboardWidget = {
  id: 'test-widget-4',
  type: 'stat-card',
  title: 'Test Stat Card',
  x: 0,
  y: 0,
  width: 200,
  height: 120,
  data: {
    value: '98.5%',
    label: 'Success Rate',
    change: '+0.8%',
    trend: 'up'
  }
}

const mockWidgetWithoutData: DashboardWidget = {
  id: 'test-widget-5',
  type: 'stat-card',
  title: 'Test Stat Card',
  x: 0,
  y: 0,
  width: 200,
  height: 120,
}

describe('StatCardWidget', () => {
  it('should render with provided data', () => {
    render(<StatCardWidget widget={mockWidget} width={200} height={120} />)

    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('Total Sales')).toBeInTheDocument()
    expect(screen.getByText('+12.5%')).toBeInTheDocument()
  })

  it('should render with positive trend icon and styling', () => {
    render(<StatCardWidget widget={mockWidget} width={200} height={120} />)

    const trendElement = screen.getByText('+12.5%')
    expect(trendElement).toHaveClass('text-chart-success')
    
    // Check for trending up icon (this would be a Lucide icon)
    const trendContainer = trendElement.parentElement
    expect(trendContainer).toHaveClass('flex', 'items-center', 'space-x-1')
  })

  it('should render with negative trend icon and styling', () => {
    render(<StatCardWidget widget={mockWidgetWithNegativeTrend} width={200} height={120} />)

    const trendElement = screen.getByText('-5.2%')
    expect(trendElement).toHaveClass('text-chart-error')
    
    const trendContainer = trendElement.parentElement
    expect(trendContainer).toHaveClass('flex', 'items-center', 'space-x-1')
  })

  it('should format large numbers with commas', () => {
    render(<StatCardWidget widget={mockWidgetWithNumberValue} width={200} height={120} />)

    expect(screen.getByText('9,876,543')).toBeInTheDocument()
  })

  it('should display string values as-is', () => {
    render(<StatCardWidget widget={mockWidgetWithStringValue} width={200} height={120} />)

    expect(screen.getByText('98.5%')).toBeInTheDocument()
  })

  it('should use mock data when no data is provided', () => {
    render(<StatCardWidget widget={mockWidgetWithoutData} width={200} height={120} />)

    // Should render some mock data (the component generates random mock data)
    expect(screen.getByText(/\d+/)).toBeInTheDocument() // Should have some number
    expect(screen.getByText(/\w+/)).toBeInTheDocument() // Should have some text
  })

  it('should apply correct styling classes', () => {
    render(<StatCardWidget widget={mockWidget} width={200} height={120} />)

    const container = screen.getByText('1,234').closest('div')
    expect(container).toHaveClass('w-full', 'h-full', 'p-4', 'flex', 'flex-col', 'justify-between')
  })

  it('should render value with correct styling', () => {
    render(<StatCardWidget widget={mockWidget} width={200} height={120} />)

    const valueElement = screen.getByText('1,234')
    expect(valueElement).toHaveClass('text-2xl', 'font-bold', 'text-foreground', 'mb-1')
  })

  it('should render label with correct styling', () => {
    render(<StatCardWidget widget={mockWidget} width={200} height={120} />)

    const labelElement = screen.getByText('Total Sales')
    expect(labelElement).toHaveClass('text-sm', 'text-muted-foreground')
  })

  it('should handle missing change data gracefully', () => {
    const widgetWithoutChange: DashboardWidget = {
      ...mockWidget,
      data: {
        value: 100,
        label: 'No Change',
        trend: 'up'
      }
    }

    render(<StatCardWidget widget={widgetWithoutChange} width={200} height={120} />)

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('No Change')).toBeInTheDocument()
    // Should not render trend section if no change data
    expect(screen.queryByText('+12.5%')).not.toBeInTheDocument()
  })

  it('should handle missing trend data gracefully', () => {
    const widgetWithoutTrend: DashboardWidget = {
      ...mockWidget,
      data: {
        value: 100,
        label: 'No Trend',
        change: '+5%'
      }
    }

    render(<StatCardWidget widget={widgetWithoutTrend} width={200} height={120} />)

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('No Trend')).toBeInTheDocument()
    // Should still render change if present
    expect(screen.getByText('+5%')).toBeInTheDocument()
  })

  it('should respect config settings for showing/hiding elements', () => {
    // Mock config that hides certain elements
    vi.mocked(require('@/components/dashboard/ConfigContext').useConfig).mockReturnValue({
      getConfig: () => ({
        card: {
          showValue: false,
          showLabel: false,
          showTrend: false
        }
      })
    })

    render(<StatCardWidget widget={mockWidget} width={200} height={120} />)

    // Elements should be hidden based on config
    expect(screen.queryByText('1,234')).not.toBeInTheDocument()
    expect(screen.queryByText('Total Sales')).not.toBeInTheDocument()
    expect(screen.queryByText('+12.5%')).not.toBeInTheDocument()
  })

  it('should show elements by default when config is undefined', () => {
    // Mock config that returns undefined for card settings
    vi.mocked(require('@/components/dashboard/ConfigContext').useConfig).mockReturnValue({
      getConfig: () => ({})
    })

    render(<StatCardWidget widget={mockWidget} width={200} height={120} />)

    // Elements should be visible by default
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('Total Sales')).toBeInTheDocument()
    expect(screen.getByText('+12.5%')).toBeInTheDocument()
  })
})
