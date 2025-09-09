import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";

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
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const gridSize = 20;

  const addWidget = useCallback((widget: Omit<DashboardWidget, 'id'>) => {
    const newWidget: DashboardWidget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setWidgets(prev => [...prev, newWidget]);
  }, []);

  const updateWidget = useCallback((id: string, updates: Partial<DashboardWidget>) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id ? { ...widget, ...updates } : widget
      )
    );
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
    if (selectedWidget === id) {
      setSelectedWidget(null);
    }
  }, [selectedWidget]);

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
  }), [widgets, addWidget, updateWidget, removeWidget, selectedWidget, isResizing]);

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