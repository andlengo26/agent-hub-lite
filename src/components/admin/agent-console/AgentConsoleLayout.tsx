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
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import { toast } from '@/hooks/use-toast';

interface AgentConsoleLayoutProps {
  queueChats: Chat[];
  isLoading?: boolean;
  users: User[];
  selectionMode?: boolean;
}

export function AgentConsoleLayout({
  queueChats, 
  isLoading, 
  users,
  selectionMode = false
}: AgentConsoleLayoutProps) {
  const { currentChatId, activeChats, acceptChat, acceptAIHandoff, switchToChat } = useAgentConsole();
  const [selectedQueueChatId, setSelectedQueueChatId] = useState<string>();
  const [contextPanelExpanded, setContextPanelExpanded] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  
  const { isConnected, triggerSync } = useRealTimeSync({
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

  const handleTakeoverChat = (chat: Chat) => {
    acceptAIHandoff(chat);
    setContextPanelExpanded(true); // Auto-expand context panel
  };

  const handleReassignChat = async (chatId: string, newAgentId: string): Promise<void> => {
    try {
      // Simulate API call for reassignment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      const newAgent = users.find(u => u.id === newAgentId);
      
      toast({
        title: "Chat Reassigned Successfully",
        description: `Chat has been reassigned to ${newAgent?.firstName} ${newAgent?.lastName}`,
      });
      
      // Optional: Remove from current agent's active chats or update state
      console.log('Chat reassigned:', chatId, 'to agent:', newAgentId);
      
    } catch (error) {
      toast({
        title: "Reassignment Failed", 
        description: "Failed to reassign chat. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-space-4">
      {/* Left Pane - Queue Preview */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-full p-0 overflow-hidden">
          <QueuePreview
            chats={queueChats}
            users={users}
            isLoading={isLoading}
            selectedChatId={selectedQueueChatId}
            onChatSelect={setSelectedQueueChatId}
            onChatAccept={handleChatAccept}
            selectionMode={selectionMode}
            selectedChats={selectedChats}
            onChatSelectionChange={setSelectedChats}
          />
        </Card>
      </div>

      {/* Center Pane - Active Chat */}
      <div className="flex-1 min-w-0">
        <Card className="h-full p-0 overflow-hidden">
          <ActiveChat
            currentChat={displayChat}
            users={users}
            onCloseChat={handleCloseChat}
            onSendMessage={handleSendMessage}
            onAcceptChat={handleChatAccept}
            onCancelChat={(chatId) => setSelectedQueueChatId(undefined)}
            onEmailTranscript={(chatId) => console.log('Email transcript:', chatId)}
            onTakeoverChat={handleTakeoverChat}
            onReassignChat={handleReassignChat}
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