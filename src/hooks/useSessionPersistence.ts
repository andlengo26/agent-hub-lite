/**
 * Hook for managing chat session persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/message';

const CHAT_SESSION_STORAGE_KEY = 'widget_chat_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

interface ChatSession {
  id: string;
  messages: Message[];
  timestamp: Date;
  status: 'active' | 'waiting_human' | 'ended' | 'closed' | 'idle_timeout';
  conversationId?: string;
  userContext?: string;
  isExpanded: boolean;
  lastInteractionTime?: Date;
}

interface UseSessionPersistenceProps {
  onSessionLoaded?: (session: ChatSession) => void;
}

export function useSessionPersistence({ onSessionLoaded }: UseSessionPersistenceProps = {}) {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  // Load existing session from storage
  useEffect(() => {
    const savedSession = localStorage.getItem(CHAT_SESSION_STORAGE_KEY);
    if (savedSession) {
      try {
        const parsedSession: ChatSession = JSON.parse(savedSession);
        
        // Convert string timestamps back to Date objects
        parsedSession.timestamp = new Date(parsedSession.timestamp);
        if (parsedSession.lastInteractionTime) {
          parsedSession.lastInteractionTime = new Date(parsedSession.lastInteractionTime);
        }
        
        // Convert message timestamps back to Date objects
        parsedSession.messages = parsedSession.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        const now = new Date().getTime();
        const sessionAge = now - parsedSession.timestamp.getTime();
        const lastInteractionAge = parsedSession.lastInteractionTime 
          ? now - parsedSession.lastInteractionTime.getTime()
          : sessionAge;
        
        // Check if session is still valid (24 hours) and not idle (30 minutes)
        const isSessionValid = sessionAge < SESSION_TIMEOUT;
        const isIdleTimeout = lastInteractionAge > (30 * 60 * 1000); // 30 minutes
        
        if (isSessionValid && parsedSession.status !== 'ended') {
          // Mark as idle_timeout if user has been inactive too long
          if (isIdleTimeout && parsedSession.status === 'active') {
            const updatedSession = { ...parsedSession, status: 'idle_timeout' as const, isExpanded: false };
            localStorage.setItem(CHAT_SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
            setCurrentSession(updatedSession);
            onSessionLoaded?.(updatedSession);
          } else {
            setCurrentSession(parsedSession);
            onSessionLoaded?.(parsedSession);
          }
        } else {
          localStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to load chat session:', error);
        localStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
      }
    }
  }, []);

  const saveSession = useCallback((session: ChatSession) => {
    localStorage.setItem(CHAT_SESSION_STORAGE_KEY, JSON.stringify(session));
    setCurrentSession(session);
  }, []);

  const updateSession = useCallback((updates: Partial<ChatSession>) => {
    if (currentSession) {
      const updatedSession = { ...currentSession, ...updates, timestamp: new Date() };
      saveSession(updatedSession);
    }
  }, [currentSession, saveSession]);

  const createNewSession = useCallback((initialMessage?: Message, isExpanded = false) => {
    const now = new Date();
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      messages: initialMessage ? [initialMessage] : [],
      timestamp: now,
      status: 'active',
      isExpanded,
      lastInteractionTime: now
    };
    saveSession(newSession);
    return newSession;
  }, [saveSession]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
    setCurrentSession(null);
  }, []);

  const addMessage = useCallback((message: Message, widgetExpanded?: boolean) => {
    if (currentSession) {
      const updatedMessages = [...currentSession.messages, message];
      updateSession({ messages: updatedMessages });
    } else if (widgetExpanded !== undefined) {
      // Create new session with current widget state if none exists
      createNewSession(message, widgetExpanded);
    }
  }, [currentSession, updateSession, createNewSession]);

  const updateMessages = useCallback((messages: Message[]) => {
    if (currentSession) {
      updateSession({ messages });
    }
  }, [currentSession, updateSession]);

  const updateWidgetState = useCallback((isExpanded: boolean) => {
    if (currentSession) {
      updateSession({ 
        isExpanded, 
        lastInteractionTime: new Date(),
        status: currentSession.status === 'idle_timeout' ? 'active' : currentSession.status
      });
    } else {
      // Create new session if none exists to capture widget state
      createNewSession(undefined, isExpanded);
    }
  }, [currentSession, updateSession, createNewSession]);

  const updateLastInteraction = useCallback(() => {
    if (currentSession) {
      updateSession({ lastInteractionTime: new Date() });
    }
  }, [currentSession, updateSession]);

  return {
    currentSession,
    saveSession,
    updateSession,
    createNewSession,
    clearSession,
    addMessage,
    updateMessages,
    updateWidgetState,
    updateLastInteraction
  };
}