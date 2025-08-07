/**
 * Hook for managing chat sessions with the central chat session service
 */

import { useState, useEffect, useCallback } from 'react';
import { chatSessionService, ChatSession, ChatSessionFilter } from '../services/chatSessionService';

export interface UseChatSessionsOptions {
  filter?: ChatSessionFilter;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseChatSessionsReturn {
  sessions: ChatSession[];
  loading: boolean;
  error: string | null;
  refreshSessions: () => void;
  getSession: (sessionId: string) => ChatSession | null;
  getSessionByConversationId: (conversationId: string) => ChatSession | null;
  createSession: (conversationId: string, userId?: string, username?: string) => ChatSession;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => ChatSession | null;
  terminateSession: (sessionId: string, reason: string, feedback?: { rating: string; comment: string }) => ChatSession | null;
  updateActivity: (sessionId: string, messageCount?: number) => ChatSession | null;
  getSessionStats: () => ReturnType<typeof chatSessionService.getSessionStats>;
}

export function useChatSessions(options: UseChatSessionsOptions = {}): UseChatSessionsReturn {
  const { filter, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      
      const loadedSessions = filter 
        ? chatSessionService.getSessions(filter)
        : chatSessionService.getAllSessions();
      
      setSessions(loadedSessions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chat sessions';
      setError(errorMessage);
      console.error('Error loading chat sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const refreshSessions = useCallback(() => {
    loadSessions();
  }, [loadSessions]);

  const getSession = useCallback((sessionId: string): ChatSession | null => {
    return chatSessionService.getSession(sessionId);
  }, []);

  const getSessionByConversationId = useCallback((conversationId: string): ChatSession | null => {
    return chatSessionService.getSessionByConversationId(conversationId);
  }, []);

  const createSession = useCallback((conversationId: string, userId?: string, username?: string): ChatSession => {
    const session = chatSessionService.createSession(conversationId, userId, username);
    refreshSessions(); // Refresh to show the new session
    return session;
  }, [refreshSessions]);

  const updateSession = useCallback((sessionId: string, updates: Partial<ChatSession>): ChatSession | null => {
    const updatedSession = chatSessionService.updateSession(sessionId, updates);
    if (updatedSession) {
      refreshSessions(); // Refresh to show the updated session
    }
    return updatedSession;
  }, [refreshSessions]);

  const terminateSession = useCallback((
    sessionId: string, 
    reason: string, 
    feedback?: { rating: string; comment: string }
  ): ChatSession | null => {
    const terminatedSession = chatSessionService.terminateSession(sessionId, reason, feedback);
    if (terminatedSession) {
      refreshSessions(); // Refresh to show the terminated session
    }
    return terminatedSession;
  }, [refreshSessions]);

  const updateActivity = useCallback((sessionId: string, messageCount?: number): ChatSession | null => {
    const updatedSession = chatSessionService.updateActivity(sessionId, messageCount);
    if (updatedSession) {
      // Only refresh if this session is visible in current filter
      const isVisible = sessions.some(s => s.id === sessionId);
      if (isVisible) {
        refreshSessions();
      }
    }
    return updatedSession;
  }, [refreshSessions, sessions]);

  const getSessionStats = useCallback(() => {
    return chatSessionService.getSessionStats();
  }, []);

  // Load sessions on mount and when filter changes
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshSessions();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshSessions]);

  // Listen to localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'chat-sessions') {
        refreshSessions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshSessions]);

  return {
    sessions,
    loading,
    error,
    refreshSessions,
    getSession,
    getSessionByConversationId,
    createSession,
    updateSession,
    terminateSession,
    updateActivity,
    getSessionStats
  };
}