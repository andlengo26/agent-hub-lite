/**
 * Consolidated hook for managing conversation persistence
 * Combines identification session and chat message persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/message';
import { IdentificationSession } from '@/types/user-identification';
import { logger } from '@/lib/logger';

const CONVERSATION_STORAGE_KEY = 'widget_conversation_state';
const STORAGE_KEY = CONVERSATION_STORAGE_KEY; // Alias for backward compatibility

interface ConversationState {
  messages: Message[];
  identificationSession: IdentificationSession | null;
  conversationId?: string;
  status: 'new' | 'active' | 'completed' | 'pending_identification';
  createdAt: Date;
  lastInteractionTime: Date;
  isExpanded?: boolean;
  pendingMessages?: Message[]; // Messages waiting for identification
}

interface UseConversationPersistenceProps {
  onStateLoaded?: (state: ConversationState) => void;
}

export function useConversationPersistence({ onStateLoaded }: UseConversationPersistenceProps = {}) {
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing conversation state from storage
  useEffect(() => {
    const loadConversationState = () => {
      setIsLoading(true);
      logger.messagePersistence('LOAD_START', { storageKey: STORAGE_KEY }, 'useConversationPersistence');
      
      const savedState = localStorage.getItem(STORAGE_KEY);
      logger.messagePersistence('STORAGE_READ', { 
        hasData: !!savedState, 
        dataLength: savedState?.length || 0 
      }, 'useConversationPersistence');
      
      if (savedState) {
        try {
          const parsedState: ConversationState = JSON.parse(savedState);
          logger.messagePersistence('PARSE_SUCCESS', { 
            messageCount: parsedState.messages?.length || 0,
            status: parsedState.status,
            conversationId: parsedState.conversationId 
          }, 'useConversationPersistence');
          
          // Validate conversation state structure and freshness
          if (parsedState.messages && Array.isArray(parsedState.messages)) {
            // Convert string dates back to Date objects for messages
            const messagesWithDates = parsedState.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            
            const loadedState = {
              ...parsedState,
              messages: messagesWithDates,
              createdAt: new Date(parsedState.createdAt),
              lastInteractionTime: new Date(parsedState.lastInteractionTime)
            };
            
            logger.messagePersistence('DATES_CONVERTED', { 
              messageCount: messagesWithDates.length,
              oldestMessage: messagesWithDates[0]?.timestamp,
              newestMessage: messagesWithDates[messagesWithDates.length - 1]?.timestamp
            }, 'useConversationPersistence');
            
            // Check if conversation is still fresh (24 hours)
            const conversationAge = new Date().getTime() - loadedState.createdAt.getTime();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (conversationAge < maxAge) {
              logger.messagePersistence('LOAD_SUCCESS', { 
                messageCount: messagesWithDates.length,
                conversationAge: Math.round(conversationAge / (1000 * 60)) + ' minutes'
              }, 'useConversationPersistence');
              setConversationState(loadedState);
              onStateLoaded?.(loadedState);
            } else {
              logger.messagePersistence('STALE_STATE_REMOVED', { 
                conversationAge: Math.round(conversationAge / (1000 * 60 * 60)) + ' hours'
              }, 'useConversationPersistence');
              localStorage.removeItem(STORAGE_KEY);
              setConversationState(null);
            }
          }
        } catch (error) {
          logger.error('Failed to parse conversation state', error, 'useConversationPersistence');
          localStorage.removeItem(STORAGE_KEY);
          setConversationState(null);
        }
      } else {
        logger.messagePersistence('NO_EXISTING_STATE', {}, 'useConversationPersistence');
        setConversationState(null);
      }
      
      setIsLoading(false);
      logger.messagePersistence('LOAD_COMPLETE', { 
        hasState: !!conversationState 
      }, 'useConversationPersistence');
    };

    loadConversationState();
  }, []);

  const saveConversationState = useCallback((state: ConversationState) => {
    logger.messagePersistence('SAVE_START', { 
      messageCount: state.messages.length,
      status: state.status,
      conversationId: state.conversationId
    }, 'useConversationPersistence');
    
    const stateToSave = {
      ...state,
      createdAt: state.createdAt.toISOString(),
      lastInteractionTime: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      setConversationState(state); // Use original state, not the serialized version
      
      logger.messagePersistence('SAVE_SUCCESS', { 
        messageCount: state.messages.length,
        storageSize: JSON.stringify(stateToSave).length
      }, 'useConversationPersistence');
    } catch (error) {
      logger.error('Failed to save conversation state', error, 'useConversationPersistence');
    }
  }, []);

  const updateConversationState = useCallback((updates: Partial<ConversationState>) => {
    if (!conversationState) return;
    
    const updatedState = {
      ...conversationState,
      ...updates,
      lastInteractionTime: new Date()
    };
    
    saveConversationState(updatedState);
  }, [conversationState, saveConversationState]);

  const createNewConversation = useCallback((initialMessage?: Message, isExpanded?: boolean) => {
    logger.messagePersistence('CREATE_NEW_CONVERSATION', { 
      hasInitialMessage: !!initialMessage,
      isExpanded,
      messageType: initialMessage?.type
    }, 'useConversationPersistence');
    
    const newState: ConversationState = {
      messages: initialMessage ? [initialMessage] : [],
      identificationSession: null,
      status: 'new',
      createdAt: new Date(),
      lastInteractionTime: new Date(),
      isExpanded,
      pendingMessages: []
    };
    
    saveConversationState(newState);
    return newState;
  }, [saveConversationState]);

  const clearConversation = useCallback(() => {
    const currentMessageCount = conversationState?.messages.length || 0;
    logger.messagePersistence('CLEAR_CONVERSATION', { 
      messageCount: currentMessageCount 
    }, 'useConversationPersistence');
    
    localStorage.removeItem(STORAGE_KEY);
    setConversationState(null);
  }, [conversationState]);

  const addMessage = useCallback((message: Message, requiresIdentification?: boolean) => {
    const currentMessageCount = conversationState?.messages.length || 0;
    
    if (!conversationState) {
      logger.messagePersistence('CREATE_NEW_CONVERSATION', { 
        messageType: message.type,
        messageContent: message.type === 'identification' ? 'identification' : (message as any).content?.substring(0, 50) + '...',
        requiresIdentification
      }, 'useConversationPersistence');
      
      const newState: ConversationState = {
        messages: [message],
        identificationSession: null,
        conversationId: `conv_${Date.now()}`,
        status: 'active',
        createdAt: new Date(),
        lastInteractionTime: new Date(),
        isExpanded: requiresIdentification || false
      };
      saveConversationState(newState);
      logger.messageValidation(1, 1, 'CREATE_NEW_CONVERSATION');
    } else {
      logger.messagePersistence('ADD_MESSAGE', { 
        messageType: message.type,
        messageContent: message.type === 'identification' ? 'identification' : (message as any).content?.substring(0, 50) + '...',
        currentMessageCount,
        newMessageCount: currentMessageCount + 1
      }, 'useConversationPersistence');
      
      const updatedState = {
        ...conversationState,
        messages: [...conversationState.messages, message],
        lastInteractionTime: new Date()
      };
      saveConversationState(updatedState);
      logger.messageValidation(currentMessageCount + 1, updatedState.messages.length, 'ADD_MESSAGE');
    }
  }, [conversationState, saveConversationState]);

  const setIdentificationSession = useCallback((session: IdentificationSession) => {
    if (!conversationState) {
      // Create new conversation with identification
      const newState: ConversationState = {
        messages: [],
        identificationSession: session,
        status: 'active',
        createdAt: new Date(),
        lastInteractionTime: new Date(),
        pendingMessages: []
      };
      saveConversationState(newState);
      return;
    }

    // Process any pending messages now that we have identification
    const pendingMessages = conversationState.pendingMessages || [];
    const allMessages = [...conversationState.messages, ...pendingMessages];

    updateConversationState({
      identificationSession: session,
      messages: allMessages,
      status: 'active',
      pendingMessages: []
    });
  }, [conversationState, saveConversationState, updateConversationState]);

  const updateMessages = useCallback((messages: Message[]) => {
    if (!conversationState) {
      logger.warn('Attempted to update messages without conversation state', { messageCount: messages.length }, 'useConversationPersistence');
      return;
    }
    
    const oldCount = conversationState.messages.length;
    logger.messagePersistence('UPDATE_MESSAGES', { 
      oldCount,
      newCount: messages.length,
      difference: messages.length - oldCount
    }, 'useConversationPersistence');
    
    // Detect potential race conditions
    if (Math.abs(messages.length - oldCount) > 3) {
      logger.raceCondition('MESSAGE_UPDATE_LARGE_CHANGE', {
        oldCount,
        newCount: messages.length,
        difference: messages.length - oldCount
      }, 'useConversationPersistence');
    }
    
    const updatedState = {
      ...conversationState,
      messages,
      lastInteractionTime: new Date()
    };
    saveConversationState(updatedState);
    logger.messageValidation(messages.length, updatedState.messages.length, 'UPDATE_MESSAGES');
  }, [conversationState, saveConversationState]);

  const updateWidgetState = useCallback((isExpanded: boolean) => {
    updateConversationState({ isExpanded });
  }, [updateConversationState]);

  const updateLastInteraction = useCallback(() => {
    if (conversationState) {
      updateConversationState({});
    }
  }, [conversationState, updateConversationState]);

  return {
    conversationState,
    isLoading,
    saveConversationState,
    updateConversationState,
    createNewConversation,
    clearConversation,
    addMessage,
    setIdentificationSession,
    updateMessages,
    updateWidgetState,
    updateLastInteraction,
    
    // Derived getters for backward compatibility
    get currentSession() { return conversationState; },
    get session() { return conversationState?.identificationSession || null; }
  };
}