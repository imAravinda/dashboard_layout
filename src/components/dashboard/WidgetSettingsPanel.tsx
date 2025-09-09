import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { X, Palette, Settings, BarChart3, PieChart, Target, Table, Activity } from 'lucide-react';
import { useConfig, ComponentConfig } from './ConfigContext';

interface WidgetSettingsPanelProps {
  widgetId: string;
  widgetType: string;
  isOpen: boolean;
  onClose: () => void;
}

const colorPresets = [
  { name: 'Primary', value: 'hsl(var(--chart-primary))' },
  { name: 'Secondary', value: 'hsl(var(--chart-secondary))' },
  { name: 'Tertiary', value: 'hsl(var(--chart-tertiary))' },
  { name: 'Quaternary', value: 'hsl(var(--chart-quaternary))' },
  { name: 'Success', value: 'hsl(var(--chart-success))' },
  { name: 'Error', value: 'hsl(var(--chart-error))' },
  { name: 'Warning', value: 'hsl(var(--chart-warning))' },
  { name: 'Info', value: 'hsl(var(--chart-info))' },
];

const ColorPicker = ({ 
  value, 
  onChange, 
  label 
}: { 
  value: string; 
  onChange: (color: string) => void; 
  label: string; 
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{label}</Label>
    <div className="flex items-center space-x-2">
      <input
        type="color"
        value={value.replace('hsl(var(--chart-', '').replace('))', '')}
        onChange={(e) => onChange(`hsl(var(--chart-${e.target.value}))`)}
        className="w-8 h-8 rounded border border-input cursor-pointer"
      />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {colorPresets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded border" 
                  style={{ backgroundColor: preset.value }}
                />
                <span>{preset.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

export const WidgetSettingsPanel: React.FC<WidgetSettingsPanelProps> = ({
  widgetId,
  widgetType,
  isOpen,
  onClose
}) => {
  const { getConfig, updateConfig } = useConfig();
  const config = getConfig(widgetId) || {
    id: widgetId,
    type: widgetType,
    title: '',
    data: {},
    style: {},
    chart: {},
    gauge: {},
    table: {},
    card: {}
  };

  const [localConfig, setLocalConfig] = useState<ComponentConfig>(config);

  const handleSave = () => {
    updateConfig(widgetId, localConfig);
    onClose();
  };

  const handleReset = () => {
    setLocalConfig(config);
  };

  const updateLocalConfig = (updates: Partial<ComponentConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
  };

  const updateStyle = (styleUpdates: Partial<ComponentConfig['style']>) => {
    updateLocalConfig({
      style: { ...localConfig.style, ...styleUpdates }
    });
  };

  const updateChart = (chartUpdates: Partial<ComponentConfig['chart']>) => {
    updateLocalConfig({
      chart: { ...localConfig.chart, ...chartUpdates }
    });
  };

  const updateGauge = (gaugeUpdates: Partial<ComponentConfig['gauge']>) => {
    updateLocalConfig({
      gauge: { ...localConfig.gauge, ...gaugeUpdates }
    });
  };

  const updateTable = (tableUpdates: Partial<ComponentConfig['table']>) => {
    updateLocalConfig({
      table: { ...localConfig.table, ...tableUpdates }
    });
  };

  const updateCard = (cardUpdates: Partial<ComponentConfig['card']>) => {
    updateLocalConfig({
      card: { ...localConfig.card, ...cardUpdates }
    });
  };

  if (!isOpen) return null;

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'bar-chart': return BarChart3;
      case 'line-chart': return BarChart3;
      case 'pie-chart': return PieChart;
      case 'gauge': return Target;
      case 'data-table': return Table;
      case 'activity-monitor': return Activity;
      default: return Settings;
    }
  };

  const WidgetIcon = getWidgetIcon(widgetType);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-md">
              <WidgetIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Widget Settings</CardTitle>
              <CardDescription>
                Configure appearance and behavior for {widgetType.replace('-', ' ')}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto max-h-[60vh]">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Widget Title</Label>
                  <Input
                    id="title"
                    value={localConfig.title}
                    onChange={(e) => updateLocalConfig({ title: e.target.value })}
                    placeholder="Enter widget title"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Layout</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="padding">Padding</Label>
                      <Slider
                        id="padding"
                        value={[localConfig.style?.padding || 16]}
                        onValueChange={([value]) => updateStyle({ padding: value })}
                        max={32}
                        min={0}
                        step={4}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        {localConfig.style?.padding || 16}px
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="borderRadius">Border Radius</Label>
                      <Slider
                        id="borderRadius"
                        value={[localConfig.style?.borderRadius || 8]}
                        onValueChange={([value]) => updateStyle({ borderRadius: value })}
                        max={24}
                        min={0}
                        step={2}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        {localConfig.style?.borderRadius || 8}px
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  Colors
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker
                    label="Background Color"
                    value={localConfig.style?.backgroundColor || 'hsl(var(--background))'}
                    onChange={(color) => updateStyle({ backgroundColor: color })}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={localConfig.style?.textColor || 'hsl(var(--foreground))'}
                    onChange={(color) => updateStyle({ textColor: color })}
                  />
                  <ColorPicker
                    label="Border Color"
                    value={localConfig.style?.borderColor || 'hsl(var(--border))'}
                    onChange={(color) => updateStyle({ borderColor: color })}
                  />
                </div>

                <Separator />

                {(widgetType.includes('chart') || widgetType === 'gauge') && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Chart Colors</h4>
                    
                    {/* Individual Series Colors */}
                    {widgetType.includes('chart') && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Series Colors</Label>
                        <div className="space-y-2">
                          {['Sales', 'Target', 'Profit', 'Growth'].map((seriesName, index) => (
                            <div key={seriesName} className="flex items-center space-x-3">
                              <div className="w-20 text-sm text-muted-foreground">
                                {seriesName}
                              </div>
                              <ColorPicker
                                label=""
                                value={localConfig.chart?.seriesColors?.[index] || localConfig.chart?.colors?.[index] || `hsl(var(--chart-${['primary', 'secondary', 'tertiary', 'quaternary'][index]}))`}
                                onChange={(color) => {
                                  const currentSeriesColors = localConfig.chart?.seriesColors || localConfig.chart?.colors || [];
                                  const newSeriesColors = [...currentSeriesColors];
                                  newSeriesColors[index] = color;
                                  updateChart({ seriesColors: newSeriesColors });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* General Chart Colors */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">General Colors</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <ColorPicker
                          label="Primary Color"
                          value={localConfig.chart?.colors?.[0] || 'hsl(var(--chart-primary))'}
                          onChange={(color) => updateChart({ 
                            colors: [color, ...(localConfig.chart?.colors?.slice(1) || [])]
                          })}
                        />
                        <ColorPicker
                          label="Secondary Color"
                          value={localConfig.chart?.colors?.[1] || 'hsl(var(--chart-secondary))'}
                          onChange={(color) => updateChart({ 
                            colors: [
                              localConfig.chart?.colors?.[0] || 'hsl(var(--chart-primary))',
                              color,
                              ...(localConfig.chart?.colors?.slice(2) || [])
                            ]
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Data Configuration</h4>
                
                {widgetType.includes('chart') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showLegend">Show Legend</Label>
                      <Switch
                        id="showLegend"
                        checked={localConfig.chart?.showLegend ?? true}
                        onCheckedChange={(checked) => updateChart({ showLegend: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showTooltip">Show Tooltip</Label>
                      <Switch
                        id="showTooltip"
                        checked={localConfig.chart?.showTooltip ?? true}
                        onCheckedChange={(checked) => updateChart({ showTooltip: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animation">Enable Animation</Label>
                      <Switch
                        id="animation"
                        checked={localConfig.chart?.animation ?? true}
                        onCheckedChange={(checked) => updateChart({ animation: checked })}
                      />
                    </div>
                  </div>
                )}

                {widgetType === 'gauge' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minValue">Min Value</Label>
                        <Input
                          id="minValue"
                          type="number"
                          value={localConfig.gauge?.min || 0}
                          onChange={(e) => updateGauge({ min: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxValue">Max Value</Label>
                        <Input
                          id="maxValue"
                          type="number"
                          value={localConfig.gauge?.max || 100}
                          onChange={(e) => updateGauge({ max: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showPointer">Show Pointer</Label>
                      <Switch
                        id="showPointer"
                        checked={localConfig.gauge?.showPointer ?? false}
                        onCheckedChange={(checked) => updateGauge({ showPointer: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showProgress">Show Progress</Label>
                      <Switch
                        id="showProgress"
                        checked={localConfig.gauge?.showProgress ?? true}
                        onCheckedChange={(checked) => updateGauge({ showProgress: checked })}
                      />
                    </div>
                  </div>
                )}

                {widgetType === 'data-table' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showHeader">Show Header</Label>
                      <Switch
                        id="showHeader"
                        checked={localConfig.table?.showHeader ?? true}
                        onCheckedChange={(checked) => updateTable({ showHeader: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showPagination">Show Pagination</Label>
                      <Switch
                        id="showPagination"
                        checked={localConfig.table?.showPagination ?? false}
                        onCheckedChange={(checked) => updateTable({ showPagination: checked })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pageSize">Page Size</Label>
                      <Input
                        id="pageSize"
                        type="number"
                        value={localConfig.table?.pageSize || 10}
                        onChange={(e) => updateTable({ pageSize: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                )}

                {widgetType === 'stat-card' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showIcon">Show Icon</Label>
                      <Switch
                        id="showIcon"
                        checked={localConfig.card?.showIcon ?? true}
                        onCheckedChange={(checked) => updateCard({ showIcon: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showTrend">Show Trend</Label>
                      <Switch
                        id="showTrend"
                        checked={localConfig.card?.showTrend ?? true}
                        onCheckedChange={(checked) => updateCard({ showTrend: checked })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trendDirection">Trend Direction</Label>
                      <Select
                        value={localConfig.card?.trendDirection || 'up'}
                        onValueChange={(value: 'up' | 'down' | 'neutral') => 
                          updateCard({ trendDirection: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="up">Up</SelectItem>
                          <SelectItem value="down">Down</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Advanced Settings</h4>
                <div className="space-y-2">
                  <Label htmlFor="customCSS">Custom CSS</Label>
                  <textarea
                    id="customCSS"
                    className="w-full h-32 p-2 border border-input rounded-md text-sm font-mono"
                    placeholder="Enter custom CSS styles..."
                    value={localConfig.style?.customCSS || ''}
                    onChange={(e) => updateStyle({ customCSS: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <div className="flex items-center justify-end space-x-2 p-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
};
