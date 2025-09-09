import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ComponentConfig {
  id: string;
  type: string;
  title: string;
  data: Record<string, unknown>;
  style: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderRadius?: number;
    padding?: number;
    margin?: number;
    customCSS?: string;
  };
  chart?: {
    colors?: string[];
    seriesColors?: string[];
    showLegend?: boolean;
    showTooltip?: boolean;
    animation?: boolean;
    showTitle?: boolean;
    showGrid?: boolean;
    smooth?: boolean;
  };
  gauge?: {
    min?: number;
    max?: number;
    showPointer?: boolean;
    showProgress?: boolean;
    unit?: string;
    showValue?: boolean;
  };
  table?: {
    showHeader?: boolean;
    showPagination?: boolean;
    pageSize?: number;
    striped?: boolean;
    hoverable?: boolean;
  };
  card?: {
    showIcon?: boolean;
    showTrend?: boolean;
    trendDirection?: 'up' | 'down' | 'neutral';
    showValue?: boolean;
    showLabel?: boolean;
  };
  monitor?: {
    updateInterval?: number;
    showLabels?: boolean;
    showValues?: boolean;
    animated?: boolean;
  };
}

interface ConfigContextType {
  configs: Record<string, ComponentConfig>;
  updateConfig: (id: string, config: Partial<ComponentConfig>) => void;
  getConfig: (id: string) => ComponentConfig | undefined;
  resetConfig: (id: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [configs, setConfigs] = useState<Record<string, ComponentConfig>>({});

  const updateConfig = (id: string, config: Partial<ComponentConfig>) => {
    setConfigs(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...config,
        id,
      }
    }));
  };

  const getConfig = (id: string) => {
    return configs[id];
  };

  const resetConfig = (id: string) => {
    setConfigs(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
  };

  return (
    <ConfigContext.Provider value={{ configs, updateConfig, getConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};