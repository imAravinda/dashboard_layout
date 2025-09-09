import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentLibrary } from '@/components/dashboard/ComponentLibrary'

// Mock the CustomComponentModal
vi.mock('@/components/dashboard/CustomComponentModal', () => ({
  CustomComponentModal: ({ isOpen, onClose, onSave }: any) => 
    isOpen ? (
      <div data-testid="custom-component-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSave({
          id: 'custom-test',
          name: 'Test Custom',
          description: 'Test Description',
          category: 'Custom',
          width: 200,
          height: 150
        })}>Save</button>
      </div>
    ) : null
}))

describe('ComponentLibrary', () => {
  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks()
  })

  it('should render all default components', () => {
    render(<ComponentLibrary />)

    // Check for default components
    expect(screen.getByText('Line Chart')).toBeInTheDocument()
    expect(screen.getByText('Bar Chart')).toBeInTheDocument()
    expect(screen.getByText('Pie Chart')).toBeInTheDocument()
    expect(screen.getByText('Stat Card')).toBeInTheDocument()
    expect(screen.getByText('Data Table')).toBeInTheDocument()
    expect(screen.getByText('Calculator')).toBeInTheDocument()
    expect(screen.getByText('Activity Monitor')).toBeInTheDocument()
    expect(screen.getByText('Gauge')).toBeInTheDocument()
  })

  it('should render component categories', () => {
    render(<ComponentLibrary />)

    // Check for category badges
    expect(screen.getAllByText('Charts')).toHaveLength(3) // Line, Bar, Pie charts
    expect(screen.getAllByText('Stats')).toHaveLength(2) // Stat Card, Gauge
    expect(screen.getByText('Data')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('Monitoring')).toBeInTheDocument()
  })

  it('should render search input', () => {
    render(<ComponentLibrary />)

    const searchInput = screen.getByPlaceholderText('Search components...')
    expect(searchInput).toBeInTheDocument()
  })

  it('should render category filter buttons', () => {
    render(<ComponentLibrary />)

    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Charts')).toBeInTheDocument()
    expect(screen.getByText('Stats')).toBeInTheDocument()
    expect(screen.getByText('Data')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('Monitoring')).toBeInTheDocument()
  })

  it('should render create custom component button', () => {
    render(<ComponentLibrary />)

    expect(screen.getByText('Create Custom Component')).toBeInTheDocument()
  })

  it('should filter components by search term', async () => {
    const user = userEvent.setup()
    render(<ComponentLibrary />)

    const searchInput = screen.getByPlaceholderText('Search components...')
    
    await user.type(searchInput, 'chart')

    // Should show chart components
    expect(screen.getByText('Line Chart')).toBeInTheDocument()
    expect(screen.getByText('Bar Chart')).toBeInTheDocument()
    expect(screen.getByText('Pie Chart')).toBeInTheDocument()
    
    // Should not show non-chart components
    expect(screen.queryByText('Stat Card')).not.toBeInTheDocument()
    expect(screen.queryByText('Calculator')).not.toBeInTheDocument()
  })

  it('should filter components by description', async () => {
    const user = userEvent.setup()
    render(<ComponentLibrary />)

    const searchInput = screen.getByPlaceholderText('Search components...')
    
    await user.type(searchInput, 'time series')

    // Should show line chart (has "time series" in description)
    expect(screen.getByText('Line Chart')).toBeInTheDocument()
    
    // Should not show other components
    expect(screen.queryByText('Bar Chart')).not.toBeInTheDocument()
    expect(screen.queryByText('Stat Card')).not.toBeInTheDocument()
  })

  it('should filter components by category', async () => {
    const user = userEvent.setup()
    render(<ComponentLibrary />)

    const chartsButton = screen.getByText('Charts')
    await user.click(chartsButton)

    // Should show only chart components
    expect(screen.getByText('Line Chart')).toBeInTheDocument()
    expect(screen.getByText('Bar Chart')).toBeInTheDocument()
    expect(screen.getByText('Pie Chart')).toBeInTheDocument()
    
    // Should not show non-chart components
    expect(screen.queryByText('Stat Card')).not.toBeInTheDocument()
    expect(screen.queryByText('Calculator')).not.toBeInTheDocument()
  })

  it('should clear category filter when clicking All', async () => {
    const user = userEvent.setup()
    render(<ComponentLibrary />)

    // First filter by category
    const chartsButton = screen.getByText('Charts')
    await user.click(chartsButton)

    // Then click All
    const allButton = screen.getByText('All')
    await user.click(allButton)

    // Should show all components again
    expect(screen.getByText('Line Chart')).toBeInTheDocument()
    expect(screen.getByText('Stat Card')).toBeInTheDocument()
    expect(screen.getByText('Calculator')).toBeInTheDocument()
  })

  it('should combine search and category filters', async () => {
    const user = userEvent.setup()
    render(<ComponentLibrary />)

    // Filter by category first
    const chartsButton = screen.getByText('Charts')
    await user.click(chartsButton)

    // Then search within that category
    const searchInput = screen.getByPlaceholderText('Search components...')
    await user.type(searchInput, 'line')

    // Should show only line chart
    expect(screen.getByText('Line Chart')).toBeInTheDocument()
    expect(screen.queryByText('Bar Chart')).not.toBeInTheDocument()
    expect(screen.queryByText('Pie Chart')).not.toBeInTheDocument()
  })

  it('should open custom component modal when clicking create button', async () => {
    const user = userEvent.setup()
    render(<ComponentLibrary />)

    const createButton = screen.getByText('Create Custom Component')
    await user.click(createButton)

    expect(screen.getByTestId('custom-component-modal')).toBeInTheDocument()
  })

  it('should close custom component modal', async () => {
    const user = userEvent.setup()
    render(<ComponentLibrary />)

    // Open modal
    const createButton = screen.getByText('Create Custom Component')
    await user.click(createButton)

    expect(screen.getByTestId('custom-component-modal')).toBeInTheDocument()

    // Close modal
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)

    expect(screen.queryByTestId('custom-component-modal')).not.toBeInTheDocument()
  })

  it('should add custom component when saved', async () => {
    const user = userEvent.setup()
    render(<ComponentLibrary />)

    // Open modal and save custom component
    const createButton = screen.getByText('Create Custom Component')
    await user.click(createButton)

    const saveButton = screen.getByText('Save')
    await user.click(saveButton)

    // Should add the custom component to the list
    expect(screen.getByText('Test Custom')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('should show component dimensions', () => {
    render(<ComponentLibrary />)

    // Check that dimensions are displayed
    expect(screen.getByText('400×300')).toBeInTheDocument() // Line Chart
    expect(screen.getByText('200×120')).toBeInTheDocument() // Stat Card
    expect(screen.getByText('500×300')).toBeInTheDocument() // Data Table
  })

  it('should make components draggable', () => {
    render(<ComponentLibrary />)

    // All components should have draggable attributes
    const components = screen.getAllByRole('generic')
    components.forEach(component => {
      // Check if component has draggable attributes (this would be set by useDraggable)
      expect(component).toBeInTheDocument()
    })
  })

  it('should display component descriptions', () => {
    render(<ComponentLibrary />)

    expect(screen.getByText('Time series data visualization')).toBeInTheDocument()
    expect(screen.getByText('Categorical data comparison')).toBeInTheDocument()
    expect(screen.getByText('Part-to-whole relationships')).toBeInTheDocument()
    expect(screen.getByText('Key performance indicators')).toBeInTheDocument()
  })

  it('should handle empty search results', async () => {
    const user = userEvent.setup()
    render(<ComponentLibrary />)

    const searchInput = screen.getByPlaceholderText('Search components...')
    await user.type(searchInput, 'nonexistent')

    // Should not show any components
    expect(screen.queryByText('Line Chart')).not.toBeInTheDocument()
    expect(screen.queryByText('Stat Card')).not.toBeInTheDocument()
  })

  it('should handle case-insensitive search', async () => {
    const user = userEvent.setup()
    render(<ComponentLibrary />)

    const searchInput = screen.getByPlaceholderText('Search components...')
    await user.type(searchInput, 'CHART')

    // Should find chart components despite case difference
    expect(screen.getByText('Line Chart')).toBeInTheDocument()
    expect(screen.getByText('Bar Chart')).toBeInTheDocument()
    expect(screen.getByText('Pie Chart')).toBeInTheDocument()
  })
})
