import React, { createContext, useContext, useState, useCallback } from 'react';
import { Chat } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface ActiveChat extends Chat {
  isActive?: boolean;
  unreadCount?: number;
}

interface AgentConsoleContextType {
  // Active chats management
  activeChats: ActiveChat[];
  currentChatId: string | null;
  
  // Actions
  acceptChat: (chat: Chat) => void;
  switchToChat: (chatId: string) => void;
  closeChat: (chatId: string) => void;
  
  // AI-to-human handoff actions
  acceptAIHandoff: (chat: Chat) => void;
  escalateChat: (chatId: string, reason?: string) => void;
  
}

const AgentConsoleContext = createContext<AgentConsoleContextType | undefined>(undefined);

export function AgentConsoleProvider({ children }: { children: React.ReactNode }) {
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const acceptChat = useCallback((chat: Chat) => {
    // For now, assign to user_001 (Alice) as the current user
    // In a real app, this would be the currently logged-in user
    const currentUserId = 'user_001';
    
    const newActiveChat: ActiveChat = {
      ...chat,
      status: 'active',
      isActive: true,
      unreadCount: 0,
      handledBy: 'human',
      assignedAgentId: currentUserId,
      humanHandoffAt: new Date().toISOString(),
    };
    
    setActiveChats(prev => {
      const exists = prev.find(c => c.id === chat.id);
      if (exists) return prev;
      return [...prev, newActiveChat];
    });
    
    setCurrentChatId(chat.id);
    
    toast({
      title: "Chat Accepted",
      description: `You are now chatting with ${chat.requesterName}`,
    });
  }, []);

  const acceptAIHandoff = useCallback((chat: Chat) => {
    // For now, assign to user_001 (Alice) as the current user
    // In a real app, this would be the currently logged-in user
    const currentUserId = 'user_001';
    
    const handoffChat: ActiveChat = {
      ...chat,
      status: 'active',
      isActive: true,
      unreadCount: 0,
      handledBy: 'human',
      assignedAgentId: currentUserId,
      humanHandoffAt: new Date().toISOString(),
    };
    
    setActiveChats(prev => {
      const exists = prev.find(c => c.id === chat.id);
      if (exists) {
        return prev.map(c => c.id === chat.id ? handoffChat : c);
      }
      return [...prev, handoffChat];
    });
    
    setCurrentChatId(chat.id);
    
    toast({
      title: "Conversation Takeover",
      description: `You've taken over the conversation with ${chat.requesterName}`,
    });
  }, []);

  const escalateChat = useCallback((chatId: string, reason?: string) => {
    setActiveChats(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              status: 'escalated' as any,
              handledBy: 'human',
              humanHandoffAt: new Date().toISOString()
            }
          : chat
      )
    );
    
    toast({
      title: "Chat Escalated",
      description: reason || "Chat has been escalated to human agent",
    });
  }, []);

  const switchToChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
    
    // Mark chat as read
    setActiveChats(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    );
  }, []);

  const closeChat = useCallback((chatId: string) => {
    const chatToClose = activeChats.find(chat => chat.id === chatId);
    
    // Update chat status to 'closed' and mark as inactive
    setActiveChats(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, status: 'closed' as const, isActive: false }
          : chat
      )
    );
    
    // Show success notification
    if (chatToClose) {
      toast({
        title: "Chat Closed",
        description: `Chat with ${chatToClose.requesterName} has been closed successfully.`,
      });
    }
    
    // TODO: Update the chat status in the backend to 'closed'
    // This would typically involve an API call to update the chat status
    
    if (currentChatId === chatId) {
      const remainingActiveChats = activeChats.filter(chat => chat.id !== chatId && chat.isActive);
      setCurrentChatId(remainingActiveChats.length > 0 ? remainingActiveChats[0].id : null);
    }
  }, [currentChatId, activeChats]);

  const value: AgentConsoleContextType = {
    activeChats,
    currentChatId,
    acceptChat,
    acceptAIHandoff,
    escalateChat,
    switchToChat,
    closeChat,
  };

  return (
    <AgentConsoleContext.Provider value={value}>
      {children}
    </AgentConsoleContext.Provider>
  );
}

export function useAgentConsole() {
  const context = useContext(AgentConsoleContext);
  if (context === undefined) {
    throw new Error('useAgentConsole must be used within an AgentConsoleProvider');
  }
  return context;
}