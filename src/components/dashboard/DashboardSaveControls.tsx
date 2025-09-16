import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Download, Trash2, AlertCircle } from 'lucide-react';
import { useDashboard } from './DashboardContext';

export const DashboardSaveControls = memo(() => {
  const { 
    saveDashboard, 
    loadDashboard, 
    clearDashboard, 
    hasUnsavedChanges,
    widgets 
  } = useDashboard();

  const handleSave = () => {
    saveDashboard();
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
    const confirmed = window.confirm(
      'Are you sure you want to clear the dashboard? This action cannot be undone.'
    );
    if (confirmed) {
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
    <div className="flex items-center space-x-2">
      {hasUnsavedChanges && (
        <div className="flex items-center text-amber-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          Unsaved changes
        </div>
      )}
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleSave}
        className="flex items-center space-x-1"
      >
        <Save className="h-4 w-4" />
        <span>Save</span>
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleLoad}
        className="flex items-center space-x-1"
      >
        <Download className="h-4 w-4" />
        <span>Load</span>
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleExport}
        className="flex items-center space-x-1"
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
      </Button>
      
      <Button
        size="sm"
        variant="destructive"
        onClick={handleClear}
        className="flex items-center space-x-1"
      >
        <Trash2 className="h-4 w-4" />
        <span>Clear</span>
      </Button>
    </div>
  );
});
