import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Archive, Trash2, X } from 'lucide-react';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  onClick: () => void;
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions?: BulkAction[];
  className?: string;
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  actions = [],
  className = '',
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  const defaultActions: BulkAction[] = [
    {
      id: 'export',
      label: 'Export',
      icon: <Download className="h-4 w-4" />,
      variant: 'outline',
      onClick: () => console.log('Export selected'),
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="h-4 w-4" />,
      variant: 'outline',
      onClick: () => console.log('Archive selected'),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
      onClick: () => console.log('Delete selected'),
    },
  ];

  const allActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div 
      className={`flex items-center justify-between p-4 bg-surface border border-border rounded-lg mb-4 ${className}`}
      role="toolbar"
      aria-label="Bulk actions toolbar"
    >
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="text-sm">
          {selectedCount} selected
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          aria-label="Clear selection"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {allActions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.onClick}
            className="flex items-center gap-2"
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}