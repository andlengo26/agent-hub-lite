/**
 * Widget State Management Hook
 * Centralizes all widget state logic and provides clean interfaces
 */

import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/message';
import { logger } from '@/lib/logger';
import { IdentificationSession } from '@/types/user-identification';
import { useWidgetViewPersistence, PanelType, TabType } from './useWidgetViewPersistence';

interface UseWidgetStateProps {
  settings: any;
  conversationPersistence: any;
  availableData?: {
    faqs?: Array<{ id: string }>;
    resources?: Array<{ id: string }>;
    chats?: Array<{ id: string }>;
  };
}

export function useWidgetState({ settings, conversationPersistence, availableData }: UseWidgetStateProps) {
  // Initialize view persistence
  const viewPersistence = useWidgetViewPersistence({
    onStateLoaded: (loadedState) => {
      if (loadedState && availableData) {
        const validatedState = viewPersistence.validateRestoredState(loadedState, availableData);
        if (validatedState) {
          logger.debug('WIDGET_VIEW_RESTORED', {
            panel: validatedState.currentPanel,
            tab: validatedState.activeTab
          }, 'useWidgetState');
        }
      }
    }
  });

  // Widget display states
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentPanel, setCurrentPanel] = useState<PanelType>(
    viewPersistence.viewState?.currentPanel || 'main'
  );
  const [activeTab, setActiveTab] = useState<TabType>(
    viewPersistence.viewState?.activeTab || 'home'
  );
  
  // Chat states
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasUserSentFirstMessage, setHasUserSentFirstMessage] = useState(false);
  const [hasActiveChat, setHasActiveChat] = useState(false);
  
  // Selection states - initialize from persisted state
  const [selectedFAQ, setSelectedFAQ] = useState<any>(() => {
    if (viewPersistence.viewState?.selectedFAQId && availableData?.faqs) {
      return availableData.faqs.find(f => f.id === viewPersistence.viewState?.selectedFAQId);
    }
    return null;
  });
  const [selectedResource, setSelectedResource] = useState<any>(() => {
    if (viewPersistence.viewState?.selectedResourceId && availableData?.resources) {
      return availableData.resources.find(r => r.id === viewPersistence.viewState?.selectedResourceId);
    }
    return null;
  });
  const [selectedChat, setSelectedChat] = useState<any>(() => {
    if (viewPersistence.viewState?.selectedChatId && availableData?.chats) {
      return availableData.chats.find(c => c.id === viewPersistence.viewState?.selectedChatId);
    }
    return null;
  });
  const [lastDetailPanel, setLastDetailPanel] = useState<'faq-detail' | 'resource-detail' | 'message-detail' | null>(
    viewPersistence.viewState?.lastDetailPanel || null
  );
  
  // Search states
  const [searchQuery, setSearchQuery] = useState(viewPersistence.viewState?.searchQuery || '');
  
  // Modal states
  const [showFAQBrowser, setShowFAQBrowser] = useState(false);
  const [showResourceBrowser, setShowResourceBrowser] = useState(false);
  const [showPostChatFeedback, setShowPostChatFeedback] = useState(false);
  const [isConversationClosed, setIsConversationClosed] = useState(false);
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);
  
  // Widget positioning
  const getPositionClasses = useCallback(() => {
    if (!settings?.appearance) return {};
    
    const paddingX = `${settings.appearance.paddingX || 24}px`;
    const paddingY = `${settings.appearance.paddingY || 24}px`;
    
    switch (settings.appearance.buttonPosition) {
      case 'bottom-left':
        return { bottom: paddingY, left: paddingX };
      case 'top-right':
        return { top: paddingY, right: paddingX };
      case 'top-left':
        return { top: paddingY, left: paddingX };
      default: // bottom-right
        return { bottom: paddingY, right: paddingX };
    }
  }, [settings?.appearance]);

  const getExpandedPositionClasses = useCallback(() => {
    if (isMaximized) return { top: '16px', left: '16px', right: '16px', bottom: '16px' };
    
    if (!settings?.appearance) return {};
    
    const paddingX = `${settings.appearance.paddingX || 24}px`;
    const paddingY = `${settings.appearance.paddingY || 24}px`;
    
    const baseStyle = { width: '384px', height: '625px' };
    
    switch (settings.appearance.buttonPosition) {
      case 'bottom-left':
        return { ...baseStyle, bottom: paddingY, left: paddingX };
      case 'top-right':
        return { ...baseStyle, top: paddingY, right: paddingX };
      case 'top-left':
        return { ...baseStyle, top: paddingY, left: paddingX };
      default: // bottom-right
        return { ...baseStyle, bottom: paddingY, right: paddingX };
    }
  }, [isMaximized, settings?.appearance]);

  // Widget state management
  const handleExpand = useCallback(() => {
    console.log('🔵 User clicked to expand widget');
    setIsExpanded(true);
    conversationPersistence.updateWidgetState?.(true);
  }, [conversationPersistence]);

  const handleMinimize = useCallback(() => {
    console.log('❌ User clicked to minimize widget');
    setIsExpanded(false);
    conversationPersistence.updateWidgetState?.(false);
  }, [conversationPersistence]);

  const handleToggleMaximize = useCallback(() => {
    setIsMaximized(!isMaximized);
  }, [isMaximized]);

  // Panel navigation
  const handleBackToMain = useCallback(() => {
    setCurrentPanel('main');
    // Remember which tab to return to when going back to detail
    if (currentPanel === 'faq-detail' || currentPanel === 'resource-detail' || currentPanel === 'message-detail') {
      setLastDetailPanel(currentPanel);
    }
    // Track panel change
    viewPersistence.trackPanelChange('main', { lastDetailPanel: currentPanel as any });
  }, [currentPanel, viewPersistence]);

  const handleStartChat = useCallback(() => {
    setCurrentPanel('chat');
    viewPersistence.trackPanelChange('chat');
    
    // Initialize welcome message if no messages exist
    if (messages.length === 0 && settings?.aiSettings?.welcomeMessage) {
      console.log('📝 Creating welcome message for new chat');
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: settings.aiSettings.welcomeMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      conversationPersistence.createNewConversation?.(welcomeMessage, isExpanded);
    }
  }, [messages.length, settings?.aiSettings?.welcomeMessage, conversationPersistence, isExpanded, viewPersistence]);

  const handleContinueChat = useCallback(() => {
    setCurrentPanel('chat');
    viewPersistence.trackPanelChange('chat');
    
    // If no messages but we have an active session, restore or create welcome message
    if (messages.length === 0 && settings?.aiSettings?.welcomeMessage) {
      console.log('📝 Restoring/creating welcome message for existing chat session');
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: settings.aiSettings.welcomeMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      if (!conversationPersistence.conversationState) {
        conversationPersistence.createNewConversation?.(welcomeMessage, isExpanded);
      }
    }
  }, [messages.length, settings?.aiSettings?.welcomeMessage, conversationPersistence, isExpanded, viewPersistence]);

  // Tab management
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    viewPersistence.trackTabChange(tab);
    
    // Special handling for messages tab
    if (tab === 'messages' && currentPanel === 'main' && lastDetailPanel === 'message-detail' && selectedChat) {
      setCurrentPanel('message-detail');
      viewPersistence.trackPanelChange('message-detail');
    }
  }, [currentPanel, lastDetailPanel, selectedChat, viewPersistence]);

  // Detail panel handlers
  const handleFAQDetail = useCallback((faq: any) => {
    setSelectedFAQ(faq);
    setCurrentPanel('faq-detail');
    setLastDetailPanel('faq-detail');
    viewPersistence.trackSelection('faq', faq.id, 'faq-detail');
  }, [viewPersistence]);

  const handleResourceDetail = useCallback((resource: any) => {
    setSelectedResource(resource);
    setCurrentPanel('resource-detail');
    setLastDetailPanel('resource-detail');
    viewPersistence.trackSelection('resource', resource.id, 'resource-detail');
  }, [viewPersistence]);

  const handleMessageDetail = useCallback((chat: any) => {
    setSelectedChat(chat);
    setCurrentPanel('message-detail');
    setLastDetailPanel('message-detail');
    viewPersistence.trackSelection('chat', chat.id, 'message-detail');
  }, [viewPersistence]);

  // Auto-expand logic
  useEffect(() => {
    if (conversationPersistence.isLoading || viewPersistence.isLoading) return;
    
    if (settings?.appearance?.autoOpenWidget && 
        !isExpanded && 
        messages.length === 0 && 
        !conversationPersistence.conversationState) {
      console.log('🚀 Auto-opening widget for new session');
      setTimeout(() => {
        setIsExpanded(true);
        conversationPersistence.updateWidgetState?.(true);
      }, 2000);
    }
  }, [conversationPersistence.isLoading, viewPersistence.isLoading, settings?.appearance?.autoOpenWidget, isExpanded, messages.length, conversationPersistence.conversationState]);

  // Basic state restoration - enhanced recovery handled by useMessageRecoveryEnhanced
  useEffect(() => {
    if (conversationPersistence.isLoading || viewPersistence.isLoading || !conversationPersistence.conversationState) return;
    
    const state = conversationPersistence.conversationState;
    
    // Only restore messages on initial load when current messages are empty
    if (state.messages?.length > 0 && messages.length === 0) {
      logger.messagePersistence('INITIAL_MESSAGE_RESTORE', {
        persistedCount: state.messages.length,
        conversationId: state.conversationId
      }, 'useWidgetState');
      
      const restoredMessages = state.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      
      setMessages(restoredMessages);
      
      // Check if user has sent messages before
      const hasUserMessages = restoredMessages.some(msg => msg.type === 'user');
      if (hasUserMessages) {
        setHasUserSentFirstMessage(true);
      }
    }
    
    // Handle conversation status
    if (state.status === 'completed') {
      setIsConversationClosed(true);
    }
    
    // Restore widget expansion state
    if (state.isExpanded && !isExpanded) {
      setIsExpanded(true);
    }
    
  }, [conversationPersistence.conversationState, conversationPersistence.isLoading, viewPersistence.isLoading, messages.length, setMessages, isExpanded]);

  // Track active chat state
  useEffect(() => {
    setHasActiveChat(messages.length > 0);
  }, [messages.length]);

  // Handle search query changes
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    viewPersistence.trackSearchChange(query);
  }, [viewPersistence]);

  // Enhanced panel setters that also track view state
  const setCurrentPanelWithTracking = useCallback((panel: PanelType) => {
    setCurrentPanel(panel);
    viewPersistence.trackPanelChange(panel);
  }, [viewPersistence]);

  const setActiveTabWithTracking = useCallback((tab: TabType) => {
    setActiveTab(tab);
    viewPersistence.trackTabChange(tab);
  }, [viewPersistence]);

  // Clear view state when conversation is cleared
  useEffect(() => {
    if (!conversationPersistence.conversationState && viewPersistence.viewState) {
      logger.debug('WIDGET_VIEW_CLEARED_ON_SESSION_END', {}, 'useWidgetState');
      viewPersistence.clearViewState();
    }
  }, [conversationPersistence.conversationState, viewPersistence]);

  return {
    // Display states
    isExpanded,
    isMaximized,
    currentPanel,
    activeTab,
    
    // Chat states
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isTyping,
    setIsTyping,
    isRecording,
    setIsRecording,
    hasUserSentFirstMessage,
    setHasUserSentFirstMessage,
    hasActiveChat,
    
    // Selection states
    selectedFAQ,
    selectedResource,
    selectedChat,
    lastDetailPanel,
    
    // Search states
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    
    // Modal states
    showFAQBrowser,
    setShowFAQBrowser,
    showResourceBrowser,
    setShowResourceBrowser,
    showPostChatFeedback,
    setShowPostChatFeedback,
    isConversationClosed,
    setIsConversationClosed,
    showQuotaWarning,
    setShowQuotaWarning,
    
    // Positioning
    getPositionClasses,
    getExpandedPositionClasses,
    
    // Actions
    handleExpand,
    handleMinimize,
    handleToggleMaximize,
    handleBackToMain,
    handleStartChat,
    handleContinueChat,
    handleTabChange,
    handleFAQDetail,
    handleResourceDetail,
    handleMessageDetail,
    
    // Setters for external use
    setCurrentPanel: setCurrentPanelWithTracking,
    setActiveTab: setActiveTabWithTracking,
    setSelectedFAQ,
    setSelectedResource,
    setSelectedChat,
    setLastDetailPanel,
    
    // View persistence state
    viewPersistence
  };
}