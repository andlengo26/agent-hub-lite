/**
 * Queue Item Actions - Centralized action buttons for queue items
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/types';
import { useAgentConsole } from '@/contexts/AgentConsoleContext';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { isActiveAIChat, shouldAITimeout } from '@/utils/chatFilters';
import { Brain, User, AlertTriangle } from 'lucide-react';

interface QueueItemActionsProps {
  chat: Chat;
  onClick?: (e: React.MouseEvent) => void;
}

export function QueueItemActions({ chat, onClick }: QueueItemActionsProps) {
  const { acceptChat, acceptAIHandoff, escalateChat } = useAgentConsole();
  const { settings: widgetSettings } = useWidgetSettings();

  const isAIChat = isActiveAIChat(chat, widgetSettings);
  const shouldTimeout = shouldAITimeout(chat, widgetSettings);

  const handleAcceptChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    acceptChat(chat);
    onClick?.(e);
  };

  const handleTakeoverChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    acceptAIHandoff(chat);
    onClick?.(e);
  };

  const handleEscalateChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    escalateChat(chat.id, 'AI timeout - escalated to human agent');
    onClick?.(e);
  };

  const getChatTypeIndicator = () => {
    if (isAIChat) {
      return (
        <div className="flex items-center gap-1" title="AI handled">
          <Brain className="h-3 w-3 text-blue-500" />
          {shouldTimeout && <AlertTriangle className="h-3 w-3 text-orange-500" />}
        </div>
      );
    }
    return (
      <div title="Human handled">
        <User className="h-3 w-3 text-green-500" />
      </div>
    );
  };

  const getStatusBadge = () => {
    if (isAIChat) {
      return (
        <Badge variant={shouldTimeout ? 'destructive' : 'default'} className="text-xs">
          {shouldTimeout ? 'AI Timeout' : 'AI Active'}
        </Badge>
      );
    }

    const getVariant = (status: string) => {
      switch (status) {
        case 'active': return 'default';
        case 'missed': return 'destructive';
        case 'closed': return 'secondary';
        case 'escalated': return 'destructive';
        case 'ai-timeout': return 'destructive';
        default: return 'outline';
      }
    };

    return (
      <Badge variant={getVariant(chat.status)} className="text-xs">
        {(chat as any).status === 'ai-timeout' ? 'AI Timeout' : 
         (chat as any).status === 'escalated' ? 'Escalated' : 
         chat.status}
      </Badge>
    );
  };

  const renderActions = () => {
    if (isAIChat) {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleTakeoverChat}
            className="flex-1"
            variant="default"
          >
            Takeover Conversation
          </Button>
          {shouldTimeout && (
            <Button
              size="sm"
              onClick={handleEscalateChat}
              variant="destructive"
              className="flex-1"
            >
              Escalate
            </Button>
          )}
        </div>
      );
    }

    // Human queue actions
    return (
      <Button
        size="sm"
        onClick={handleAcceptChat}
        className="w-full"
        variant="default"
      >
        Accept Chat
      </Button>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {getChatTypeIndicator()}
        {getStatusBadge()}
      </div>
      {renderActions()}
    </div>
  );
}