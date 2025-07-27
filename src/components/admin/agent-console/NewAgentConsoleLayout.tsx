/**
 * New Agent Console Layout - Three-pane design
 * Replaces the old AgentConsoleLayout with improved UX
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { QueuePreview } from './QueuePreview';
import { ActiveChat } from './ActiveChat';
import { ExpandableContextPanel } from './ExpandableContextPanel';
import { useAgentConsole } from '@/contexts/AgentConsoleContext';
import { Chat, User } from '@/types';
import { useWebSocketChats } from '@/hooks/useWebSocketChats';
import { toast } from '@/hooks/use-toast';

interface NewAgentConsoleLayoutProps {
  queueChats: Chat[];
  isLoading?: boolean;
  users: User[];
}

export function NewAgentConsoleLayout({ 
  queueChats, 
  isLoading, 
  users 
}: NewAgentConsoleLayoutProps) {
  const { currentChatId, activeChats, acceptChat, switchToChat } = useAgentConsole();
  const [selectedQueueChatId, setSelectedQueueChatId] = useState<string>();
  const [contextPanelExpanded, setContextPanelExpanded] = useState(true);
  const { isConnected } = useWebSocketChats();

  const currentChat = activeChats.find(chat => chat.id === currentChatId);
  const selectedQueueChat = queueChats.find(chat => chat.id === selectedQueueChatId);
  
  // Use selected queue chat if no active chat is current
  const displayChat = currentChat || selectedQueueChat;

  const handleChatAccept = (chatId: string) => {
    const chatToAccept = queueChats.find(chat => chat.id === chatId);
    if (chatToAccept) {
      acceptChat(chatToAccept);
      setSelectedQueueChatId(undefined);
      setContextPanelExpanded(true); // Auto-expand context panel
      
      toast({
        title: "Chat Accepted",
        description: "You are now assisting this customer.",
        duration: 3000,
      });
    }
  };

  const handleSendMessage = (message: string) => {
    // Handle message sending logic
    console.log('Sending message:', message);
  };

  const handleCloseChat = (chatId: string) => {
    // Handle chat closing logic
    console.log('Closing chat:', chatId);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6 p-4">
      {/* Left Pane - Queue Preview */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-full p-0 overflow-hidden">
          <QueuePreview
            chats={queueChats}
            isLoading={isLoading}
            selectedChatId={selectedQueueChatId}
            onChatSelect={setSelectedQueueChatId}
            onChatAccept={handleChatAccept}
          />
        </Card>
      </div>

      {/* Center Pane - Active Chat */}
      <div className="flex-1 min-w-0">
        <Card className="h-full p-0 overflow-hidden">
          <ActiveChat
            currentChat={displayChat}
            onCloseChat={handleCloseChat}
            onSendMessage={handleSendMessage}
            onAcceptChat={handleChatAccept}
            onCancelChat={(chatId) => setSelectedQueueChatId(undefined)}
            onEmailTranscript={(chatId) => console.log('Email transcript:', chatId)}
          />
        </Card>
      </div>

      {/* Right Pane - Expandable Context Panel */}
      <ExpandableContextPanel
        currentChat={displayChat}
        users={users}
        width={320}
        isExpanded={contextPanelExpanded}
        onToggleExpanded={() => setContextPanelExpanded(!contextPanelExpanded)}
        isLoading={isLoading}
      />
    </div>
  );
}