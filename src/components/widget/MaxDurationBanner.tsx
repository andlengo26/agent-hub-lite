/**
 * Banner component shown when AI session approaches maximum duration
 */

import { useState, useEffect } from 'react';
import { Clock, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MaxDurationBannerProps {
  remainingMinutes: number;
  onTalkToHuman: () => void;
  onExtendSession: () => void;
  onDismiss: () => void;
  showTalkToHumanButton?: boolean;
}

export function MaxDurationBanner({ 
  remainingMinutes, 
  onTalkToHuman, 
  onExtendSession, 
  onDismiss,
  showTalkToHumanButton = true
}: MaxDurationBannerProps) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor(remainingMinutes * 60)));

  useEffect(() => {
    setTimeLeft(Math.max(0, Math.floor(remainingMinutes * 60)));
  }, [remainingMinutes]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Alert className="border-warning bg-warning/10 relative">
      <Clock className="h-4 w-4" />
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={onDismiss}
      >
        <X className="h-3 w-3" />
      </Button>
      <AlertDescription className="pr-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <strong>AI session will end in {formatTime(timeLeft)}</strong>
          </div>
          <p className="text-sm text-muted-foreground">
            Your AI session has reached its maximum duration. You can continue with a human agent or extend your current session.
          </p>
          <div className="flex gap-2 flex-wrap">
            {showTalkToHumanButton && (
              <Button 
                size="sm" 
                variant="default"
                onClick={onTalkToHuman}
                className="flex items-center gap-1"
              >
                <User className="h-3 w-3" />
                Talk to Human Agent
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onExtendSession}
              className="text-xs"
            >
              Continue AI Session
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}