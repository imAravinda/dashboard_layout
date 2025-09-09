import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { useState, useRef, useMemo, useCallback, memo } from "react";
import { DashboardCanvas } from "./DashboardCanvas";
import { ComponentLibrary } from "./ComponentLibrary";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import { ConfigProvider } from "./ConfigContext";

const DashboardBuilderContent = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { addWidget, updateWidget, widgets, gridSize } = useDashboard();
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveId(null);

    if (!over || over.id !== 'dashboard-canvas') return;

    // Get canvas position for coordinate calculation
    const canvasElement = document.querySelector('[data-canvas="true"]') as HTMLElement;
    if (!canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();

    // Check if it's a new component being added from the library
    if (active.data.current?.type === 'component') {
      const component = active.data.current.component;
      
      // Calculate drop position based on the final mouse position
      const activeRect = active.rect.current.translated;
      if (activeRect) {
        const x = Math.round((activeRect.left - rect.left) / gridSize) * gridSize;
        const y = Math.round((activeRect.top - rect.top) / gridSize) * gridSize;
        
        addWidget({
          type: component.id,
          title: component.name,
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: component.defaultSize.width,
          height: component.defaultSize.height,
          data: component.id.startsWith('custom-') ? 
            { isCustom: true, content: '', styles: '', colors: {} } : 
            generateSampleData(component.id),
          config: getDefaultConfig(component.id),
        });
      }
    }
    // Handle moving existing widgets
    else if (active.data.current?.type === 'widget') {
      const widgetId = active.data.current.widgetId;
      const widget = widgets.find(w => w.id === widgetId);
      
      if (widget && delta) {
        const newX = Math.round((widget.x + delta.x) / gridSize) * gridSize;
        const newY = Math.round((widget.y + delta.y) / gridSize) * gridSize;
        
        updateWidget(widgetId, {
          x: Math.max(0, newX),
          y: Math.max(0, newY),
        });
      }
    }
  }, [addWidget, updateWidget, widgets, gridSize]);

  const generateSampleData = useCallback((type: string) => {
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
  }, []);

  const getDefaultConfig = useCallback((type: string) => {
    return {
      theme: 'scientific',
      responsive: true,
    };
  }, []);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="flex h-screen bg-dashboard-bg">
        {/* Left Sidebar - Component Library */}
        <div className="w-80 bg-dashboard-panel border-r border-dashboard-border">
          <ComponentLibrary />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 overflow-hidden">
            <DashboardCanvas />
          </div>
        </div>
      </div>
      
      <DragOverlay>
        {activeId ? (
          <div className="bg-dashboard-panel border border-primary rounded-lg p-4 shadow-xl opacity-90">
            <div className="text-sm font-medium">
              {activeId.startsWith('widget-') ? 'Moving Widget' : 'Adding Component'}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export const DashboardBuilder = memo(() => {
  return (
    <DashboardProvider>
      <ConfigProvider>
        <DashboardBuilderContent />
      </ConfigProvider>
    </DashboardProvider>
  );
});