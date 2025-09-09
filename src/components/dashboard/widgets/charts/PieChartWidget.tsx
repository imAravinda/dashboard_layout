import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { DashboardWidget } from "../../DashboardContext";
import { useConfig } from "../../ConfigContext";
import { ECharts } from "@/components/ui/echarts";
import { EChartsOption } from 'echarts';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

interface PieChartWidgetProps {
  widget: DashboardWidget;
  width: number;
  height: number;
}

interface SeriesData {
  name?: string;
  type?: 'pie';
  data?: Array<{ 
    value: number; 
    name: string; 
    itemStyle?: { color?: string };
  }>;
  emphasis?: {
    itemStyle?: {
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowColor?: string;
    };
  };
  label?: {
    color?: string;
    formatter?: string;
  };
  labelLine?: {
    lineStyle?: {
      color?: string;
    };
  };
  [key: string]: unknown;
}

// Mock data generator
const generateMockPieData = (customColors?: string[]) => {
  const defaultColors = [
    'hsl(var(--chart-primary))',
    'hsl(var(--chart-secondary))',
    'hsl(var(--chart-tertiary))',
    'hsl(var(--chart-quaternary))',
    'hsl(var(--chart-success))',
  ];
  const colors = customColors || defaultColors;

  return {
    title: {
      text: 'Market Share',
      left: 'center',
      textStyle: {
        color: 'hsl(var(--foreground))',
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    },
    series: [
      {
        name: 'Market Share',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '60%'],
        data: [
          { 
            value: 35, 
            name: 'Product A',
            itemStyle: { color: colors[0] }
          },
          { 
            value: 25, 
            name: 'Product B',
            itemStyle: { color: colors[1] }
          },
          { 
            value: 20, 
            name: 'Product C',
            itemStyle: { color: colors[2] }
          },
          { 
            value: 15, 
            name: 'Product D',
            itemStyle: { color: colors[3] }
          },
          { 
            value: 5, 
            name: 'Others',
            itemStyle: { color: colors[4] }
          }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          color: 'hsl(var(--foreground))',
          formatter: '{b}: {d}%'
        },
        labelLine: {
          lineStyle: {
            color: 'hsl(var(--border))'
          }
        }
      }
    ]
  };
};

export const PieChartWidget = ({ widget, width, height }: PieChartWidgetProps) => {
  const { getConfig } = useConfig();
  const config = getConfig(widget.id);
  
  // Get custom colors from config
  const customColors = config?.chart?.seriesColors || config?.chart?.colors;
  
  // Use mock data if no data provided, otherwise merge with widget data
  const mockData = generateMockPieData(customColors);
  const chartData = widget.data ? {
    ...mockData,
    ...widget.data,
    series: widget.data.series || mockData.series
  } : mockData;

  // Apply individual slice colors if provided
  const processedSeries = (chartData.series as SeriesData[]).map((series: SeriesData) => {
    if (series.data && customColors) {
      return {
        ...series,
        data: series.data.map((item, index) => ({
          ...item,
          itemStyle: {
            ...item.itemStyle,
            color: customColors[index] || item.itemStyle?.color || series.data?.[index]?.itemStyle?.color
          }
        }))
      };
    }
    return series;
  });

  const option = {
    ...chartData,
    series: processedSeries,
    title: config?.chart?.showTitle !== false ? chartData.title : undefined,
    tooltip: {
      trigger: 'item' as const,
      show: config?.chart?.showTooltip !== false,
      backgroundColor: 'hsl(var(--popover))',
      borderColor: 'hsl(var(--border))',
      textStyle: {
        color: 'hsl(var(--popover-foreground))',
      },
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical' as const,
      left: 'left',
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
      'hsl(var(--chart-quaternary))',
      'hsl(var(--chart-success))',
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