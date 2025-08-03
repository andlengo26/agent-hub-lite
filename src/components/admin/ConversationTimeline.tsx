/**
 * Conversation Timeline Component
 * Displays a chronological timeline of conversation state transitions
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Clock, 
  MessageSquare, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Timer,
  Users
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export interface TimelineTransition {
  id: string;
  from: string;
  to: string;
  reason: string;
  triggeredBy: 'user' | 'system' | 'ai';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ConversationTimelineProps {
  transitions: TimelineTransition[];
  className?: string;
}

const getTransitionIcon = (transition: TimelineTransition) => {
  switch (transition.to) {
    case 'active':
      return <MessageSquare className="h-4 w-4" />;
    case 'ended':
      return <CheckCircle className="h-4 w-4" />;
    case 'waiting_human':
      return <Users className="h-4 w-4" />;
    case 'idle_timeout':
      return <Clock className="h-4 w-4" />;
    case 'max_session':
      return <Timer className="h-4 w-4" />;
    case 'quota_exceeded':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <XCircle className="h-4 w-4" />;
  }
};

const getTransitionColor = (transition: TimelineTransition) => {
  switch (transition.to) {
    case 'active':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'ended':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'waiting_human':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'idle_timeout':
    case 'max_session':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'quota_exceeded':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getTriggeredByIcon = (triggeredBy: string) => {
  switch (triggeredBy) {
    case 'user':
      return <UserCheck className="h-3 w-3" />;
    case 'ai':
      return <MessageSquare className="h-3 w-3" />;
    case 'system':
      return <Clock className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

export function ConversationTimeline({ transitions, className }: ConversationTimelineProps) {
  if (transitions.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="text-base">Conversation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">No timeline data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Conversation Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          
          {transitions.map((transition, index) => (
            <div key={transition.id} className="relative flex items-start gap-4">
              {/* Timeline node */}
              <div className={cn(
                "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background",
                getTransitionColor(transition)
              )}>
                {getTransitionIcon(transition)}
              </div>
              
              {/* Timeline content */}
              <div className="flex-1 min-w-0 pb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs", getTransitionColor(transition))}>
                      {transition.to.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      {getTriggeredByIcon(transition.triggeredBy)}
                      <span>{transition.triggeredBy}</span>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {format(new Date(transition.timestamp), 'HH:mm:ss')}
                  </div>
                </div>
                
                <p className="text-sm text-text-primary mb-2">
                  {transition.reason}
                </p>
                
                <p className="text-xs text-text-secondary">
                  {formatDistanceToNow(new Date(transition.timestamp), { addSuffix: true })}
                </p>
                
                {/* Metadata display */}
                {transition.metadata && Object.keys(transition.metadata).length > 0 && (
                  <div className="mt-3 p-2 bg-surface rounded-md border border-border">
                    <p className="text-xs font-medium text-text-secondary mb-1">Additional Details:</p>
                    <div className="space-y-1">
                      {Object.entries(transition.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-text-secondary capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                          </span>
                          <span className="text-text-primary font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}