import { TrendingUp, TrendingDown } from "lucide-react";
import { memo, useMemo } from "react";
import { DashboardWidget } from "../../DashboardContext";
import { useConfig } from "../../ConfigContext";

interface StatCardWidgetProps {
  widget: DashboardWidget;
  width: number;
  height: number;
}

// Mock data generator
const generateMockStatData = () => {
  const stats = [
    { value: 12543, label: 'Total Sales', change: '+12.5%', trend: 'up' },
    { value: 8921, label: 'Active Users', change: '+8.2%', trend: 'up' },
    { value: 234, label: 'New Orders', change: '-2.1%', trend: 'down' },
    { value: 98.5, label: 'Satisfaction', change: '+1.3%', trend: 'up' },
    { value: 4567, label: 'Revenue', change: '+15.7%', trend: 'up' },
    { value: 23, label: 'Pending Tasks', change: '-5.2%', trend: 'down' }
  ];
  return stats[Math.floor(Math.random() * stats.length)];
};

export const StatCardWidget = memo(({ widget, width, height }: StatCardWidgetProps) => {
  const { getConfig } = useConfig();
  const config = useMemo(() => getConfig(widget.id), [getConfig, widget.id]);
  
  // Use mock data if no data provided
  const mockData = useMemo(() => generateMockStatData(), []);
  const { value, label, change, trend } = useMemo(() => widget.data || mockData, [widget.data, mockData]);
  const isPositive = useMemo(() => trend === 'up', [trend]);

  return (
    <div className="w-full h-full p-4 flex flex-col justify-between">
      <div>
        {config?.card?.showValue !== false && (
          <div className="text-2xl font-bold text-foreground mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        )}
        {config?.card?.showLabel !== false && (
          <div className="text-sm text-muted-foreground">
            {label}
          </div>
        )}
      </div>
      
      {config?.card?.showTrend !== false && change && (
        <div className={`flex items-center space-x-1 text-sm ${
          isPositive ? 'text-chart-success' : 'text-chart-error'
        }`}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
});