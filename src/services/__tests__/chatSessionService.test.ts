/**
 * Tests for chatSessionService
 */

import { chatSessionService } from '../chatSessionService';

describe('ChatSessionService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  describe('createSession', () => {
    it('should create a new session with required fields', () => {
      const conversationId = 'conv_123';
      const userId = 'user_456';
      const username = 'Test User';

      const session = chatSessionService.createSession(conversationId, userId, username);

      expect(session).toMatchObject({
        conversationId,
        userId,
        username,
        status: 'active',
        messageCount: 0
      });
      expect(session.id).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(session.startTime).toBeTruthy();
      expect(session.lastActivityTime).toBeTruthy();
    });

    it('should create session without optional fields', () => {
      const conversationId = 'conv_123';

      const session = chatSessionService.createSession(conversationId);

      expect(session).toMatchObject({
        conversationId,
        status: 'active',
        messageCount: 0
      });
      expect(session.userId).toBeUndefined();
      expect(session.username).toBeUndefined();
    });

    it('should persist session to localStorage', () => {
      const session = chatSessionService.createSession('conv_123');

      const stored = JSON.parse(localStorage.getItem('chat-sessions') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject(session);
    });
  });

  describe('getAllSessions', () => {
    it('should return empty array when no sessions exist', () => {
      const sessions = chatSessionService.getAllSessions();
      expect(sessions).toEqual([]);
    });

    it('should return sessions sorted by start time (newest first)', () => {
      // Create sessions with different timestamps
      const session1 = chatSessionService.createSession('conv_1');
      setTimeout(() => {
        const session2 = chatSessionService.createSession('conv_2');
        
        const sessions = chatSessionService.getAllSessions();
        expect(sessions).toHaveLength(2);
        expect(sessions[0].id).toBe(session2.id); // Newest first
        expect(sessions[1].id).toBe(session1.id);
      }, 10);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('chat-sessions', 'invalid json');
      
      const sessions = chatSessionService.getAllSessions();
      expect(sessions).toEqual([]);
    });
  });

  describe('getSession', () => {
    it('should return session by ID', () => {
      const session = chatSessionService.createSession('conv_123');
      
      const retrieved = chatSessionService.getSession(session.id);
      expect(retrieved).toEqual(session);
    });

    it('should return null for non-existent session', () => {
      const retrieved = chatSessionService.getSession('non_existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('getSessionByConversationId', () => {
    it('should return session by conversation ID', () => {
      const conversationId = 'conv_123';
      const session = chatSessionService.createSession(conversationId);
      
      const retrieved = chatSessionService.getSessionByConversationId(conversationId);
      expect(retrieved).toEqual(session);
    });

    it('should return null for non-existent conversation ID', () => {
      const retrieved = chatSessionService.getSessionByConversationId('non_existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('updateSession', () => {
    it('should update existing session', () => {
      const session = chatSessionService.createSession('conv_123');
      const originalTime = session.lastActivityTime;
      
      // Wait a bit to ensure timestamp changes
      setTimeout(() => {
        const updated = chatSessionService.updateSession(session.id, {
          messageCount: 5,
          username: 'Updated User'
        });

        expect(updated).toBeTruthy();
        expect(updated!.messageCount).toBe(5);
        expect(updated!.username).toBe('Updated User');
        expect(updated!.lastActivityTime).not.toBe(originalTime);
      }, 10);
    });

    it('should return null for non-existent session', () => {
      const updated = chatSessionService.updateSession('non_existent', { messageCount: 5 });
      expect(updated).toBeNull();
    });

    it('should persist updates to localStorage', () => {
      const session = chatSessionService.createSession('conv_123');
      chatSessionService.updateSession(session.id, { messageCount: 10 });

      const stored = JSON.parse(localStorage.getItem('chat-sessions') || '[]');
      expect(stored[0].messageCount).toBe(10);
    });
  });

  describe('terminateSession', () => {
    it('should terminate session with reason', () => {
      const session = chatSessionService.createSession('conv_123');
      
      const terminated = chatSessionService.terminateSession(session.id, 'user_feedback');

      expect(terminated).toBeTruthy();
      expect(terminated!.status).toBe('user_ended');
      expect(terminated!.terminationReason).toBe('user_feedback');
      expect(terminated!.endTime).toBeTruthy();
      expect(terminated!.metadata?.sessionDuration).toBeGreaterThan(0);
    });

    it('should terminate session with feedback', () => {
      const session = chatSessionService.createSession('conv_123');
      const feedback = { rating: '5', comment: 'Great service!' };
      
      const terminated = chatSessionService.terminateSession(session.id, 'user_feedback', feedback);

      expect(terminated!.terminationFeedback).toEqual(feedback);
    });

    it('should map termination reasons to appropriate statuses', () => {
      const session1 = chatSessionService.createSession('conv_1');
      const session2 = chatSessionService.createSession('conv_2');
      const session3 = chatSessionService.createSession('conv_3');

      const terminated1 = chatSessionService.terminateSession(session1.id, 'idle_timeout');
      const terminated2 = chatSessionService.terminateSession(session2.id, 'ai_timeout');
      const terminated3 = chatSessionService.terminateSession(session3.id, 'escalated');

      expect(terminated1!.status).toBe('idle_timeout');
      expect(terminated2!.status).toBe('ai_timeout');
      expect(terminated3!.status).toBe('escalated');
    });

    it('should prevent double termination', () => {
      const session = chatSessionService.createSession('conv_123');
      
      const first = chatSessionService.terminateSession(session.id, 'user_feedback');
      const second = chatSessionService.terminateSession(session.id, 'idle_timeout');

      expect(first!.terminationReason).toBe('user_feedback');
      expect(second!.terminationReason).toBe('user_feedback'); // Should not change
    });

    it('should return null for non-existent session', () => {
      const terminated = chatSessionService.terminateSession('non_existent', 'user_feedback');
      expect(terminated).toBeNull();
    });
  });

  describe('updateActivity', () => {
    it('should update last activity time', () => {
      const session = chatSessionService.createSession('conv_123');
      const originalTime = session.lastActivityTime;
      
      setTimeout(() => {
        const updated = chatSessionService.updateActivity(session.id);
        expect(updated!.lastActivityTime).not.toBe(originalTime);
      }, 10);
    });

    it('should update message count when provided', () => {
      const session = chatSessionService.createSession('conv_123');
      
      const updated = chatSessionService.updateActivity(session.id, 10);
      expect(updated!.messageCount).toBe(10);
    });
  });

  describe('getSessions with filters', () => {
    beforeEach(() => {
      // Create test sessions with different properties
      const session1 = chatSessionService.createSession('conv_1', 'user_1');
      const session2 = chatSessionService.createSession('conv_2', 'user_2');
      chatSessionService.terminateSession(session1.id, 'user_feedback');
    });

    it('should filter by status', () => {
      const activeSessions = chatSessionService.getSessions({ status: 'active' });
      const endedSessions = chatSessionService.getSessions({ status: 'user_ended' });
      
      expect(activeSessions).toHaveLength(1);
      expect(endedSessions).toHaveLength(1);
    });

    it('should filter by user ID', () => {
      const user1Sessions = chatSessionService.getSessions({ userId: 'user_1' });
      const user2Sessions = chatSessionService.getSessions({ userId: 'user_2' });
      
      expect(user1Sessions).toHaveLength(1);
      expect(user2Sessions).toHaveLength(1);
    });

    it('should filter by date range', () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const todaySessions = chatSessionService.getSessions({
        dateRange: { start: today, end: tomorrow }
      });
      
      expect(todaySessions).toHaveLength(2);
    });
  });

  describe('getSessionStats', () => {
    beforeEach(() => {
      // Create test data
      const session1 = chatSessionService.createSession('conv_1');
      const session2 = chatSessionService.createSession('conv_2');
      const session3 = chatSessionService.createSession('conv_3');
      
      chatSessionService.terminateSession(session1.id, 'user_feedback');
      chatSessionService.terminateSession(session2.id, 'idle_timeout');
      // session3 remains active
    });

    it('should return correct statistics', () => {
      const stats = chatSessionService.getSessionStats();
      
      expect(stats.total).toBe(3);
      expect(stats.active).toBe(1);
      expect(stats.terminated).toBe(2);
      expect(stats.avgDuration).toBeGreaterThan(0);
      expect(stats.terminationReasons).toEqual({
        user_feedback: 1,
        idle_timeout: 1
      });
    });
  });

  describe('clearAllSessions', () => {
    it('should remove all sessions from localStorage', () => {
      chatSessionService.createSession('conv_1');
      chatSessionService.createSession('conv_2');
      
      expect(chatSessionService.getAllSessions()).toHaveLength(2);
      
      chatSessionService.clearAllSessions();
      expect(chatSessionService.getAllSessions()).toHaveLength(0);
      expect(localStorage.getItem('chat-sessions')).toBeNull();
    });
  });
});