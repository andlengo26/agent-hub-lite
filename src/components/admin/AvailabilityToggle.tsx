import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Clock, 
  CheckCircle, 
  PauseCircle, 
  XCircle, 
  Settings,
  ChevronDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AvailabilityStatus {
  status: 'available' | 'busy' | 'away' | 'offline';
  activeChatCount: number;
  maxConcurrentChats: number;
}

interface AvailabilityToggleProps {
  currentStatus?: AvailabilityStatus;
  onStatusChange?: (status: AvailabilityStatus['status']) => void;
}

export function AvailabilityToggle({ 
  currentStatus = { 
    status: 'available', 
    activeChatCount: 2, 
    maxConcurrentChats: 3 
  },
  onStatusChange 
}: AvailabilityToggleProps) {
  const [status, setStatus] = useState(currentStatus.status);

  const statusConfig = {
    available: {
      label: 'Available',
      icon: CheckCircle,
      color: 'bg-success text-success-foreground',
      badgeVariant: 'default' as const
    },
    busy: {
      label: 'Busy',
      icon: Clock,
      color: 'bg-highlight text-highlight-foreground',
      badgeVariant: 'secondary' as const
    },
    away: {
      label: 'Away',
      icon: PauseCircle,
      color: 'bg-muted text-muted-foreground',
      badgeVariant: 'outline' as const
    },
    offline: {
      label: 'Offline',
      icon: XCircle,
      color: 'bg-destructive text-destructive-foreground',
      badgeVariant: 'destructive' as const
    }
  };

  const currentConfig = statusConfig[status];
  const IconComponent = currentConfig.icon;

  const handleStatusChange = (newStatus: AvailabilityStatus['status']) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
    toast({
      title: 'Availability Updated',
      description: `Your status has been changed to ${statusConfig[newStatus].label}`
    });
  };

  const handleQuickToggle = (checked: boolean) => {
    const newStatus = checked ? 'available' : 'away';
    handleStatusChange(newStatus);
  };

  return (
    <div className="flex items-center gap-space-3">
      {/* Simplified Toggle Switch */}
      <div className="flex items-center gap-space-2">
        <Switch 
          checked={status === 'available' || status === 'busy'} 
          onCheckedChange={handleQuickToggle}
          className="data-[state=checked]:bg-success"
        />
        <span className="text-sm font-medium">
          {status === 'available' || status === 'busy' ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Status Display */}
      <div className="flex items-center gap-space-2">
        <IconComponent className="w-4 h-4" />
        <Badge variant={currentConfig.badgeVariant} className="text-xs">
          {currentConfig.label}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {currentStatus.activeChatCount}/{currentStatus.maxConcurrentChats}
        </span>
      </div>
    </div>
  );
}