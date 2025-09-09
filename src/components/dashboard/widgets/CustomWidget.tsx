import React, { useEffect, useRef } from 'react';
import { DashboardWidget } from "../DashboardContext";

interface CustomWidgetProps {
  widget: DashboardWidget;
  width: number;
  height: number;
}

export const CustomWidget = ({ widget, width, height }: CustomWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && widget.data?.content) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      // Create a container for the custom content
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = widget.data.content as string;
      
      // Apply custom styles if provided
      if (widget.data.styles) {
        const styleElement = document.createElement('style');
        styleElement.textContent = widget.data.styles as string;
        contentDiv.appendChild(styleElement);
      }
      
      // Apply custom colors if provided
      if (widget.data.colors) {
        const colors = widget.data.colors as {
          primary?: string;
          secondary?: string;
          background?: string;
          text?: string;
        };
        const root = contentDiv as HTMLElement;
        if (colors.primary) {
          root.style.setProperty('--custom-primary', colors.primary);
        }
        if (colors.secondary) {
          root.style.setProperty('--custom-secondary', colors.secondary);
        }
        if (colors.background) {
          root.style.setProperty('--custom-background', colors.background);
        }
        if (colors.text) {
          root.style.setProperty('--custom-text', colors.text);
        }
      }
      
      containerRef.current.appendChild(contentDiv);
    }
  }, [widget.data]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full p-4 overflow-auto"
      style={{
        backgroundColor: (widget.data?.colors as { background?: string })?.background || 'transparent',
        color: (widget.data?.colors as { text?: string })?.text || 'inherit',
      }}
    />
  );
};
