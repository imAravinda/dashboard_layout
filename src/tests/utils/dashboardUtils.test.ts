// Utility functions extracted from DashboardBuilder for testing
export const generateSampleData = (type: string) => {
  switch (type) {
    case 'line-chart':
      return {
        xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
        yAxis: { type: 'value' },
        series: [{
          data: [120, 132, 101, 134, 90, 230],
          type: 'line',
          smooth: true
        }]
      };
    case 'bar-chart':
      return {
        xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
        yAxis: { type: 'value' },
        series: [{
          data: [23, 45, 56, 78, 32],
          type: 'bar'
        }]
      };
    case 'pie-chart':
      return {
        series: [{
          type: 'pie',
          data: [
            { value: 335, name: 'Direct' },
            { value: 310, name: 'Email' },
            { value: 234, name: 'Union Ads' },
            { value: 135, name: 'Video Ads' },
            { value: 1548, name: 'Search Engine' }
          ]
        }]
      };
    case 'stat-card':
      return {
        value: 1234,
        label: 'Total Experiments',
        change: '+12.5%',
        trend: 'up'
      };
    case 'data-table':
      return {
        columns: ['Experiment', 'Status', 'Progress', 'Results'],
        data: [
          ['EXP-001', 'Running', '75%', '98.2%'],
          ['EXP-002', 'Complete', '100%', '94.7%'],
          ['EXP-003', 'Pending', '0%', '--'],
        ]
      };
    case 'gauge':
      return {
        value: 75,
        label: 'Progress'
      };
    default:
      return {};
  }
};

export const getDefaultConfig = (type: string) => {
  return {
    theme: 'scientific',
    responsive: true,
  };
};

export const calculateGridPosition = (x: number, y: number, gridSize: number) => {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  };
};

export const clampToGrid = (value: number, gridSize: number, min: number = 0) => {
  return Math.max(min, Math.round(value / gridSize) * gridSize);
};

