import { useEffect, useState } from "react";
import { Activity, Cpu, HardDrive, Wifi } from "lucide-react";
import { DashboardWidget } from "../../DashboardContext";

interface ActivityMonitorWidgetProps {
  widget: DashboardWidget;
  width: number;
  height: number;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export const ActivityMonitorWidget = ({ widget, width, height }: ActivityMonitorWidgetProps) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 68,
    disk: 32,
    network: 78
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.round(Math.random() * 100),
        memory: Math.round(Math.random() * 100),
        disk: Math.round(Math.random() * 100),
        network: Math.round(Math.random() * 100),
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const MetricBar = ({ label, value, icon: Icon, color }: {
    label: string;
    value: number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{label}</span>
        </div>
        <span className="text-sm font-mono text-foreground">{value}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full h-full p-4 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-foreground">System Activity</h3>
      </div>

      <div className="space-y-4">
        <MetricBar
          label="CPU Usage"
          value={metrics.cpu}
          icon={Cpu}
          color="hsl(var(--chart-primary))"
        />
        <MetricBar
          label="Memory"
          value={metrics.memory}
          icon={Activity}
          color="hsl(var(--chart-secondary))"
        />
        <MetricBar
          label="Disk I/O"
          value={metrics.disk}
          icon={HardDrive}
          color="hsl(var(--chart-tertiary))"
        />
        <MetricBar
          label="Network"
          value={metrics.network}
          icon={Wifi}
          color="hsl(var(--chart-quaternary))"
        />
      </div>
    </div>
  );
};