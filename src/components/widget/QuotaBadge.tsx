/**
 * Quota badge component showing remaining message counts
 */

import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';

interface QuotaBadgeProps {
  remaining: number;
  total: number;
  type: 'daily' | 'hourly' | 'session';
  showBadge: boolean;
  variant?: 'warning' | 'danger';
}

export function QuotaBadge({ remaining, total, type, showBadge, variant = 'warning' }: QuotaBadgeProps) {
  if (!showBadge || remaining < 0) return null;

  const badgeVariant = variant === 'danger' ? 'destructive' : 'secondary';
  const typeLabel = type === 'session' ? 'chat' : type;

  return (
    <Badge 
      variant={badgeVariant}
      className="flex items-center space-x-1 text-xs font-medium"
    >
      <MessageCircle className="h-3 w-3" />
      <span>{remaining} {typeLabel} messages left</span>
    </Badge>
  );
}