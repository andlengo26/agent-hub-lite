/**
 * Widget State Management Hook
 * Centralizes all widget state logic and provides clean interfaces
 */

import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/message';
import { logger } from '@/lib/logger';
import { IdentificationSession } from '@/types/user-identification';
import { useWidgetLoadingState } from './useWidgetLoadingState';
import { useInteractionProtection } from './useInteractionProtection';

export type PanelType = 'main' | 'chat' | 'faq-detail' | 'resource-detail' | 'message-detail';
export type TabType = 'home' | 'messages' | 'resources';

interface UseWidgetStateProps {
  settings: any;
  conversationPersistence: any;
}

export function useWidgetState({ settings, conversationPersistence }: UseWidgetStateProps) {
  // Initialize loading state management
  const loadingStateManager = useWidgetLoadingState();
  
  // Initialize interaction protection
  const interactionProtection = useInteractionProtection(loadingStateManager, {
    debugMode: process.env.NODE_ENV === 'development'
  });

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

  // Save widget navigation state to persistence
  const saveWidgetNavigationState = useCallback(() => {
    if (conversationPersistence.updateWidgetNavigationState) {
      conversationPersistence.updateWidgetNavigationState({
        currentPanel,
        activeTab,
        selectedFAQ,
        selectedResource,
        selectedChat,
        lastDetailPanel,
        searchQuery
      });
    }
  }, [conversationPersistence, currentPanel, activeTab, selectedFAQ, selectedResource, selectedChat, lastDetailPanel, searchQuery]);

  // Widget state management
  const handleExpand = useCallback(() => {
    console.log('🔵 User clicked to expand widget');
    
    // Add loading operation for widget expansion
    loadingStateManager.addOperation({
      id: 'widget-expand',
      type: 'conversation',
      priority: 1,
      blockInteractions: false // Don't block on expand
    });
    
    setIsExpanded(true);
    conversationPersistence.updateWidgetState?.(true);
    
    // Remove loading after expansion completes
    setTimeout(() => {
      loadingStateManager.removeOperation('widget-expand');
    }, 300);
  }, [conversationPersistence, loadingStateManager]);

  const handleMinimize = useCallback(() => {
    console.log('❌ User clicked to minimize widget');
    
    // Clear any stuck loading states before minimizing
    loadingStateManager.clearAllOperations();
    
    setIsExpanded(false);
    conversationPersistence.updateWidgetState?.(false);
  }, [conversationPersistence, loadingStateManager]);

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
    saveWidgetNavigationState();
  }, [currentPanel, saveWidgetNavigationState]);

  const handleStartChat = useCallback(() => {
    setCurrentPanel('chat');
    saveWidgetNavigationState();
    
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
  }, [messages.length, settings?.aiSettings?.welcomeMessage, conversationPersistence, isExpanded, saveWidgetNavigationState]);

  const handleContinueChat = useCallback(() => {
    setCurrentPanel('chat');
    saveWidgetNavigationState();
    
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
  }, [messages.length, settings?.aiSettings?.welcomeMessage, conversationPersistence, isExpanded, saveWidgetNavigationState]);

  // Tab management
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    
    // Special handling for messages tab
    if (tab === 'messages' && currentPanel === 'main' && lastDetailPanel === 'message-detail' && selectedChat) {
      setCurrentPanel('message-detail');
    }
    
    saveWidgetNavigationState();
  }, [currentPanel, lastDetailPanel, selectedChat, saveWidgetNavigationState]);

  // Detail panel handlers
  const handleFAQDetail = useCallback((faq: any) => {
    setSelectedFAQ(faq);
    setCurrentPanel('faq-detail');
    setLastDetailPanel('faq-detail');
    saveWidgetNavigationState();
  }, [saveWidgetNavigationState]);

  const handleResourceDetail = useCallback((resource: any) => {
    setSelectedResource(resource);
    setCurrentPanel('resource-detail');
    setLastDetailPanel('resource-detail');
    saveWidgetNavigationState();
  }, [saveWidgetNavigationState]);

  const handleMessageDetail = useCallback((chat: any) => {
    setSelectedChat(chat);
    setCurrentPanel('message-detail');
    setLastDetailPanel('message-detail');
    saveWidgetNavigationState();
  }, [saveWidgetNavigationState]);

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

  // Track conversation persistence loading state
  useEffect(() => {
    if (conversationPersistence.isLoading) {
      loadingStateManager.addOperation({
        id: 'conversation-persistence-load',
        type: 'conversation',
        priority: 3,
        blockInteractions: true
      });
    } else {
      loadingStateManager.removeOperation('conversation-persistence-load');
    }
  }, [conversationPersistence.isLoading, loadingStateManager]);

  // Basic state restoration - enhanced recovery handled by useMessageRecoveryEnhanced
  useEffect(() => {
    if (conversationPersistence.isLoading || !conversationPersistence.conversationState) return;
    
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
    
  }, [conversationPersistence.conversationState, conversationPersistence.isLoading, messages.length, setMessages, isExpanded]);

  // Restore widget navigation state from persistence
  useEffect(() => {
    if (conversationPersistence.isLoading || !conversationPersistence.conversationState?.widgetState) return;
    
    const widgetState = conversationPersistence.conversationState.widgetState;
    
    logger.messagePersistence('RESTORE_WIDGET_NAVIGATION', {
      panel: widgetState.currentPanel,
      tab: widgetState.activeTab,
      hasSelectedItems: !!(widgetState.selectedFAQ || widgetState.selectedResource || widgetState.selectedChat)
    }, 'useWidgetState');
    
    // Restore navigation state
    if (widgetState.currentPanel) setCurrentPanel(widgetState.currentPanel);
    if (widgetState.activeTab) setActiveTab(widgetState.activeTab);
    if (widgetState.selectedFAQ) setSelectedFAQ(widgetState.selectedFAQ);
    if (widgetState.selectedResource) setSelectedResource(widgetState.selectedResource);
    if (widgetState.selectedChat) setSelectedChat(widgetState.selectedChat);
    if (widgetState.lastDetailPanel) setLastDetailPanel(widgetState.lastDetailPanel);
    if (widgetState.searchQuery) setSearchQuery(widgetState.searchQuery);
    
  }, [conversationPersistence.isLoading, conversationPersistence.conversationState?.widgetState]);

  // Save widget navigation state when search query changes
  useEffect(() => {
    if (searchQuery && !conversationPersistence.isLoading) {
      saveWidgetNavigationState();
    }
  }, [searchQuery, saveWidgetNavigationState, conversationPersistence.isLoading]);

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
    setLastDetailPanel,
    
    // Loading and interaction protection
    loadingStateManager,
    interactionProtection
  };
}