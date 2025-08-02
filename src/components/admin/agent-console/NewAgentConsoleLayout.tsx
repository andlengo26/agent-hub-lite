/**
 * New Agent Console Layout - Three-pane design
 * Replaces the old AgentConsoleLayout with improved UX
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { QueuePreview } from './QueuePreview';
import { ActiveChat } from './ActiveChat';
import { ExpandableContextPanel } from './ExpandableContextPanel';
import { WaitingQueue } from './WaitingQueue';
import { AIQueue } from './AIQueue';
import { useAgentConsole } from '@/contexts/AgentConsoleContext';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { Chat, User } from '@/types';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import { toast } from '@/hooks/use-toast';

interface NewAgentConsoleLayoutProps {
  queueChats: Chat[];
  isLoading?: boolean;
  users: User[];
  selectionMode?: boolean;
}

export function NewAgentConsoleLayout({ 
  queueChats, 
  isLoading, 
  users,
  selectionMode = false
}: NewAgentConsoleLayoutProps) {
  const { currentChatId, activeChats, acceptChat, switchToChat } = useAgentConsole();
  const [selectedQueueChatId, setSelectedQueueChatId] = useState<string>();
  const [contextPanelExpanded, setContextPanelExpanded] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  
  const { isConnected, handleNewChatIngestion } = useRealTimeSync({
    onChatUpdate: (chat) => {
      console.log('Chat updated in agent console:', chat.id);
      // Automatically refresh queue if new chat arrives
      if (chat.status === 'waiting') {
        // Trigger queue refresh
      }
    },
    enableNotifications: true,
  });

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

  const { settings: widgetSettings } = useWidgetSettings();
  const showAIQueue = widgetSettings?.aiSettings?.enableAIFirst ?? false;

  return (
    <div className="flex h-[calc(100vh-200px)] gap-space-4">
      {/* Left Pane - Dual Queue View */}
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
            onSendFollowUpEmail={async (emailData) => console.log('Send follow up email:', emailData)}
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