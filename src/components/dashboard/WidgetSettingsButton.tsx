import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { WidgetSettingsPanel } from './WidgetSettingsPanel';

interface WidgetSettingsButtonProps {
  widgetId: string;
  widgetType: string;
  className?: string;
}

export const WidgetSettingsButton: React.FC<WidgetSettingsButtonProps> = ({
  widgetId,
  widgetType,
  className = ''
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsSettingsOpen(true)}
        className={`opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
      >
        <Settings className="h-4 w-4" />
      </Button>
      
      <WidgetSettingsPanel
        widgetId={widgetId}
        widgetType={widgetType}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};


