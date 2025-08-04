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
      {/* Quick Toggle Switch */}
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

      {/* Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-space-2">
            <IconComponent className="w-4 h-4" />
            <Badge variant={currentConfig.badgeVariant} className="text-xs">
              {currentConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {currentStatus.activeChatCount}/{currentStatus.maxConcurrentChats}
            </span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Set Availability</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <DropdownMenuItem
                key={key}
                onClick={() => handleStatusChange(key as AvailabilityStatus['status'])}
                className="flex items-center gap-space-2"
              >
                <Icon className="w-4 h-4" />
                <span>{config.label}</span>
                {key === status && <CheckCircle className="w-3 h-3 ml-auto text-success" />}
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-space-2">
            <Settings className="w-4 h-4" />
            <span>Availability Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}