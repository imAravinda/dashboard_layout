import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { EChartsOption } from 'echarts';

interface EChartsProps {
  option: EChartsOption;
  echarts: typeof echarts;
  style?: React.CSSProperties;
  opts?: {
    renderer?: 'canvas' | 'svg';
    useDirtyRect?: boolean;
  };
}

export const ECharts: React.FC<EChartsProps> = ({ option, echarts, style, opts }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Initialize chart
      chartInstance.current = echarts.init(chartRef.current, undefined, opts);
      
      // Set option
      chartInstance.current.setOption(option);

      // Handle resize
      const handleResize = () => {
        if (chartInstance.current) {
          chartInstance.current.resize();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }
      };
    }
  }, [echarts, opts]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option, true);
    }
  }, [option]);

  return <div ref={chartRef} style={style} />;
};
