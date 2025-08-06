/**
 * Consolidated hook for managing conversation persistence
 * Combines identification session and chat message persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/message';
import { IdentificationSession } from '@/types/user-identification';

const CONVERSATION_STORAGE_KEY = 'widget_conversation_state';

interface ConversationState {
  messages: Message[];
  identificationSession: IdentificationSession | null;
  conversationId?: string;
  status: 'new' | 'active' | 'completed' | 'pending_identification';
  timestamp: string;
  lastInteractionTime: string;
  isExpanded?: boolean;
  pendingMessages?: Message[]; // Messages waiting for identification
}

interface UseConversationPersistenceProps {
  onStateLoaded?: (state: ConversationState) => void;
}

export function useConversationPersistence({ onStateLoaded }: UseConversationPersistenceProps = {}) {
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);

  // Load existing conversation state from storage
  useEffect(() => {
    const savedState = localStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState: ConversationState = JSON.parse(savedState);
        
        // Convert string timestamps back to Date objects in messages
        const messagesWithDates = parsedState.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));

        // Validate identification session is still fresh (24 hours)
        let validSession = parsedState.identificationSession;
        if (validSession) {
          const sessionAge = new Date().getTime() - new Date(validSession.timestamp).getTime();
          if (sessionAge > 24 * 60 * 60 * 1000 || !validSession.isValid) {
            validSession = null;
          }
        }

        // Validate conversation state is not stale (7 days)
        const stateAge = new Date().getTime() - new Date(parsedState.timestamp).getTime();
        const isStateValid = stateAge < 7 * 24 * 60 * 60 * 1000;

        if (isStateValid) {
          const loadedState: ConversationState = {
            ...parsedState,
            messages: messagesWithDates,
            identificationSession: validSession,
            // If session expired but we have messages, require re-identification
            status: validSession ? parsedState.status : 
                   (messagesWithDates.length > 0 ? 'pending_identification' : 'new')
          };
          
          setConversationState(loadedState);
          onStateLoaded?.(loadedState);
        } else {
          localStorage.removeItem(CONVERSATION_STORAGE_KEY);
          setConversationState(null);
        }
      } catch (error) {
        console.error('Failed to load conversation state:', error);
        localStorage.removeItem(CONVERSATION_STORAGE_KEY);
        setConversationState(null);
      }
    }
  }, []); // Remove onStateLoaded from dependencies to prevent infinite loop

  const saveConversationState = useCallback((state: ConversationState) => {
    const stateToSave = {
      ...state,
      timestamp: new Date().toISOString(),
      lastInteractionTime: new Date().toISOString()
    };
    
    localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(stateToSave));
    setConversationState(stateToSave);
  }, []);

  const updateConversationState = useCallback((updates: Partial<ConversationState>) => {
    if (!conversationState) return;
    
    const updatedState = {
      ...conversationState,
      ...updates,
      lastInteractionTime: new Date().toISOString()
    };
    
    saveConversationState(updatedState);
  }, [conversationState, saveConversationState]);

  const createNewConversation = useCallback((initialMessage?: Message, isExpanded?: boolean) => {
    const newState: ConversationState = {
      messages: initialMessage ? [initialMessage] : [],
      identificationSession: null,
      status: 'new',
      timestamp: new Date().toISOString(),
      lastInteractionTime: new Date().toISOString(),
      isExpanded,
      pendingMessages: []
    };
    
    saveConversationState(newState);
    return newState;
  }, [saveConversationState]);

  const clearConversation = useCallback(() => {
    localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    setConversationState(null);
  }, []);

  const addMessage = useCallback((message: Message, requiresIdentification = false) => {
    if (!conversationState) {
      // Create new conversation with the message
      const newState = createNewConversation(message);
      if (requiresIdentification && message.type === 'user') {
        updateConversationState({
          status: 'pending_identification',
          pendingMessages: [message]
        });
      }
      return;
    }

    const updatedMessages = [...conversationState.messages, message];
    
    if (requiresIdentification && message.type === 'user' && !conversationState.identificationSession) {
      // Add to pending messages and mark as pending identification
      updateConversationState({
        messages: updatedMessages,
        status: 'pending_identification',
        pendingMessages: [...(conversationState.pendingMessages || []), message]
      });
    } else {
      // Normal message flow
      updateConversationState({
        messages: updatedMessages,
        status: conversationState.identificationSession ? 'active' : conversationState.status
      });
    }
  }, [conversationState, createNewConversation, updateConversationState]);

  const setIdentificationSession = useCallback((session: IdentificationSession) => {
    if (!conversationState) {
      // Create new conversation with identification
      const newState: ConversationState = {
        messages: [],
        identificationSession: session,
        status: 'active',
        timestamp: new Date().toISOString(),
        lastInteractionTime: new Date().toISOString(),
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
    updateConversationState({ messages });
  }, [updateConversationState]);

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