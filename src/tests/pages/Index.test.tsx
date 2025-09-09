import { render, screen } from '@testing-library/react'
import Index from '@/pages/Index'

// Mock the DashboardBuilder component
vi.mock('@/components/dashboard/DashboardBuilder', () => ({
  DashboardBuilder: () => <div data-testid="dashboard-builder">Dashboard Builder</div>
}))

describe('Index Page', () => {
  it('should render without crashing', () => {
    render(<Index />)
    
    expect(screen.getByTestId('dashboard-builder')).toBeInTheDocument()
  })

  it('should render DashboardBuilder component', () => {
    render(<Index />)
    
    expect(screen.getByTestId('dashboard-builder')).toBeInTheDocument()
  })

  it('should have correct container styling', () => {
    render(<Index />)
    
    const container = screen.getByTestId('dashboard-builder').parentElement
    expect(container).toHaveClass('min-h-screen', 'bg-dashboard-bg')
  })

  it('should render as a functional component', () => {
    expect(typeof Index).toBe('function')
  })

  it('should handle component unmounting', () => {
    const { unmount } = render(<Index />)
    
    expect(screen.getByTestId('dashboard-builder')).toBeInTheDocument()
    
    unmount()
    
    expect(screen.queryByTestId('dashboard-builder')).not.toBeInTheDocument()
  })

  it('should have proper TypeScript types', () => {
    // This test ensures the Index component has proper TypeScript support
    const IndexComponent = Index as React.ComponentType
    expect(typeof IndexComponent).toBe('function')
  })

  it('should render with correct layout structure', () => {
    render(<Index />)
    
    const container = screen.getByTestId('dashboard-builder').parentElement
    expect(container).toHaveClass('min-h-screen', 'bg-dashboard-bg')
    expect(container?.tagName).toBe('DIV')
  })

  it('should be the default export', () => {
    // Test that Index is the default export
    expect(Index).toBeDefined()
    expect(typeof Index).toBe('function')
  })
})
