/**
 * Tests for useChatSessions hook
 */

import { renderHook, act } from '@testing-library/react';
import { useChatSessions } from '../useChatSessions';
import { chatSessionService } from '../../services/chatSessionService';

// Mock the chat session service
jest.mock('../../services/chatSessionService', () => ({
  chatSessionService: {
    getAllSessions: jest.fn(),
    getSessions: jest.fn(),
    getSession: jest.fn(),
    createSession: jest.fn(),
    updateSession: jest.fn(),
    terminateSession: jest.fn(),
    updateActivity: jest.fn(),
    getSessionStats: jest.fn(),
  }
}));

const mockChatSessionService = chatSessionService as jest.Mocked<typeof chatSessionService>;

describe('useChatSessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSessions = [
    {
      id: 'session_1',
      conversationId: 'conv_1',
      status: 'active' as const,
      startTime: '2025-01-15T10:00:00Z',
      lastActivityTime: '2025-01-15T10:05:00Z',
      messageCount: 5,
    },
    {
      id: 'session_2',
      conversationId: 'conv_2',
      status: 'user_ended' as const,
      startTime: '2025-01-15T09:00:00Z',
      endTime: '2025-01-15T09:15:00Z',
      lastActivityTime: '2025-01-15T09:15:00Z',
      messageCount: 8,
      terminationReason: 'user_feedback',
    }
  ];

  it('should load sessions on mount', async () => {
    mockChatSessionService.getAllSessions.mockReturnValue(mockSessions);

    const { result } = renderHook(() => useChatSessions());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      // Wait for the effect to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.sessions).toEqual(mockSessions);
    expect(result.current.error).toBe(null);
  });

  it('should apply filters when provided', async () => {
    const filteredSessions = [mockSessions[0]]; // Only active sessions
    mockChatSessionService.getSessions.mockReturnValue(filteredSessions);

    const { result } = renderHook(() => 
      useChatSessions({
        filter: { status: 'active' }
      })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockChatSessionService.getSessions).toHaveBeenCalledWith({ status: 'active' });
    expect(result.current.sessions).toEqual(filteredSessions);
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Failed to load sessions';
    mockChatSessionService.getAllSessions.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const { result } = renderHook(() => useChatSessions());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.sessions).toEqual([]);
  });

  it('should create new session', async () => {
    const newSession = {
      id: 'session_3',
      conversationId: 'conv_3',
      status: 'active' as const,
      startTime: '2025-01-15T11:00:00Z',
      lastActivityTime: '2025-01-15T11:00:00Z',
      messageCount: 0,
    };

    mockChatSessionService.getAllSessions.mockReturnValue([]);
    mockChatSessionService.createSession.mockReturnValue(newSession);

    const { result } = renderHook(() => useChatSessions());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let createdSession;
    await act(async () => {
      createdSession = result.current.createSession('conv_3', 'user_1', 'Test User');
    });

    expect(mockChatSessionService.createSession).toHaveBeenCalledWith('conv_3', 'user_1', 'Test User');
    expect(createdSession).toEqual(newSession);
  });

  it('should update session', async () => {
    const updatedSession = {
      ...mockSessions[0],
      messageCount: 10,
    };

    mockChatSessionService.getAllSessions.mockReturnValue(mockSessions);
    mockChatSessionService.updateSession.mockReturnValue(updatedSession);

    const { result } = renderHook(() => useChatSessions());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let updated;
    await act(async () => {
      updated = result.current.updateSession('session_1', { messageCount: 10 });
    });

    expect(mockChatSessionService.updateSession).toHaveBeenCalledWith('session_1', { messageCount: 10 });
    expect(updated).toEqual(updatedSession);
  });

  it('should terminate session', async () => {
    const terminatedSession = {
      ...mockSessions[0],
      status: 'user_ended' as const,
      endTime: '2025-01-15T10:10:00Z',
      terminationReason: 'user_feedback',
    };

    mockChatSessionService.getAllSessions.mockReturnValue(mockSessions);
    mockChatSessionService.terminateSession.mockReturnValue(terminatedSession);

    const { result } = renderHook(() => useChatSessions());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const feedback = { rating: '5', comment: 'Great service!' };
    let terminated;
    await act(async () => {
      terminated = result.current.terminateSession('session_1', 'user_feedback', feedback);
    });

    expect(mockChatSessionService.terminateSession).toHaveBeenCalledWith('session_1', 'user_feedback', feedback);
    expect(terminated).toEqual(terminatedSession);
  });

  it('should update activity', async () => {
    const updatedSession = {
      ...mockSessions[0],
      messageCount: 6,
      lastActivityTime: '2025-01-15T10:06:00Z',
    };

    mockChatSessionService.getAllSessions.mockReturnValue(mockSessions);
    mockChatSessionService.updateActivity.mockReturnValue(updatedSession);

    const { result } = renderHook(() => useChatSessions());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let updated;
    await act(async () => {
      updated = result.current.updateActivity('session_1', 6);
    });

    expect(mockChatSessionService.updateActivity).toHaveBeenCalledWith('session_1', 6);
    expect(updated).toEqual(updatedSession);
  });

  it('should get session stats', () => {
    const mockStats = {
      total: 10,
      active: 3,
      terminated: 7,
      avgDuration: 300,
      terminationReasons: {
        user_feedback: 3,
        idle_timeout: 2,
        ai_timeout: 1,
        escalated: 1,
      }
    };

    mockChatSessionService.getAllSessions.mockReturnValue([]);
    mockChatSessionService.getSessionStats.mockReturnValue(mockStats);

    const { result } = renderHook(() => useChatSessions());

    const stats = result.current.getSessionStats();

    expect(mockChatSessionService.getSessionStats).toHaveBeenCalled();
    expect(stats).toEqual(mockStats);
  });

  it('should refresh sessions manually', async () => {
    mockChatSessionService.getAllSessions.mockReturnValue(mockSessions);

    const { result } = renderHook(() => useChatSessions());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Clear the mock to verify it's called again
    mockChatSessionService.getAllSessions.mockClear();
    mockChatSessionService.getAllSessions.mockReturnValue([...mockSessions, {
      id: 'session_3',
      conversationId: 'conv_3',
      status: 'active' as const,
      startTime: '2025-01-15T11:00:00Z',
      lastActivityTime: '2025-01-15T11:00:00Z',
      messageCount: 0,
    }]);

    await act(async () => {
      result.current.refreshSessions();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockChatSessionService.getAllSessions).toHaveBeenCalled();
    expect(result.current.sessions).toHaveLength(3);
  });
});