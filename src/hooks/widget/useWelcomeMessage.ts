/**
 * Welcome Message Management Hook
 * Isolated logic for handling welcome message creation
 */

import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/logger';

export interface WelcomeMessageConfig {
  welcomeMessage?: string;
  enabled: boolean;
}

export function useWelcomeMessage(
  widgetState: any,
  conversationPersistence: any,
  config: WelcomeMessageConfig
) {
  const hasCreatedWelcome = useRef(false);
  const lastExpansionTime = useRef<number>(0);
  
  const createWelcomeMessage = useCallback(() => {
    if (!config.enabled || !config.welcomeMessage || hasCreatedWelcome.current) {
      return;
    }

    // Only create if widget is expanded AND no messages exist AND no persisted state
    if (widgetState.isExpanded && 
        widgetState.messages.length === 0 && 
        !conversationPersistence.conversationState &&
        !conversationPersistence.isLoading) {
      
      logger.debug('WELCOME_MESSAGE_CREATE', {
        welcomeMessage: config.welcomeMessage,
        messagesLength: widgetState.messages.length
      }, 'useWelcomeMessage');
      
      const welcomeMessage = {
        id: 'welcome',
        type: 'ai' as const,
        content: config.welcomeMessage,
        timestamp: new Date()
      };
      
      widgetState.setMessages([welcomeMessage]);
      conversationPersistence.createNewConversation(welcomeMessage, true);
      hasCreatedWelcome.current = true;
    }
  }, [config.enabled, config.welcomeMessage, widgetState, conversationPersistence]);

  // Track expansion changes with debouncing
  useEffect(() => {
    if (widgetState.isExpanded) {
      const now = Date.now();
      // Debounce rapid expansion changes
      if (now - lastExpansionTime.current > 500) {
        lastExpansionTime.current = now;
        createWelcomeMessage();
      }
    } else {
      // Reset flag when widget collapses
      hasCreatedWelcome.current = false;
    }
  }, [widgetState.isExpanded, createWelcomeMessage]);

  // Reset when conversation state changes
  useEffect(() => {
    if (conversationPersistence.conversationState || widgetState.messages.length > 0) {
      hasCreatedWelcome.current = true;
    }
  }, [conversationPersistence.conversationState, widgetState.messages.length]);

  return {
    createWelcomeMessage,
    hasCreatedWelcome: hasCreatedWelcome.current
  };
}