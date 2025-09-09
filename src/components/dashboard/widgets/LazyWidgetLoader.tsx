import { lazy, Suspense, memo } from 'react';

// Lazy load widget components
const StatCardWidget = lazy(() => import('./stats/StatCardWidget').then(module => ({ default: module.StatCardWidget })));
const LineChartWidget = lazy(() => import('./charts/LineChartWidget').then(module => ({ default: module.LineChartWidget })));
const BarChartWidget = lazy(() => import('./charts/BarChartWidget').then(module => ({ default: module.BarChartWidget })));
const PieChartWidget = lazy(() => import('./charts/PieChartWidget').then(module => ({ default: module.PieChartWidget })));
const DataTableWidget = lazy(() => import('./data/DataTableWidget').then(module => ({ default: module.DataTableWidget })));
const CalculatorWidget = lazy(() => import('./tools/CalculatorWidget').then(module => ({ default: module.CalculatorWidget })));
const ActivityMonitorWidget = lazy(() => import('./monitoring/ActivityMonitorWidget').then(module => ({ default: module.ActivityMonitorWidget })));
const GaugeWidget = lazy(() => import('./stats/GaugeWidget').then(module => ({ default: module.GaugeWidget })));
const CustomWidget = lazy(() => import('./CustomWidget').then(module => ({ default: module.CustomWidget })));

// Widget loading component
const WidgetLoader = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
  </div>
);

// Widget component mapping
const widgetComponents = {
  'stat-card': StatCardWidget,
  'line-chart': LineChartWidget,
  'bar-chart': BarChartWidget,
  'pie-chart': PieChartWidget,
  'data-table': DataTableWidget,
  'calculator': CalculatorWidget,
  'activity-monitor': ActivityMonitorWidget,
  'gauge': GaugeWidget,
  'custom': CustomWidget,
} as const;

interface LazyWidgetLoaderProps {
  widgetType: string;
  widget: any;
  width: number;
  height: number;
}

export const LazyWidgetLoader = memo(({ widgetType, widget, width, height }: LazyWidgetLoaderProps) => {
  const WidgetComponent = widgetComponents[widgetType as keyof typeof widgetComponents];

  if (!WidgetComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-sm font-medium">Unknown Widget</div>
          <div className="text-xs">Type: {widgetType}</div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<WidgetLoader />}>
      <WidgetComponent widget={widget} width={width} height={height} />
    </Suspense>
  );
});
