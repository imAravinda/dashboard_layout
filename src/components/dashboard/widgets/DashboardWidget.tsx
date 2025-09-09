import React, { useState, useRef, useCallback, memo, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { X, Move, Maximize2, Settings } from "lucide-react";
import { useDashboard, DashboardWidget as WidgetType } from "../DashboardContext";
import { useConfig } from "../ConfigContext";
import { WidgetRenderer } from "./WidgetRenderer";
import { WidgetSettingsPanel } from "../WidgetSettingsPanel";

interface DashboardWidgetProps {
  widget: WidgetType;
}

export const DashboardWidget = memo(({ widget }: DashboardWidgetProps) => {
  const { updateWidget, removeWidget, selectedWidget, setSelectedWidget, gridSize, isResizing, setIsResizing } = useDashboard();
  const { getConfig } = useConfig();
  const [isResizingWidget, setIsResizingWidget] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  
  const config = useMemo(() => getConfig(widget.id), [getConfig, widget.id]);

  const isSelected = useMemo(() => selectedWidget === widget.id, [selectedWidget, widget.id]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: widget.id,
    data: {
      type: 'widget',
      widgetId: widget.id,
    },
    disabled: isResizingWidget,
  });

  const style = useMemo(() => transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined, [transform]);

  const handleWidgetClick = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left click
    e.preventDefault();
    setSelectedWidget(widget.id);
  }, [widget.id, setSelectedWidget]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingWidget(true);
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: widget.width,
      height: widget.height,
    });
  }, [widget.width, widget.height, setIsResizing]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingWidget) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(100, Math.round((resizeStart.width + deltaX) / gridSize) * gridSize);
      const newHeight = Math.max(80, Math.round((resizeStart.height + deltaY) / gridSize) * gridSize);
      
      updateWidget(widget.id, {
        width: newWidth,
        height: newHeight,
      });
    }
  }, [isResizingWidget, resizeStart, gridSize, updateWidget, widget.id]);

  const handleMouseUp = useCallback(() => {
    setIsResizingWidget(false);
    setIsResizing(false);
  }, [setIsResizing]);

  // Attach global mouse events for resizing
  React.useEffect(() => {
    if (isResizingWidget) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizingWidget, handleMouseMove, handleMouseUp]);

  return (
    <>
      <div
        ref={(node) => {
          widgetRef.current = node;
          setNodeRef(node);
        }}
        className={`absolute bg-dashboard-panel border border-dashboard-border rounded-lg overflow-hidden transition-all ${
          isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:border-primary/50'
        } ${isDragging ? 'cursor-grabbing opacity-90' : 'cursor-grab'}`}
        style={{
          left: widget.x,
          top: widget.y,
          width: widget.width,
          height: widget.height,
          zIndex: isSelected ? 10 : 1,
          backgroundColor: config?.style?.backgroundColor,
          borderColor: config?.style?.borderColor,
          borderRadius: config?.style?.borderRadius,
          padding: config?.style?.padding,
          ...style,
        }}
        onClick={handleWidgetClick}
      >
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-muted/50 border-b border-dashboard-border">
        <div className="flex items-center space-x-2" {...listeners} {...attributes}>
          <Move className="h-4 w-4 text-muted-foreground cursor-grab" />
          <span className="text-sm font-medium text-foreground truncate">{widget.title}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingsOpen(true);
            }}
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Maximize widget
            }}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              removeWidget(widget.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="h-full pb-8 overflow-hidden">
        <WidgetRenderer widget={widget} />
      </div>

      {/* Resize Handle */}
      {isSelected && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-se-resize opacity-50 hover:opacity-100"
          onMouseDown={handleResizeMouseDown}
          style={{
            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          }}
        />
      )}
      </div>

      {/* Settings Panel */}
      <WidgetSettingsPanel
        widgetId={widget.id}
        widgetType={widget.type}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
});