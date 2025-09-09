import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, Trash2, Code, Palette, Settings } from 'lucide-react';

interface CustomComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (component: CustomComponent) => void;
}

interface CustomComponent {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'html' | 'react' | 'chart';
  width: number;
  height: number;
  content: string;
  styles: string;
  props: Array<{
    name: string;
    type: string;
    defaultValue: string;
    description: string;
  }>;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

const defaultComponent: CustomComponent = {
  id: '',
  name: '',
  description: '',
  category: 'Custom',
  type: 'html',
  width: 300,
  height: 200,
  content: '<div class="custom-component">\n  <h3>Custom Component</h3>\n  <p>Your custom content here</p>\n</div>',
  styles: '.custom-component {\n  padding: 16px;\n  border-radius: 8px;\n  background: var(--background);\n  color: var(--foreground);\n}',
  props: [],
  colors: {
    primary: 'hsl(var(--chart-primary))',
    secondary: 'hsl(var(--chart-secondary))',
    background: 'hsl(var(--background))',
    text: 'hsl(var(--foreground))'
  }
};

export const CustomComponentModal: React.FC<CustomComponentModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [component, setComponent] = useState<CustomComponent>(defaultComponent);
  const [activeTab, setActiveTab] = useState('basic');

  const handleSave = () => {
    if (!component.name || !component.id) {
      alert('Please provide a name and ID for the component');
      return;
    }
    onSave(component);
    onClose();
    setComponent(defaultComponent);
  };

  const addProp = () => {
    setComponent(prev => ({
      ...prev,
      props: [...prev.props, { name: '', type: 'string', defaultValue: '', description: '' }]
    }));
  };

  const removeProp = (index: number) => {
    setComponent(prev => ({
      ...prev,
      props: prev.props.filter((_, i) => i !== index)
    }));
  };

  const updateProp = (index: number, field: keyof CustomComponent['props'][0], value: string) => {
    setComponent(prev => ({
      ...prev,
      props: prev.props.map((prop, i) => 
        i === index ? { ...prop, [field]: value } : prop
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-md">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Create Custom Component</CardTitle>
              <CardDescription>
                Build your own dashboard component with HTML, CSS, and JavaScript
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto max-h-[60vh]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="styling">Styling</TabsTrigger>
              <TabsTrigger value="props">Properties</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Component Name</Label>
                  <Input
                    id="name"
                    value={component.name}
                    onChange={(e) => setComponent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Component"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id">Component ID</Label>
                  <Input
                    id="id"
                    value={component.id}
                    onChange={(e) => setComponent(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="my-custom-component"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={component.description}
                  onChange={(e) => setComponent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this component does..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={component.category}
                    onChange={(e) => setComponent(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Custom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={component.width}
                    onChange={(e) => setComponent(prev => ({ ...prev, width: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={component.height}
                    onChange={(e) => setComponent(prev => ({ ...prev, height: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Component Type</Label>
                <Select value={component.type} onValueChange={(value: 'html' | 'react' | 'chart') => 
                  setComponent(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML/CSS/JS</SelectItem>
                    <SelectItem value="react">React Component</SelectItem>
                    <SelectItem value="chart">Chart Component</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content" className="flex items-center space-x-2">
                  <Code className="h-4 w-4" />
                  <span>Component Content</span>
                </Label>
                <Textarea
                  id="content"
                  value={component.content}
                  onChange={(e) => setComponent(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your HTML, React JSX, or chart configuration..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="styling" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="styles" className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Custom CSS</span>
                </Label>
                <Textarea
                  id="styles"
                  value={component.styles}
                  onChange={(e) => setComponent(prev => ({ ...prev, styles: e.target.value }))}
                  placeholder="Enter your custom CSS styles..."
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <Input
                    id="primary-color"
                    value={component.colors.primary}
                    onChange={(e) => setComponent(prev => ({ 
                      ...prev, 
                      colors: { ...prev.colors, primary: e.target.value }
                    }))}
                    placeholder="hsl(var(--chart-primary))"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <Input
                    id="secondary-color"
                    value={component.colors.secondary}
                    onChange={(e) => setComponent(prev => ({ 
                      ...prev, 
                      colors: { ...prev.colors, secondary: e.target.value }
                    }))}
                    placeholder="hsl(var(--chart-secondary))"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="props" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Component Properties</Label>
                <Button onClick={addProp} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </div>
              
              <div className="space-y-3">
                {component.props.map((prop, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <Input
                        placeholder="Property name"
                        value={prop.name}
                        onChange={(e) => updateProp(index, 'name', e.target.value)}
                      />
                      <Select value={prop.type} onValueChange={(value) => updateProp(index, 'type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Default value"
                        value={prop.defaultValue}
                        onChange={(e) => updateProp(index, 'defaultValue', e.target.value)}
                      />
                      <Input
                        placeholder="Description"
                        value={prop.description}
                        onChange={(e) => updateProp(index, 'description', e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProp(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <div className="flex items-center justify-end space-x-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Create Component
          </Button>
        </div>
      </Card>
    </div>
  );
};


