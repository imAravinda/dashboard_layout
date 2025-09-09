import { useRef, memo, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useDashboard } from "./DashboardContext";
import { DashboardWidget } from "./widgets/DashboardWidget";
import { GridBackground } from "./GridBackground";

export const DashboardCanvas = memo(() => {
  const { widgets } = useDashboard();
  const canvasRef = useRef<HTMLDivElement>(null);

  const { isOver, setNodeRef } = useDroppable({
    id: 'dashboard-canvas',
  });

  const hasWidgets = useMemo(() => widgets.length > 0, [widgets.length]);


  return (
    <div 
      ref={(node) => {
        canvasRef.current = node;
        setNodeRef(node);
      }}
      data-canvas="true"
      className={`relative w-full h-full overflow-auto transition-colors ${
        isOver ? 'bg-dashboard-drag-hover/10' : 'bg-dashboard-bg'
      }`}
    >
      <GridBackground />
      
      {/* Drop Zone Indicator */}
      {isOver && (
        <div className="absolute inset-4 border-2 border-dashed border-primary/50 bg-primary/5 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-primary font-medium mb-2">Drop Component Here</div>
            <div className="text-sm text-muted-foreground">Components will snap to the grid</div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasWidgets && !isOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Start Building Your Dashboard</h3>
            <p className="text-muted-foreground mb-6">
              Drag and drop components from the library to create your custom scientific dashboard
            </p>
            <div className="text-sm text-muted-foreground">
              • Charts for data visualization<br/>
              • Stats cards for key metrics<br/>
              • Tables for detailed data<br/>
              • Tools for scientific calculations
            </div>
          </div>
        </div>
      )}

      {/* Widgets */}
      {widgets.map(widget => (
        <DashboardWidget key={widget.id} widget={widget} />
      ))}
    </div>
  );
});