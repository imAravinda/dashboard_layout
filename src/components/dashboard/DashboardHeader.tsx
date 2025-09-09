import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Download, Upload, Settings, Grid, BarChart3, Trash2 } from "lucide-react";
import { useDashboard } from "./DashboardContext";
import { useState } from "react";

export const DashboardHeader = () => {
  const { widgets, saveDashboard, clearDashboard } = useDashboard();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveDashboard();
      // Show success feedback
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      console.error('Save failed:', error);
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all widgets? This action cannot be undone.')) {
      clearDashboard();
    }
  };

  return (
    <header className="h-16 bg-dashboard-panel border-b border-dashboard-border px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Scientific Dashboard Builder</h1>
        </div>
        <Badge variant="secondary" className="ml-4">
          {widgets.length} Component{widgets.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSave}
          disabled={isSaving || widgets.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        {widgets.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClear}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </header>
  );
};