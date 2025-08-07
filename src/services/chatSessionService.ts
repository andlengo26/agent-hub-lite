/**
 * Central chat session management service with localStorage persistence
 */

export interface ChatSession {
  id: string;
  conversationId: string;
  userId?: string;
  username?: string;
  status: 'active' | 'ended' | 'idle' | 'idle_timeout' | 'user_ended' | 'ai_timeout' | 'escalated';
  startTime: string;
  endTime?: string;
  lastActivityTime: string;
  messageCount: number;
  terminationReason?: string;
  terminationFeedback?: {
    rating: string;
    comment: string;
  };
  metadata?: {
    userAgent?: string;
    pageUrl?: string;
    sessionDuration?: number;
    escalationReason?: string;
  };
}

export interface ChatSessionFilter {
  status?: ChatSession['status'];
  userId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

class ChatSessionService {
  private readonly STORAGE_KEY = 'chat-sessions';
  private readonly MAX_SESSIONS = 1000; // Prevent localStorage from growing too large

  /**
   * Get all chat sessions from localStorage
   */
  getAllSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const sessions: ChatSession[] = JSON.parse(stored);
      return sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    } catch (error) {
      console.warn('Failed to load chat sessions from localStorage:', error);
      return [];
    }
  }

  /**
   * Get sessions with optional filtering
   */
  getSessions(filter?: ChatSessionFilter): ChatSession[] {
    let sessions = this.getAllSessions();

    if (filter?.status) {
      sessions = sessions.filter(session => session.status === filter.status);
    }

    if (filter?.userId) {
      sessions = sessions.filter(session => session.userId === filter.userId);
    }

    if (filter?.dateRange) {
      const startDate = new Date(filter.dateRange.start);
      const endDate = new Date(filter.dateRange.end);
      sessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= startDate && sessionDate <= endDate;
      });
    }

    return sessions;
  }

  /**
   * Get a specific session by ID
   */
  getSession(sessionId: string): ChatSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(session => session.id === sessionId) || null;
  }

  /**
   * Get session by conversation ID
   */
  getSessionByConversationId(conversationId: string): ChatSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(session => session.conversationId === conversationId) || null;
  }

  /**
   * Create a new chat session
   */
  createSession(conversationId: string, userId?: string, username?: string): ChatSession {
    const session: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      userId,
      username,
      status: 'active',
      startTime: new Date().toISOString(),
      lastActivityTime: new Date().toISOString(),
      messageCount: 0
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Update an existing session
   */
  updateSession(sessionId: string, updates: Partial<ChatSession>): ChatSession | null {
    const sessions = this.getAllSessions();
    const sessionIndex = sessions.findIndex(session => session.id === sessionId);

    if (sessionIndex === -1) {
      console.warn(`Session ${sessionId} not found`);
      return null;
    }

    const updatedSession = {
      ...sessions[sessionIndex],
      ...updates,
      lastActivityTime: new Date().toISOString()
    };

    sessions[sessionIndex] = updatedSession;
    this.saveSessions(sessions);
    
    return updatedSession;
  }

  /**
   * Terminate a session with reason and optional feedback
   */
  terminateSession(
    sessionId: string, 
    reason: string, 
    feedback?: { rating: string; comment: string }
  ): ChatSession | null {
    const session = this.getSession(sessionId);
    if (!session) {
      console.warn(`Cannot terminate session ${sessionId}: session not found`);
      return null;
    }

    // Prevent double termination
    if (session.endTime) {
      console.warn(`Session ${sessionId} is already terminated`);
      return session;
    }

    const endTime = new Date().toISOString();
    const sessionDuration = new Date(endTime).getTime() - new Date(session.startTime).getTime();

    const updates: Partial<ChatSession> = {
      status: this.getTerminationStatus(reason),
      endTime,
      terminationReason: reason,
      terminationFeedback: feedback,
      metadata: {
        ...session.metadata,
        sessionDuration
      }
    };

    return this.updateSession(sessionId, updates);
  }

  /**
   * Update session activity (message count, last activity time)
   */
  updateActivity(sessionId: string, messageCount?: number): ChatSession | null {
    const updates: Partial<ChatSession> = {
      lastActivityTime: new Date().toISOString()
    };

    if (messageCount !== undefined) {
      updates.messageCount = messageCount;
    }

    return this.updateSession(sessionId, updates);
  }

  /**
   * Save a single session
   */
  private saveSession(session: ChatSession): void {
    const sessions = this.getAllSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);

    if (existingIndex !== -1) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session); // Add to beginning for recency
    }

    this.saveSessions(sessions);
  }

  /**
   * Save all sessions to localStorage with size management
   */
  private saveSessions(sessions: ChatSession[]): void {
    try {
      // Keep only the most recent sessions to prevent localStorage overflow
      const trimmedSessions = sessions.slice(0, this.MAX_SESSIONS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedSessions));
    } catch (error) {
      console.error('Failed to save chat sessions to localStorage:', error);
      
      // If storage is full, try to save with fewer sessions
      if (error instanceof DOMException && error.code === 22) {
        const reducedSessions = sessions.slice(0, Math.floor(this.MAX_SESSIONS / 2));
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reducedSessions));
        } catch (retryError) {
          console.error('Failed to save even reduced chat sessions:', retryError);
        }
      }
    }
  }

  /**
   * Map termination reason to appropriate status
   */
  private getTerminationStatus(reason: string): ChatSession['status'] {
    switch (reason.toLowerCase()) {
      case 'user_ended':
      case 'user_closed':
      case 'user_feedback':
        return 'user_ended';
      case 'idle_timeout':
      case 'session_timeout':
        return 'idle_timeout';
      case 'ai_timeout':
      case 'ai_limit_reached':
        return 'ai_timeout';
      case 'escalated':
      case 'human_requested':
        return 'escalated';
      default:
        return 'ended';
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    total: number;
    active: number;
    terminated: number;
    avgDuration: number;
    terminationReasons: Record<string, number>;
  } {
    const sessions = this.getAllSessions();
    const terminated = sessions.filter(s => s.endTime);
    
    const avgDuration = terminated.length > 0 
      ? terminated.reduce((sum, session) => {
          const duration = session.metadata?.sessionDuration || 0;
          return sum + duration;
        }, 0) / terminated.length
      : 0;

    const terminationReasons = terminated.reduce((acc, session) => {
      const reason = session.terminationReason || 'unknown';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: sessions.length,
      active: sessions.filter(s => s.status === 'active').length,
      terminated: terminated.length,
      avgDuration: Math.round(avgDuration / 1000), // Convert to seconds
      terminationReasons
    };
  }

  /**
   * Clear all sessions (for testing/debugging)
   */
  clearAllSessions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const chatSessionService = new ChatSessionService();
