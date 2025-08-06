/**
 * Widget State Management Hook
 * Centralizes all widget state logic and provides clean interfaces
 */

import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/message';
import { IdentificationSession } from '@/types/user-identification';

export type PanelType = 'main' | 'chat' | 'faq-detail' | 'resource-detail' | 'message-detail';
export type TabType = 'home' | 'messages' | 'resources';

interface UseWidgetStateProps {
  settings: any;
  conversationPersistence: any;
}

export function useWidgetState({ settings, conversationPersistence }: UseWidgetStateProps) {
  // Widget display states
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentPanel, setCurrentPanel] = useState<PanelType>('main');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  // Chat states
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasUserSentFirstMessage, setHasUserSentFirstMessage] = useState(false);
  const [hasActiveChat, setHasActiveChat] = useState(false);
  
  // Selection states
  const [selectedFAQ, setSelectedFAQ] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [lastDetailPanel, setLastDetailPanel] = useState<'faq-detail' | 'resource-detail' | 'message-detail' | null>(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showFAQBrowser, setShowFAQBrowser] = useState(false);
  const [showResourceBrowser, setShowResourceBrowser] = useState(false);
  const [showPostChatFeedback, setShowPostChatFeedback] = useState(false);
  const [showMoodleReLoginPrompt, setShowMoodleReLoginPrompt] = useState(false);
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
  }, [currentPanel]);

  const handleStartChat = useCallback(() => {
    setCurrentPanel('chat');
    
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
  }, [messages.length, settings?.aiSettings?.welcomeMessage, conversationPersistence, isExpanded]);

  const handleContinueChat = useCallback(() => {
    setCurrentPanel('chat');
    
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
  }, [messages.length, settings?.aiSettings?.welcomeMessage, conversationPersistence, isExpanded]);

  // Tab management
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    
    // Special handling for messages tab
    if (tab === 'messages' && currentPanel === 'main' && lastDetailPanel === 'message-detail' && selectedChat) {
      setCurrentPanel('message-detail');
    }
  }, [currentPanel, lastDetailPanel, selectedChat]);

  // Detail panel handlers
  const handleFAQDetail = useCallback((faq: any) => {
    setSelectedFAQ(faq);
    setCurrentPanel('faq-detail');
    setLastDetailPanel('faq-detail');
  }, []);

  const handleResourceDetail = useCallback((resource: any) => {
    setSelectedResource(resource);
    setCurrentPanel('resource-detail');
    setLastDetailPanel('resource-detail');
  }, []);

  const handleMessageDetail = useCallback((chat: any) => {
    setSelectedChat(chat);
    setCurrentPanel('message-detail');
    setLastDetailPanel('message-detail');
  }, []);

  // Auto-expand logic
  useEffect(() => {
    if (conversationPersistence.isLoading) return;
    
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
  }, [conversationPersistence.isLoading, settings?.appearance?.autoOpenWidget, isExpanded, messages.length, conversationPersistence.conversationState]);

  // Initialize messages and state from conversation persistence on widget load
  useEffect(() => {
    if (conversationPersistence.isLoading || !conversationPersistence.conversationState) return;
    
    const state = conversationPersistence.conversationState;
    
    // Restore messages if we have them and current messages are empty
    if (state.messages?.length > 0 && messages.length === 0) {
      console.log('📝 Restoring messages from conversation:', state.messages.length);
      const restoredMessages = state.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp) // Ensure timestamp is a Date object
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
    
  }, [conversationPersistence.conversationState, conversationPersistence.isLoading, messages.length, setMessages, isExpanded]);

  // Track active chat state
  useEffect(() => {
    setHasActiveChat(messages.length > 0);
  }, [messages.length]);

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
    setSearchQuery,
    
    // Modal states
    showFAQBrowser,
    setShowFAQBrowser,
    showResourceBrowser,
    setShowResourceBrowser,
    showPostChatFeedback,
    setShowPostChatFeedback,
    showMoodleReLoginPrompt,
    setShowMoodleReLoginPrompt,
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
    setCurrentPanel,
    setActiveTab,
    setSelectedFAQ,
    setSelectedResource,
    setSelectedChat,
    setLastDetailPanel
  };
}