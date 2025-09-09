import * as echarts from "echarts/core";
import { GaugeChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { DashboardWidget } from "../../DashboardContext";
import { useConfig } from "../../ConfigContext";
import { ECharts } from "@/components/ui/echarts";

echarts.use([GaugeChart, CanvasRenderer]);

interface GaugeWidgetProps {
  widget: DashboardWidget;
  width: number;
  height: number;
}

// Mock data generator
const generateMockGaugeData = () => {
  return {
    value: Math.floor(Math.random() * 100),
    label: "Performance",
    min: 0,
    max: 100,
    unit: "%",
  };
};

export const GaugeWidget = ({ widget, width, height }: GaugeWidgetProps) => {
  const { getConfig } = useConfig();
  const config = getConfig(widget.id);

  // Use mock data if no data provided
  const gaugeData =
    widget.data && widget.data.value !== undefined
      ? widget.data
      : generateMockGaugeData();

  const option = {
    title: {
      text: String(gaugeData.label || "Performance"),
      left: "center",
      top: "10%",
      textStyle: {
        color: "hsl(var(--foreground))",
        fontSize: 14,
        fontWeight: "bold" as const,
      },
    },
    series: [
      {
        type: "gauge" as const,
        startAngle: 180,
        endAngle: 0,
        min: Number(config?.gauge?.min ?? (gaugeData.min || 0)),
        max: Number(config?.gauge?.max ?? (gaugeData.max || 100)),
        splitNumber: 5,
        itemStyle: {
          color: config?.chart?.colors?.[0] || "hsl(var(--chart-primary))",
        },
        progress: {
          show: config?.gauge?.showProgress !== false,
          width: 12,
          itemStyle: {
            color: config?.chart?.colors?.[0] || "hsl(var(--chart-primary))",
          },
        },
        pointer: {
          show: config?.gauge?.showPointer ?? false,
        },
        axisLine: {
          lineStyle: {
            width: 12,
            color: [
              [0.3, "hsl(var(--chart-error))"],
              [0.7, "hsl(var(--chart-warning))"],
              [1, "hsl(var(--chart-success))"],
            ] as [number, string][],
          },
        },
        axisTick: {
          distance: -30,
          length: 8,
          lineStyle: {
            color: "hsl(var(--foreground))",
            width: 2,
          },
        },
        splitLine: {
          distance: -30,
          length: 12,
          lineStyle: {
            color: "hsl(var(--foreground))",
            width: 4,
          },
        },
        axisLabel: {
          color: "hsl(var(--foreground))",
          distance: 40,
          fontSize: 12,
        },
        detail: {
          valueAnimation: config?.chart?.animation !== false,
          show: config?.gauge?.showValue !== false,
          formatter: `{value}${config?.gauge?.unit || gaugeData.unit || "%"}`,
          color: "hsl(var(--foreground))",
          fontSize: 20,
          offsetCenter: [0, "60%"],
        },
        data: [
          {
            value: Number(gaugeData.value),
            name: String(gaugeData.label || "Performance"),
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full h-full p-2">
      <ECharts
        echarts={echarts}
        option={option}
        style={{ width: "100%", height: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
};
