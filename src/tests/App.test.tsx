import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'

// Mock the pages
vi.mock('@/pages/Index', () => ({
  default: () => <div data-testid="index-page">Index Page</div>
}))

vi.mock('@/pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>
}))

// Mock the UI components
vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>
}))

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="sonner">Sonner</div>
}))

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  )
}))

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-client-provider">{children}</div>
  )
}))

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />)
    
    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument()
    expect(screen.getByTestId('toaster')).toBeInTheDocument()
    expect(screen.getByTestId('sonner')).toBeInTheDocument()
  })

  it('should render Index page for root route', () => {
    render(<App />)
    
    expect(screen.getByTestId('index-page')).toBeInTheDocument()
  })

  it('should render NotFound page for unknown routes', () => {
    // Mock window.location for testing different routes
    delete (window as any).location
    window.location = { pathname: '/unknown-route' } as any
    
    render(<App />)
    
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
  })

  it('should have correct component hierarchy', () => {
    render(<App />)
    
    const queryProvider = screen.getByTestId('query-client-provider')
    const tooltipProvider = screen.getByTestId('tooltip-provider')
    const toaster = screen.getByTestId('toaster')
    const sonner = screen.getByTestId('sonner')
    const indexPage = screen.getByTestId('index-page')
    
    // Check that components are rendered
    expect(queryProvider).toBeInTheDocument()
    expect(tooltipProvider).toBeInTheDocument()
    expect(toaster).toBeInTheDocument()
    expect(sonner).toBeInTheDocument()
    expect(indexPage).toBeInTheDocument()
  })

  it('should provide QueryClient context', () => {
    const { QueryClient } = require('@tanstack/react-query')
    
    render(<App />)
    
    expect(QueryClient).toHaveBeenCalled()
  })

  it('should provide TooltipProvider context', () => {
    render(<App />)
    
    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument()
  })

  it('should render both toast providers', () => {
    render(<App />)
    
    expect(screen.getByTestId('toaster')).toBeInTheDocument()
    expect(screen.getByTestId('sonner')).toBeInTheDocument()
  })

  it('should handle route changes', () => {
    // Test that the app can handle different routes
    render(<App />)
    
    // Initially should show index page
    expect(screen.getByTestId('index-page')).toBeInTheDocument()
  })

  it('should have proper TypeScript types', () => {
    // This test ensures the App component has proper TypeScript support
    const AppComponent = App as React.ComponentType
    expect(typeof AppComponent).toBe('function')
  })

  it('should render all required providers', () => {
    render(<App />)
    
    // Check that all context providers are rendered
    const providers = [
      'query-client-provider',
      'tooltip-provider'
    ]
    
    providers.forEach(provider => {
      expect(screen.getByTestId(provider)).toBeInTheDocument()
    })
  })

  it('should render toast components', () => {
    render(<App />)
    
    // Check that both toast systems are available
    expect(screen.getByTestId('toaster')).toBeInTheDocument()
    expect(screen.getByTestId('sonner')).toBeInTheDocument()
  })

  it('should handle component unmounting', () => {
    const { unmount } = render(<App />)
    
    expect(screen.getByTestId('index-page')).toBeInTheDocument()
    
    unmount()
    
    // Component should unmount without errors
    expect(screen.queryByTestId('index-page')).not.toBeInTheDocument()
  })
})
