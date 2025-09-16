import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Download, Upload, Settings, Grid, BarChart3, Trash2, AlertCircle } from "lucide-react";
import { useDashboard } from "./DashboardContext";
import { useState, memo } from "react";

export const DashboardHeader = memo(() => {
  const { 
    widgets, 
    saveDashboard, 
    loadDashboard, 
    clearDashboard, 
    hasUnsavedChanges 
  } = useDashboard();
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

  const handleLoad = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Loading will overwrite your current dashboard. Continue?'
      );
      if (!confirmed) return;
    }
    loadDashboard();
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all widgets? This action cannot be undone.')) {
      clearDashboard();
    }
  };

  const handleExport = () => {
    try {
      const dashboardData = {
        widgets,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const dataStr = JSON.stringify(dashboardData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export dashboard:', error);
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
        {hasUnsavedChanges && (
          <div className="flex items-center text-amber-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            Unsaved changes
          </div>
        )}
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
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLoad}
        >
          <Download className="h-4 w-4 mr-2" />
          Load
        </Button>
        
        {widgets.length > 0 && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
            >
              <Upload className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClear}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </>
        )}
      </div>
    </header>
  );
});