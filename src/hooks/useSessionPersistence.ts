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
  status: 'active' | 'waiting_human' | 'ended' | 'closed';
  conversationId?: string;
  userContext?: string;
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
        // Check if session is still valid
        const isSessionValid = (new Date().getTime() - new Date(parsedSession.timestamp).getTime()) < SESSION_TIMEOUT;
        
        if (isSessionValid && parsedSession.status !== 'ended') {
          setCurrentSession(parsedSession);
          onSessionLoaded?.(parsedSession);
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

  const createNewSession = useCallback((initialMessage?: Message) => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      messages: initialMessage ? [initialMessage] : [],
      timestamp: new Date(),
      status: 'active'
    };
    saveSession(newSession);
    return newSession;
  }, [saveSession]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
    setCurrentSession(null);
  }, []);

  const addMessage = useCallback((message: Message) => {
    if (currentSession) {
      const updatedMessages = [...currentSession.messages, message];
      updateSession({ messages: updatedMessages });
    }
  }, [currentSession, updateSession]);

  const updateMessages = useCallback((messages: Message[]) => {
    if (currentSession) {
      updateSession({ messages });
    }
  }, [currentSession, updateSession]);

  return {
    currentSession,
    saveSession,
    updateSession,
    createNewSession,
    clearSession,
    addMessage,
    updateMessages
  };
}