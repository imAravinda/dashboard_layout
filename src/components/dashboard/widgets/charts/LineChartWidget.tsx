import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { DashboardWidget } from "../../DashboardContext";
import { useConfig } from "../../ConfigContext";
import { ECharts } from "@/components/ui/echarts";
import { EChartsOption } from 'echarts';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

interface LineChartWidgetProps {
  widget: DashboardWidget;
  width: number;
  height: number;
}

interface SeriesData {
  name?: string;
  type?: 'line';
  data?: number[];
  areaStyle?: {
    color?: {
      type?: string;
      x?: number;
      y?: number;
      x2?: number;
      y2?: number;
      colorStops?: Array<{ offset: number; color: string }>;
    };
  };
  lineStyle?: {
    color?: string;
    width?: number;
  };
  itemStyle?: {
    color?: string;
  };
  [key: string]: unknown;
}

// Mock data generator
const generateMockLineData = (customColors?: string[]) => {
  const defaultColors = [
    'hsl(var(--chart-primary))',
    'hsl(var(--chart-secondary))',
    'hsl(var(--chart-tertiary))',
    'hsl(var(--chart-quaternary))'
  ];
  const colors = customColors || defaultColors;

  return {
    title: {
      text: 'Revenue Trend',
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
        name: 'Revenue',
        type: 'line',
        data: [820, 932, 901, 934, 1290, 1330, 1320, 1200, 1100, 1000, 1200, 1400],
        smooth: true,
        lineStyle: {
          color: colors[0],
          width: 3,
        },
        itemStyle: {
          color: colors[0],
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: colors[0] + '4D' }, // 30% opacity
              { offset: 1, color: colors[0] + '0D' }  // 5% opacity
            ],
          }
        }
      },
      {
        name: 'Profit',
        type: 'line',
        data: [620, 732, 701, 734, 1090, 1130, 1120, 1000, 900, 800, 1000, 1200],
        smooth: true,
        lineStyle: {
          color: colors[1],
          width: 3,
        },
        itemStyle: {
          color: colors[1],
        }
      },
      {
        name: 'Growth',
        type: 'line',
        data: [120, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
        smooth: true,
        lineStyle: {
          color: colors[2],
          width: 2,
        },
        itemStyle: {
          color: colors[2],
        }
      }
    ]
  };
};

export const LineChartWidget = ({ widget, width, height }: LineChartWidgetProps) => {
  const { getConfig } = useConfig();
  const config = getConfig(widget.id);
  
  // Get custom colors from config
  const customColors = config?.chart?.seriesColors || config?.chart?.colors;
  
  // Use mock data if no data provided, otherwise merge with widget data
  const mockData = generateMockLineData(customColors);
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
        lineStyle: {
          ...series.lineStyle,
          color: seriesColor,
        },
        itemStyle: {
          ...series.itemStyle,
          color: seriesColor,
        },
        areaStyle: series.areaStyle ? {
          ...series.areaStyle,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: seriesColor + '4D' }, // 30% opacity
              { offset: 1, color: seriesColor + '0D' }  // 5% opacity
            ],
          }
        } : undefined
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
        option={option as EChartsOption}
        style={{ width: '100%', height: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};