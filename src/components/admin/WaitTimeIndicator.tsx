import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface WaitTimeIndicatorProps {
  elapsedMinutes: number;
  remainingMinutes: number;
  waitTimeMinutes: number;
}

export function WaitTimeIndicator({ 
  elapsedMinutes, 
  remainingMinutes, 
  waitTimeMinutes 
}: WaitTimeIndicatorProps) {
  const [, setTick] = useState(0);

  // Update every minute to show real-time progress
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getVariant = () => {
    const percentElapsed = (elapsedMinutes / waitTimeMinutes) * 100;
    
    if (percentElapsed < 50) return "secondary";
    if (percentElapsed < 80) return "outline";
    return "destructive";
  };

  const formatTime = (minutes: number) => {
    if (minutes < 1) return "< 1m";
    return `${minutes}m`;
  };

  return (
    <Badge variant={getVariant()} className="gap-1">
      <Clock className="w-3 h-3" />
      {formatTime(elapsedMinutes)} / {formatTime(waitTimeMinutes)}
      {remainingMinutes > 0 && (
        <span className="text-xs opacity-75">
          ({formatTime(remainingMinutes)} left)
        </span>
      )}
    </Badge>
  );
}