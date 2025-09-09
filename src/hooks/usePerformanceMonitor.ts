import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
}

export const usePerformanceMonitor = (componentName: string, enabled: boolean = false) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  const startRender = useCallback(() => {
    if (enabled) {
      renderStartTime.current = performance.now();
    }
  }, [enabled]);

  const endRender = useCallback(() => {
    if (enabled && renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      renderCount.current += 1;
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current,
          memoryUsage: (performance as any).memory ? 
            `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` : 
            'N/A'
        });
      }
    }
  }, [enabled, componentName]);

  // Monitor memory usage
  useEffect(() => {
    if (!enabled) return;

    const checkMemory = () => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        
        if (used > 100) { // Warn if memory usage is high
          console.warn(`[Performance] High memory usage detected: ${used}MB / ${total}MB`);
        }
      }
    };

    const interval = setInterval(checkMemory, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [enabled]);

  return {
    startRender,
    endRender,
    renderCount: renderCount.current,
  };
};
