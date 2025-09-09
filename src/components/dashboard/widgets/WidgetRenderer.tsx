import { memo } from "react";
import { DashboardWidget } from "../DashboardContext";
import { LazyWidgetLoader } from "./LazyWidgetLoader";

interface WidgetRendererProps {
  widget: DashboardWidget;
}

export const WidgetRenderer = memo(({ widget }: WidgetRendererProps) => {
  const width = widget.width;
  const height = widget.height - 40; // Account for header

  // Determine widget type for lazy loading
  let widgetType = widget.type;
  if (widget.type.startsWith('custom-') || widget.data?.isCustom) {
    widgetType = 'custom';
  }

  return (
    <LazyWidgetLoader
      widgetType={widgetType}
      widget={widget}
      width={width}
      height={height}
    />
  );
});