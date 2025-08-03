/**
 * Countdown badge component for chat widget header
 * Shows remaining session time when approaching limits
 */

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface CountdownBadgeProps {
  remainingMinutes: number;
  showCountdown: boolean;
  variant?: 'warning' | 'danger';
}

export function CountdownBadge({ remainingMinutes, showCountdown, variant = 'warning' }: CountdownBadgeProps) {
  const [timeLeft, setTimeLeft] = useState(remainingMinutes);

  useEffect(() => {
    setTimeLeft(remainingMinutes);
  }, [remainingMinutes]);

  useEffect(() => {
    if (!showCountdown || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - (1/60))); // Decrement by 1 second (1/60 minute)
    }, 1000);

    return () => clearInterval(interval);
  }, [showCountdown, timeLeft]);

  if (!showCountdown || timeLeft <= 0) return null;

  const formatTime = (minutes: number): string => {
    const totalSeconds = Math.ceil(minutes * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const badgeVariant = variant === 'danger' ? 'destructive' : 'secondary';

  return (
    <Badge 
      variant={badgeVariant}
      className="flex items-center space-x-1 text-xs font-medium"
    >
      <Clock className="h-3 w-3" />
      <span>{formatTime(timeLeft)}</span>
    </Badge>
  );
}