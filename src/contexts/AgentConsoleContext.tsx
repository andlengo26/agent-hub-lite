import React, { createContext, useContext, useState, useCallback } from 'react';
import { Chat } from '@/types';

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
  
  // UI state
  selectedQueueChat: Chat | null;
  setSelectedQueueChat: (chat: Chat | null) => void;
  
  // Context panel state
  contextPanelTab: 'details' | 'history' | 'notes';
  setContextPanelTab: (tab: 'details' | 'history' | 'notes') => void;
}

const AgentConsoleContext = createContext<AgentConsoleContextType | undefined>(undefined);

export function AgentConsoleProvider({ children }: { children: React.ReactNode }) {
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [selectedQueueChat, setSelectedQueueChat] = useState<Chat | null>(null);
  const [contextPanelTab, setContextPanelTab] = useState<'details' | 'history' | 'notes'>('details');

  const acceptChat = useCallback((chat: Chat) => {
    const newActiveChat: ActiveChat = {
      ...chat,
      isActive: true,
      unreadCount: 0,
    };
    
    setActiveChats(prev => {
      const exists = prev.find(c => c.id === chat.id);
      if (exists) return prev;
      return [...prev, newActiveChat];
    });
    
    setCurrentChatId(chat.id);
    setSelectedQueueChat(null);
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
    // Update chat status to 'closed' instead of removing it
    setActiveChats(prev => prev.filter(chat => chat.id !== chatId));
    
    // TODO: Update the chat status in the backend to 'closed'
    // This would typically involve an API call to update the chat status
    
    if (currentChatId === chatId) {
      const remainingChats = activeChats.filter(chat => chat.id !== chatId);
      setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  }, [currentChatId, activeChats]);

  const value: AgentConsoleContextType = {
    activeChats,
    currentChatId,
    acceptChat,
    switchToChat,
    closeChat,
    selectedQueueChat,
    setSelectedQueueChat,
    contextPanelTab,
    setContextPanelTab,
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