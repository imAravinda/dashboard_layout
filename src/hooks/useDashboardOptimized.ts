import { useCallback, useMemo } from 'react';
import { useDashboard } from '@/components/dashboard/DashboardContext';
import { DashboardWidget } from '@/components/dashboard/DashboardContext';

// Optimized hook for dashboard operations
export const useDashboardOptimized = () => {
  const dashboard = useDashboard();

  // Memoized widget operations
  const widgetOperations = useMemo(() => ({
    addWidget: dashboard.addWidget,
    updateWidget: dashboard.updateWidget,
    removeWidget: dashboard.removeWidget,
    setSelectedWidget: dashboard.setSelectedWidget,
    setIsResizing: dashboard.setIsResizing,
  }), [
    dashboard.addWidget,
    dashboard.updateWidget,
    dashboard.removeWidget,
    dashboard.setSelectedWidget,
    dashboard.setIsResizing,
  ]);

  // Memoized widget data
  const widgetData = useMemo(() => ({
    widgets: dashboard.widgets,
    selectedWidget: dashboard.selectedWidget,
    isResizing: dashboard.isResizing,
    gridSize: dashboard.gridSize,
  }), [
    dashboard.widgets,
    dashboard.selectedWidget,
    dashboard.isResizing,
    dashboard.gridSize,
  ]);

  // Optimized widget finder
  const findWidget = useCallback((id: string) => {
    return dashboard.widgets.find(widget => widget.id === id);
  }, [dashboard.widgets]);

  // Optimized widget filter
  const filterWidgets = useCallback((predicate: (widget: DashboardWidget) => boolean) => {
    return dashboard.widgets.filter(predicate);
  }, [dashboard.widgets]);

  // Optimized widget count
  const widgetCount = useMemo(() => dashboard.widgets.length, [dashboard.widgets.length]);

  // Optimized selected widget data
  const selectedWidgetData = useMemo(() => {
    if (!dashboard.selectedWidget) return null;
    return findWidget(dashboard.selectedWidget);
  }, [dashboard.selectedWidget, findWidget]);

  // Optimized widget by type
  const widgetsByType = useMemo(() => {
    const grouped = dashboard.widgets.reduce((acc, widget) => {
      if (!acc[widget.type]) {
        acc[widget.type] = [];
      }
      acc[widget.type].push(widget);
      return acc;
    }, {} as Record<string, DashboardWidget[]>);
    return grouped;
  }, [dashboard.widgets]);

  return {
    ...widgetOperations,
    ...widgetData,
    findWidget,
    filterWidgets,
    widgetCount,
    selectedWidgetData,
    widgetsByType,
  };
};
