/**
 * Component to warn users about approaching idle timeout
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IdleTimeoutWarningProps {
  warningTimeSeconds: number;
  onKeepActive: () => void;
  onEndConversation: () => void;
}

export function IdleTimeoutWarning({ 
  warningTimeSeconds, 
  onKeepActive, 
  onEndConversation 
}: IdleTimeoutWarningProps) {
  const [timeLeft, setTimeLeft] = useState(warningTimeSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onEndConversation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onEndConversation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Alert className="border-warning bg-warning/10">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            Your session will end in <strong>{formatTime(timeLeft)}</strong> due to inactivity
          </span>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onKeepActive}
            className="text-xs"
          >
            Keep Active
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={onEndConversation}
            className="text-xs"
          >
            End Now
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}