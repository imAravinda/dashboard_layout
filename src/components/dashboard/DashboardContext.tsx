import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from "react";

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

interface DashboardContextType {
  widgets: DashboardWidget[];
  addWidget: (widget: Omit<DashboardWidget, 'id'>) => void;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (id: string) => void;
  selectedWidget: string | null;
  setSelectedWidget: (id: string | null) => void;
  gridSize: number;
  isResizing: boolean;
  setIsResizing: (isResizing: boolean) => void;
  saveDashboard: () => void;
  loadDashboard: () => void;
  clearDashboard: () => void;
  hasUnsavedChanges: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const DASHBOARD_STORAGE_KEY = 'dashboard-layout-widgets';

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const gridSize = 20;

  const addWidget = useCallback((widget: Omit<DashboardWidget, 'id'>) => {
    const newWidget: DashboardWidget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setWidgets(prev => [...prev, newWidget]);
    setHasUnsavedChanges(true);
  }, []);

  const updateWidget = useCallback((id: string, updates: Partial<DashboardWidget>) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id ? { ...widget, ...updates } : widget
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
    if (selectedWidget === id) {
      setSelectedWidget(null);
    }
    setHasUnsavedChanges(true);
  }, [selectedWidget]);

  const saveDashboard = useCallback(() => {
    try {
      const dashboardData = {
        widgets,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(dashboardData));
      setHasUnsavedChanges(false);
      console.log('Dashboard saved successfully');
    } catch (error) {
      console.error('Failed to save dashboard:', error);
    }
  }, [widgets]);

  const loadDashboard = useCallback(() => {
    try {
      const savedData = localStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (savedData) {
        const dashboardData = JSON.parse(savedData);
        if (dashboardData.widgets && Array.isArray(dashboardData.widgets)) {
          setWidgets(dashboardData.widgets);
          setHasUnsavedChanges(false);
          console.log('Dashboard loaded successfully');
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }, []);

  const clearDashboard = useCallback(() => {
    try {
      localStorage.removeItem(DASHBOARD_STORAGE_KEY);
      setWidgets([]);
      setSelectedWidget(null);
      setHasUnsavedChanges(false);
      console.log('Dashboard cleared successfully');
    } catch (error) {
      console.error('Failed to clear dashboard:', error);
    }
  }, []);

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Auto-save when widgets change (with debounce)
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        saveDashboard();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [widgets, hasUnsavedChanges, saveDashboard]);

  const contextValue = useMemo(() => ({
    widgets,
    addWidget,
    updateWidget,
    removeWidget,
    selectedWidget,
    setSelectedWidget,
    gridSize,
    isResizing,
    setIsResizing,
    saveDashboard,
    loadDashboard,
    clearDashboard,
    hasUnsavedChanges,
  }), [widgets, addWidget, updateWidget, removeWidget, selectedWidget, isResizing, saveDashboard, loadDashboard, clearDashboard, hasUnsavedChanges]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};