describe('Dashboard Utils', () => {
  describe('generateSampleData', () => {
    it('should generate line chart data', () => {
      const data = generateSampleData('line-chart')
      
      expect(data).toHaveProperty('xAxis')
      expect(data).toHaveProperty('yAxis')
      expect(data).toHaveProperty('series')
      expect(data.xAxis).toEqual({
        type: 'category',
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      })
      expect(data.yAxis).toEqual({ type: 'value' })
      expect(data.series).toHaveLength(1)
      expect(data.series[0]).toMatchObject({
        data: [120, 132, 101, 134, 90, 230],
        type: 'line',
        smooth: true
      })
    })

    it('should generate bar chart data', () => {
      const data = generateSampleData('bar-chart')
      
      expect(data).toHaveProperty('xAxis')
      expect(data).toHaveProperty('yAxis')
      expect(data).toHaveProperty('series')
      expect(data.xAxis).toEqual({
        type: 'category',
        data: ['A', 'B', 'C', 'D', 'E']
      })
      expect(data.series[0]).toMatchObject({
        data: [23, 45, 56, 78, 32],
        type: 'bar'
      })
    })

    it('should generate pie chart data', () => {
      const data = generateSampleData('pie-chart')
      
      expect(data).toHaveProperty('series')
      expect(data.series).toHaveLength(1)
      expect(data.series[0]).toMatchObject({
        type: 'pie',
        data: expect.arrayContaining([
          { value: 335, name: 'Direct' },
          { value: 310, name: 'Email' },
          { value: 234, name: 'Union Ads' },
          { value: 135, name: 'Video Ads' },
          { value: 1548, name: 'Search Engine' }
        ])
      })
    })

    it('should generate stat card data', () => {
      const data = generateSampleData('stat-card')
      
      expect(data).toEqual({
        value: 1234,
        label: 'Total Experiments',
        change: '+12.5%',
        trend: 'up'
      })
    })

    it('should generate data table data', () => {
      const data = generateSampleData('data-table')
      
      expect(data).toHaveProperty('columns')
      expect(data).toHaveProperty('data')
      expect(data.columns).toEqual(['Experiment', 'Status', 'Progress', 'Results'])
      expect(data.data).toHaveLength(3)
      expect(data.data[0]).toEqual(['EXP-001', 'Running', '75%', '98.2%'])
    })

    it('should generate gauge data', () => {
      const data = generateSampleData('gauge')
      
      expect(data).toEqual({
        value: 75,
        label: 'Progress'
      })
    })

    it('should return empty object for unknown type', () => {
      const data = generateSampleData('unknown-type')
      
      expect(data).toEqual({})
    })

    it('should handle empty string type', () => {
      const data = generateSampleData('')
      
      expect(data).toEqual({})
    })
  })

  describe('getDefaultConfig', () => {
    it('should return default config for any type', () => {
      const config = getDefaultConfig('line-chart')
      
      expect(config).toEqual({
        theme: 'scientific',
        responsive: true
      })
    })

    it('should return same config for different types', () => {
      const config1 = getDefaultConfig('line-chart')
      const config2 = getDefaultConfig('stat-card')
      
      expect(config1).toEqual(config2)
    })

    it('should handle empty string type', () => {
      const config = getDefaultConfig('')
      
      expect(config).toEqual({
        theme: 'scientific',
        responsive: true
      })
    })
  })

  describe('calculateGridPosition', () => {
    it('should snap coordinates to grid', () => {
      const result = calculateGridPosition(15, 25, 20)
      
      expect(result.x).toBe(20) // 15 rounded to nearest 20
      expect(result.y).toBe(20) // 25 rounded to nearest 20
    })

    it('should handle exact grid positions', () => {
      const result = calculateGridPosition(40, 60, 20)
      
      expect(result.x).toBe(40) // Already on grid
      expect(result.y).toBe(60) // Already on grid
    })

    it('should handle negative coordinates', () => {
      const result = calculateGridPosition(-10, -5, 20)
      
      expect(result.x).toBe(0) // -10 rounded to nearest 20 (0)
      expect(result.y).toBe(0) // -5 rounded to nearest 20 (0)
    })

    it('should handle different grid sizes', () => {
      const result = calculateGridPosition(15, 25, 10)
      
      expect(result.x).toBe(20) // 15 rounded to nearest 10
      expect(result.y).toBe(30) // 25 rounded to nearest 10
    })

    it('should handle zero coordinates', () => {
      const result = calculateGridPosition(0, 0, 20)
      
      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
    })
  })

  describe('clampToGrid', () => {
    it('should clamp to minimum value', () => {
      const result = clampToGrid(-10, 20, 0)
      
      expect(result).toBe(0) // Clamped to minimum
    })

    it('should snap to grid when above minimum', () => {
      const result = clampToGrid(15, 20, 0)
      
      expect(result).toBe(20) // 15 rounded to nearest 20
    })

    it('should handle exact grid positions', () => {
      const result = clampToGrid(40, 20, 0)
      
      expect(result).toBe(40) // Already on grid
    })

    it('should handle different minimum values', () => {
      const result = clampToGrid(5, 20, 10)
      
      expect(result).toBe(10) // Clamped to minimum of 10
    })

    it('should handle zero grid size', () => {
      const result = clampToGrid(15, 0, 0)
      
      expect(result).toBe(15) // No snapping when grid size is 0
    })

    it('should handle negative minimum', () => {
      const result = clampToGrid(-30, 20, -20)
      
      expect(result).toBe(-20) // Clamped to minimum of -20
    })
  })

  describe('Data validation', () => {
    it('should generate valid chart data structures', () => {
      const chartTypes = ['line-chart', 'bar-chart', 'pie-chart']
      
      chartTypes.forEach(type => {
        const data = generateSampleData(type)
        expect(data).toHaveProperty('series')
        expect(Array.isArray(data.series)).toBe(true)
        expect(data.series.length).toBeGreaterThan(0)
      })
    })

    it('should generate valid stat card data', () => {
      const data = generateSampleData('stat-card')
      
      expect(typeof data.value).toBe('number')
      expect(typeof data.label).toBe('string')
      expect(typeof data.change).toBe('string')
      expect(typeof data.trend).toBe('string')
      expect(['up', 'down']).toContain(data.trend)
    })

    it('should generate valid data table structure', () => {
      const data = generateSampleData('data-table')
      
      expect(Array.isArray(data.columns)).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.columns.length).toBeGreaterThan(0)
      expect(data.data.length).toBeGreaterThan(0)
      
      // Each row should have same number of columns
      data.data.forEach(row => {
        expect(Array.isArray(row)).toBe(true)
        expect(row.length).toBe(data.columns.length)
      })
    })

    it('should generate valid gauge data', () => {
      const data = generateSampleData('gauge')
      
      expect(typeof data.value).toBe('number')
      expect(typeof data.label).toBe('string')
      expect(data.value).toBeGreaterThanOrEqual(0)
      expect(data.value).toBeLessThanOrEqual(100)
    })
  })
})
