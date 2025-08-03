/**
 * Quota warning banner component for displaying message limits
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MessageCircle, User, Clock } from 'lucide-react';
import { QuotaState } from '@/hooks/useMessageQuota';

interface QuotaWarningBannerProps {
  quotaState: QuotaState;
  onTalkToHuman: () => void;
  onDismiss: () => void;
  showTalkToHumanButton: boolean;
  quotaWarningThreshold: number;
}

export function QuotaWarningBanner({ 
  quotaState, 
  onTalkToHuman, 
  onDismiss, 
  showTalkToHumanButton,
  quotaWarningThreshold 
}: QuotaWarningBannerProps) {
  // Only show if quota is exceeded or approaching warning threshold
  const shouldShow = quotaState.isQuotaExceeded || 
    quotaState.remainingDaily <= quotaWarningThreshold ||
    quotaState.remainingHourly <= quotaWarningThreshold ||
    quotaState.remainingSession <= quotaWarningThreshold;

  if (!shouldShow) return null;

  const getWarningMessage = () => {
    if (quotaState.isQuotaExceeded) {
      return "You've reached your message limit. Please wait or talk to a human agent.";
    }

    const warnings = [];
    if (quotaState.remainingDaily <= quotaWarningThreshold && quotaState.remainingDaily > 0) {
      warnings.push(`${quotaState.remainingDaily} daily messages left`);
    }
    if (quotaState.remainingHourly <= quotaWarningThreshold && quotaState.remainingHourly > 0) {
      warnings.push(`${quotaState.remainingHourly} hourly messages left`);
    }
    if (quotaState.remainingSession <= quotaWarningThreshold && quotaState.remainingSession > 0) {
      warnings.push(`${quotaState.remainingSession} session messages left`);
    }

    return warnings.length > 0 
      ? `Running low on messages: ${warnings.join(', ')}`
      : "You're approaching your message limit.";
  };

  const getResetInfo = () => {
    const now = new Date();
    const resetTimes = [];
    
    if (quotaState.remainingDaily <= quotaWarningThreshold) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      resetTimes.push(`Daily quota resets at midnight`);
    }
    
    if (quotaState.remainingHourly <= quotaWarningThreshold) {
      const nextHour = new Date(now);
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      const minutesLeft = Math.ceil((nextHour.getTime() - now.getTime()) / 60000);
      resetTimes.push(`Hourly quota resets in ${minutesLeft} minutes`);
    }

    return resetTimes.length > 0 ? resetTimes.join(' • ') : '';
  };

  return (
    <Alert className={`m-4 ${quotaState.isQuotaExceeded ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <MessageCircle className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <div>
          <div className="font-medium text-sm">
            {getWarningMessage()}
          </div>
          {!quotaState.isQuotaExceeded && getResetInfo() && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getResetInfo()}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showTalkToHumanButton && (
            <Button
              size="sm"
              variant="outline"
              onClick={onTalkToHuman}
              className="text-xs"
            >
              <User className="h-3 w-3 mr-1" />
              Talk to Human Agent
            </Button>
          )}
          
          {!quotaState.isQuotaExceeded && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-xs"
            >
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}