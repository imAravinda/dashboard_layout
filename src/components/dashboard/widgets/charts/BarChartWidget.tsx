import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { DashboardWidget } from "../../DashboardContext";
import { useConfig } from "../../ConfigContext";
import { ECharts } from "@/components/ui/echarts";

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

interface BarChartWidgetProps {
  widget: DashboardWidget;
  width: number;
  height: number;
}

interface SeriesData {
  name?: string;
  type?: 'bar';
  data?: number[];
  itemStyle?: {
    color?: string;
    borderRadius?: number[];
  };
  emphasis?: {
    itemStyle?: {
      color?: string;
    };
  };
  [key: string]: unknown;
}

// Mock data generator
const generateMockBarData = (customColors?: string[]) => {
  const defaultColors = [
    'hsl(var(--chart-primary))',
    'hsl(var(--chart-secondary))',
    'hsl(var(--chart-tertiary))',
    'hsl(var(--chart-quaternary))'
  ];
  const colors = customColors || defaultColors;

  return {
    title: {
      text: 'Sales Performance',
      left: 'center',
      textStyle: {
        color: 'hsl(var(--foreground))',
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    },
    xAxis: {
      type: 'category' as const,
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisLine: {
        lineStyle: { color: 'hsl(var(--border))' }
      },
      axisLabel: {
        color: 'hsl(var(--muted-foreground))',
      },
    },
    yAxis: {
      type: 'value' as const,
      axisLine: {
        lineStyle: { color: 'hsl(var(--border))' }
      },
      axisLabel: {
        color: 'hsl(var(--muted-foreground))',
      },
      splitLine: {
        lineStyle: { color: 'hsl(var(--border))' }
      },
    },
    series: [
      {
        name: 'Sales',
        type: 'bar',
        data: [120, 200, 150, 80, 70, 110, 130, 180, 160, 140, 190, 220],
        itemStyle: {
          color: colors[0],
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: colors[0] + '80', // Add transparency
          }
        }
      },
      {
        name: 'Target',
        type: 'bar',
        data: [100, 180, 160, 90, 80, 120, 140, 170, 150, 130, 180, 200],
        itemStyle: {
          color: colors[1],
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: colors[1] + '80', // Add transparency
          }
        }
      },
      {
        name: 'Profit',
        type: 'bar',
        data: [80, 120, 90, 60, 50, 80, 100, 140, 120, 100, 130, 160],
        itemStyle: {
          color: colors[2],
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: colors[2] + '80', // Add transparency
          }
        }
      }
    ]
  };
};

export const BarChartWidget = ({ widget, width, height }: BarChartWidgetProps) => {
  const { getConfig } = useConfig();
  const config = getConfig(widget.id);
  
  // Get custom colors from config
  const customColors = config?.chart?.seriesColors || config?.chart?.colors;
  
  // Use mock data if no data provided, otherwise merge with widget data
  const mockData = generateMockBarData(customColors);
  const chartData = widget.data ? {
    ...mockData,
    ...widget.data,
    series: widget.data.series || mockData.series
  } : mockData;

  // Apply individual series colors if provided
  const processedSeries = (chartData.series as SeriesData[]).map((series: SeriesData, index: number) => {
    const seriesColor = customColors?.[index];
    if (seriesColor) {
      return {
        ...series,
        itemStyle: {
          ...series.itemStyle,
          color: seriesColor,
        },
        emphasis: {
          ...series.emphasis,
          itemStyle: {
            ...series.emphasis?.itemStyle,
            color: seriesColor + '80', // Add transparency for hover
          }
        }
      };
    }
    return series;
  });

  const option = {
    ...chartData,
    series: processedSeries,
    title: config?.chart?.showTitle !== false ? chartData.title : undefined,
    tooltip: {
      trigger: 'axis' as const,
      show: config?.chart?.showTooltip !== false,
      backgroundColor: 'hsl(var(--popover))',
      borderColor: 'hsl(var(--border))',
      textStyle: {
        color: 'hsl(var(--popover-foreground))',
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%',
      show: config?.chart?.showGrid !== false,
    },
    legend: {
      top: '5%',
      show: config?.chart?.showLegend !== false,
      textStyle: {
        color: 'hsl(var(--foreground))',
      },
    },
    animation: config?.chart?.animation !== false,
    color: customColors || [
      'hsl(var(--chart-primary))',
      'hsl(var(--chart-secondary))',
      'hsl(var(--chart-tertiary))',
      'hsl(var(--chart-quaternary))'
    ],
  };

  return (
    <div className="w-full h-full p-2">
      <ECharts
        echarts={echarts}
        option={option}
        style={{ width: '100%', height: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};