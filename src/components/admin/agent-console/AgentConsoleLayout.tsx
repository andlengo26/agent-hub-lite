import React from 'react';
import { Card } from '@/components/ui/card';
import { WaitingQueue } from './WaitingQueue';
import { ActiveChatPane } from './ActiveChatPane';
import { ContextPanel } from './ContextPanel';
import { useAgentConsole } from '@/contexts/AgentConsoleContext';

interface AgentConsoleLayoutProps {
  queueChats: any[];
  isLoading?: boolean;
  users: any[];
}

export function AgentConsoleLayout({ queueChats, isLoading, users }: AgentConsoleLayoutProps) {
  const { currentChatId, activeChats } = useAgentConsole();
  
  const currentChat = activeChats.find(chat => chat.id === currentChatId);

  return (
    <div className="flex h-full gap-space-4">
      {/* Left Column - Waiting Queue */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-full">
          <WaitingQueue chats={queueChats} isLoading={isLoading} />
        </Card>
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