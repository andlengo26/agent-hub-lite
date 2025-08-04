/**
 * Widget Header Component
 * Displays the widget title, controls, and status indicators
 */

import React from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WidgetHeaderProps {
  title: string;
  subtitle?: string;
  isExpanded: boolean;
  isMaximized: boolean;
  appearance: {
    primaryColor: string;
    textColor: string;
  };
  companyLogo?: string;
  onToggleExpanded: () => void;
  onToggleMaximized: () => void;
  onClose?: () => void;
}

export function WidgetHeader({
  title,
  subtitle,
  isExpanded,
  isMaximized,
  appearance,
  companyLogo,
  onToggleExpanded,
  onToggleMaximized,
  onClose
}: WidgetHeaderProps) {
  return (
    <div 
      className="p-4 border-b border-border flex items-center justify-between"
      style={{ backgroundColor: appearance.primaryColor, color: appearance.textColor }}
    >
      <div className="flex items-center gap-3 flex-1">
        {companyLogo && (
          <img 
            src={companyLogo} 
            alt="Company Logo" 
            className="h-8 w-8 rounded object-contain bg-white/10 p-1"
          />
        )}
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          {subtitle && (
            <p className="text-xs opacity-90 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-white/20"
          onClick={onToggleExpanded}
          style={{ color: appearance.textColor }}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        {isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/20"
            onClick={onToggleMaximized}
            style={{ color: appearance.textColor }}
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/20"
            onClick={onClose}
            style={{ color: appearance.textColor }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}