/**
 * Component for displaying chat sessions in the widget Messages tab
 */

import React, { useState, useEffect } from 'react';
import { useChatSessions } from '../../../hooks/useChatSessions';
import { TerminatedSessionBanner } from '../TerminatedSessionBanner';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { EmptyState } from '../../common/EmptyState';
import { Clock, MessageCircle, User, Calendar } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface SessionsListProps {
  onSessionSelect?: (sessionId: string) => void;
  onStartNewChat?: () => void;
  currentConversationId?: string;
}

export function SessionsList({ onSessionSelect, onStartNewChat, currentConversationId }: SessionsListProps) {
  const { sessions, loading, error, refreshSessions } = useChatSessions({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Auto-refresh on mount
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    onSessionSelect?.(sessionId);
  };

  const formatSessionTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'user_ended':
        return 'secondary';
      case 'idle_timeout':
        return 'outline';
      case 'ai_timeout':
        return 'destructive';
      case 'escalated':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <MessageCircle className="h-3 w-3" />;
      case 'user_ended':
        return <User className="h-3 w-3" />;
      case 'idle_timeout':
        return <Clock className="h-3 w-3" />;
      case 'ai_timeout':
        return <Clock className="h-3 w-3" />;
      case 'escalated':
        return <User className="h-3 w-3" />;
      default:
        return <MessageCircle className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <EmptyState 
          title="Error Loading Sessions" 
          description={error}
        />
        <div className="mt-4">
          <Button onClick={refreshSessions} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-4">
        <EmptyState 
          title="No Chat Sessions" 
          description="Start your first conversation to see it here"
        />
        {onStartNewChat && (
          <div className="mt-4">
            <Button onClick={onStartNewChat} size="sm">
              Start New Chat
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Find current active session
  const activeSession = sessions.find(s => s.conversationId === currentConversationId && s.status === 'active');

  return (
    <div className="space-y-1">
      {/* Current Active Session Banner */}
      {activeSession && (
        <div className="border-b border-border">
          <div className="p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="default" className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                Current Chat
              </Badge>
              <span className="text-xs text-muted-foreground">
                {activeSession.messageCount} messages
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Started {formatSessionTime(activeSession.startTime)}
            </p>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="divide-y divide-border">
        {sessions.map((session) => {
          // Skip current active session as it's shown in the banner
          if (session.conversationId === currentConversationId && session.status === 'active') {
            return null;
          }

          const isTerminated = session.status !== 'active';
          const isSelected = selectedSessionId === session.id;

          return (
            <div key={session.id} className={`${isSelected ? 'bg-muted/50' : ''}`}>
              {/* Session Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => handleSessionClick(session.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(session.status)} className="flex items-center gap-1">
                      {getStatusIcon(session.status)}
                      {session.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    {session.username && (
                      <span className="text-sm font-medium">{session.username}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {session.messageCount} msgs
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatSessionTime(session.startTime)}
                  </span>
                  {session.endTime && (
                    <span>Ended {formatSessionTime(session.endTime)}</span>
                  )}
                </div>
              </div>

              {/* Terminated Session Details */}
              {isTerminated && isSelected && (
                <TerminatedSessionBanner 
                  session={session}
                  onStartNewChat={onStartNewChat}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Start New Chat Button */}
      {onStartNewChat && (
        <div className="p-4 border-t border-border">
          <Button 
            onClick={onStartNewChat} 
            className="w-full"
            variant="outline"
          >
            Start New Chat
          </Button>
        </div>
      )}
    </div>
  );
}