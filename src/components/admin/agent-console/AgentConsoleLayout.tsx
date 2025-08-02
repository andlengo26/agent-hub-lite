import React from 'react';
import { Card } from '@/components/ui/card';
import { WaitingQueue } from './WaitingQueue';
import { AIQueue } from './AIQueue';
import { ActiveChatPane } from './ActiveChatPane';
import { ContextPanel } from './ContextPanel';
import { useAgentConsole } from '@/contexts/AgentConsoleContext';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';

interface AgentConsoleLayoutProps {
  queueChats: any[];
  isLoading?: boolean;
  users: any[];
}

export function AgentConsoleLayout({ queueChats, isLoading, users }: AgentConsoleLayoutProps) {
  const { currentChatId, activeChats } = useAgentConsole();
  const { settings: widgetSettings } = useWidgetSettings();
  
  const currentChat = activeChats.find(chat => chat.id === currentChatId);
  
  // Only show AI queue if AI-first routing is enabled
  const showAIQueue = widgetSettings?.aiSettings?.enableAIFirst ?? false;

  return (
    <div className="flex h-full gap-4">
      {/* Left Column - Queues */}
      <div className="w-80 flex-shrink-0">
        <div className="space-y-4 h-full">
          {/* AI Queue - only show if AI-first is enabled */}
          {showAIQueue && (
            <Card className="flex-1">
              <AIQueue chats={queueChats} isLoading={isLoading} />
            </Card>
          )}
          
          {/* Human Queue */}
          <Card className={showAIQueue ? "flex-1" : "h-full"}>
            <WaitingQueue chats={queueChats} isLoading={isLoading} />
          </Card>
        </div>
      </div>

      {/* Center Column - Active Chat */}
      <div className="flex-1 min-w-0">
        <Card className="h-full">
          <ActiveChatPane currentChat={currentChat} />
        </Card>
      </div>

      {/* Right Column - Context Panel */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-full">
          <ContextPanel currentChat={currentChat} users={users} />
        </Card>
      </div>
    </div>
  );
}