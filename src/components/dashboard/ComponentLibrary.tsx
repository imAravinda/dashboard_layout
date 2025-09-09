import { useState, useMemo, useCallback, memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Table, 
  Calculator,
  Activity,
  Target,
  Search,
  Plus
} from "lucide-react";
import { CustomComponentModal } from "./CustomComponentModal";

interface ComponentType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category: string;
  defaultSize: { width: number; height: number };
}

const componentTypes: ComponentType[] = [
  {
    id: "line-chart",
    name: "Line Chart",
    description: "Time series data visualization",
    icon: LineChart,
    category: "Charts",
    defaultSize: { width: 400, height: 300 }
  },
  {
    id: "bar-chart",
    name: "Bar Chart",
    description: "Categorical data comparison",
    icon: BarChart3,
    category: "Charts",
    defaultSize: { width: 400, height: 300 }
  },
  {
    id: "pie-chart",
    name: "Pie Chart",
    description: "Part-to-whole relationships",
    icon: PieChart,
    category: "Charts",
    defaultSize: { width: 300, height: 300 }
  },
  {
    id: "stat-card",
    name: "Stat Card",
    description: "Key performance indicators",
    icon: TrendingUp,
    category: "Stats",
    defaultSize: { width: 200, height: 120 }
  },
  {
    id: "data-table",
    name: "Data Table",
    description: "Tabular data display",
    icon: Table,
    category: "Data",
    defaultSize: { width: 500, height: 300 }
  },
  {
    id: "calculator",
    name: "Calculator",
    description: "Scientific calculations",
    icon: Calculator,
    category: "Tools",
    defaultSize: { width: 250, height: 300 }
  },
  {
    id: "activity-monitor",
    name: "Activity Monitor",
    description: "Real-time system metrics",
    icon: Activity,
    category: "Monitoring",
    defaultSize: { width: 300, height: 200 }
  },
  {
    id: "gauge",
    name: "Gauge",
    description: "Single value visualization",
    icon: Target,
    category: "Stats",
    defaultSize: { width: 200, height: 200 }
  }
];

export const ComponentLibrary = memo(() => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customComponents, setCustomComponents] = useState<ComponentType[]>([]);

  const allComponents = useMemo(() => [...componentTypes, ...customComponents], [customComponents]);
  const categories = useMemo(() => [...new Set(allComponents.map(comp => comp.category))], [allComponents]);
  
  const filteredComponents = useMemo(() => allComponents.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || comp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [allComponents, searchTerm, selectedCategory]);

  const handleCreateCustomComponent = useCallback((customComponent: {
    id: string;
    name: string;
    description: string;
    category: string;
    width: number;
    height: number;
  }) => {
    const newComponent: ComponentType = {
      id: customComponent.id,
      name: customComponent.name,
      description: customComponent.description,
      icon: Plus, // Use Plus icon for custom components
      category: customComponent.category,
      defaultSize: { 
        width: customComponent.width, 
        height: customComponent.height 
      }
    };
    setCustomComponents(prev => [...prev, newComponent]);
  }, []);

  const DraggableComponent = memo(({ component }: { component: ComponentType }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({
      id: `component-${component.id}`,
      data: {
        type: 'component',
        component,
      },
    });

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const IconComponent = component.icon;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`p-3 bg-card border border-dashboard-border rounded-lg cursor-grab active:cursor-grabbing hover:border-primary/50 hover:shadow-sm transition-all ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <IconComponent className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-foreground">{component.name}</h3>
              <Badge variant="outline" className="text-xs ml-2">
                {component.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{component.description}</p>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <span>{component.defaultSize.width}×{component.defaultSize.height}</span>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dashboard-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Component Library</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="text-xs"
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredComponents.map(component => (
          <DraggableComponent key={component.id} component={component} />
        ))}
      </div>

      {/* Quick Add Section */}
      <div className="p-4 border-t border-dashboard-border">
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => setIsCustomModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Component
        </Button>
      </div>

      {/* Custom Component Modal */}
      <CustomComponentModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleCreateCustomComponent}
      />
    </div>
  );
});