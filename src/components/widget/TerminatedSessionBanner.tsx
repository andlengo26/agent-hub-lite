/**
 * Banner component for displaying terminated session status in chat widget
 */

import React from 'react';
import { ChatSession } from '../../services/chatSessionService';
import { Badge } from '../ui/badge';
import { Clock, XCircle, UserX, AlertTriangle, ArrowRight } from 'lucide-react';

interface TerminatedSessionBannerProps {
  session: ChatSession;
  onStartNewChat?: () => void;
}

export function TerminatedSessionBanner({ session, onStartNewChat }: TerminatedSessionBannerProps) {
  const getStatusConfig = (status: ChatSession['status']) => {
    switch (status) {
      case 'user_ended':
        return {
          icon: <UserX className="h-4 w-4" />,
          label: 'Chat Ended',
          description: 'You ended this conversation',
          variant: 'secondary' as const,
          bgColor: 'bg-muted/50'
        };
      case 'idle_timeout':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Session Timeout',
          description: 'This chat was closed due to inactivity',
          variant: 'outline' as const,
          bgColor: 'bg-muted/30'
        };
      case 'ai_timeout':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          label: 'AI Session Limit',
          description: 'Maximum AI assistance time reached',
          variant: 'destructive' as const,
          bgColor: 'bg-destructive/10'
        };
      case 'escalated':
        return {
          icon: <ArrowRight className="h-4 w-4" />,
          label: 'Escalated',
          description: 'Transferred to human agent',
          variant: 'default' as const,
          bgColor: 'bg-primary/10'
        };
      default:
        return {
          icon: <XCircle className="h-4 w-4" />,
          label: 'Chat Ended',
          description: 'This conversation has ended',
          variant: 'secondary' as const,
          bgColor: 'bg-muted/50'
        };
    }
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatEndTime = (endTime: string) => {
    const date = new Date(endTime);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const statusConfig = getStatusConfig(session.status);

  return (
    <div className={`border-b border-border/50 ${statusConfig.bgColor} animate-in slide-in-from-top-2 duration-300`}>
      <div className="p-4 space-y-3">
        {/* Status Badge and Info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant} className="flex items-center gap-1.5">
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {statusConfig.description}
            </span>
          </div>
        </div>

        {/* Session Details */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {session.endTime && (
              <span>Ended at {formatEndTime(session.endTime)}</span>
            )}
            {session.metadata?.sessionDuration && (
              <span>Duration: {formatDuration(session.metadata.sessionDuration)}</span>
            )}
            <span>{session.messageCount} messages</span>
          </div>
        </div>

        {/* Feedback Display */}
        {session.terminationFeedback && (
          <div className="border-t border-border/30 pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Your feedback:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xs ${
                      star <= parseInt(session.terminationFeedback!.rating)
                        ? 'text-yellow-500'
                        : 'text-muted-foreground/30'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            {session.terminationFeedback.comment && (
              <p className="text-xs text-muted-foreground italic">
                "{session.terminationFeedback.comment}"
              </p>
            )}
          </div>
        )}

        {/* New Chat Button */}
        {onStartNewChat && (
          <div className="border-t border-border/30 pt-3">
            <button
              onClick={onStartNewChat}
              className="w-full py-2 px-3 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-md transition-colors duration-200"
            >
              Start New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}