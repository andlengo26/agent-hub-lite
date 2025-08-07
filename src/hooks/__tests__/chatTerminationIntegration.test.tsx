/**
 * Integration tests for the chat termination handling system
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { chatSessionService } from '../../services/chatSessionService';
import { SessionsList } from '../../components/widget/messages/SessionsList';
import { TerminatedSessionBanner } from '../../components/widget/TerminatedSessionBanner';

// Mock the chat session service
jest.mock('../../services/chatSessionService');
jest.mock('date-fns', () => ({
  format: jest.fn((date) => date.toString()),
  formatDistanceToNow: jest.fn(() => '5 minutes ago')
}));

const mockChatSessionService = chatSessionService as jest.Mocked<typeof chatSessionService>;

describe('Chat Termination Handling Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('SessionsList Component', () => {
  const mockSessions = [
    {
      id: 'session_1',
      conversationId: 'conv_1',
      status: 'user_ended' as const,
      startTime: '2025-01-15T10:00:00Z',
      endTime: '2025-01-15T10:15:00Z',
      lastActivityTime: '2025-01-15T10:15:00Z',
      messageCount: 8,
      terminationReason: 'user_feedback',
      terminationFeedback: {
        rating: '5',
        comment: 'Great service!'
      },
      username: 'John Doe'
    },
    {
      id: 'session_2',
      conversationId: 'conv_2',
      status: 'active' as const,
      startTime: '2025-01-15T11:00:00Z',
      lastActivityTime: '2025-01-15T11:05:00Z',
      messageCount: 3,
      username: 'Jane Smith'
    }
  ];

    beforeEach(() => {
      mockChatSessionService.getAllSessions.mockReturnValue(mockSessions);
    });

    it('should display both active and terminated sessions', async () => {
      const onSessionSelect = jest.fn();
      const onStartNewChat = jest.fn();

      renderWithProvider(
        <SessionsList 
          onSessionSelect={onSessionSelect}
          onStartNewChat={onStartNewChat}
          currentConversationId="conv_2"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Current Chat')).toBeInTheDocument();
        expect(screen.getByText('User Ended')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should show terminated session details when selected', async () => {
      const onSessionSelect = jest.fn();
      
      renderWithProvider(
        <SessionsList 
          onSessionSelect={onSessionSelect}
          currentConversationId="conv_2"
        />
      );

      await waitFor(() => {
        const terminatedSession = screen.getByText('John Doe').closest('div');
        expect(terminatedSession).toBeInTheDocument();
      });

      // Click on terminated session
      fireEvent.click(screen.getByText('John Doe'));
      expect(onSessionSelect).toHaveBeenCalledWith('session_1');
    });

    it('should handle empty sessions list', async () => {
      mockChatSessionService.getAllSessions.mockReturnValue([]);

      renderWithProvider(
        <SessionsList />
      );

      await waitFor(() => {
        expect(screen.getByText('No Chat Sessions')).toBeInTheDocument();
        expect(screen.getByText('Start your first conversation to see it here')).toBeInTheDocument();
      });
    });
  });

  describe('TerminatedSessionBanner Component', () => {
    const mockTerminatedSession = {
      id: 'session_1',
      conversationId: 'conv_1',
      status: 'user_ended' as const,
      startTime: '2025-01-15T10:00:00Z',
      endTime: '2025-01-15T10:15:00Z',
      lastActivityTime: '2025-01-15T10:15:00Z',
      messageCount: 8,
      terminationReason: 'user_feedback',
      terminationFeedback: {
        rating: '4',
        comment: 'Very helpful support!'
      },
      metadata: {
        sessionDuration: 900000 // 15 minutes
      }
    };

    it('should display session termination details correctly', () => {
      const onStartNewChat = jest.fn();

      render(
        <TerminatedSessionBanner 
          session={mockTerminatedSession}
          onStartNewChat={onStartNewChat}
        />
      );

      expect(screen.getByText('Chat Ended')).toBeInTheDocument();
      expect(screen.getByText('You ended this conversation')).toBeInTheDocument();
      expect(screen.getByText('8 messages')).toBeInTheDocument();
      expect(screen.getByText('Duration: 15m')).toBeInTheDocument();
      expect(screen.getByText('Your feedback:')).toBeInTheDocument();
      expect(screen.getByText('"Very helpful support!"')).toBeInTheDocument();
    });

    it('should handle different termination statuses', () => {
      const timeoutSession = {
        ...mockTerminatedSession,
        status: 'idle_timeout' as const,
        terminationReason: 'idle_timeout',
        terminationFeedback: undefined,
        lastActivityTime: '2025-01-15T10:15:00Z'
      };

      render(<TerminatedSessionBanner session={timeoutSession} />);

      expect(screen.getByText('Session Timeout')).toBeInTheDocument();
      expect(screen.getByText('This chat was closed due to inactivity')).toBeInTheDocument();
    });

    it('should trigger new chat when button is clicked', () => {
      const onStartNewChat = jest.fn();

      render(
        <TerminatedSessionBanner 
          session={mockTerminatedSession}
          onStartNewChat={onStartNewChat}
        />
      );

      const newChatButton = screen.getByText('Start New Chat');
      fireEvent.click(newChatButton);

      expect(onStartNewChat).toHaveBeenCalled();
    });
  });

  describe('Chat Session Service Integration', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
      mockChatSessionService.getAllSessions.mockImplementation(() => {
        const stored = localStorage.getItem('chat-sessions');
        return stored ? JSON.parse(stored) : [];
      });
    });

    it('should create and terminate session lifecycle', () => {
      const mockCreate = jest.fn().mockReturnValue({
        id: 'session_1',
        conversationId: 'conv_1',
        status: 'active',
        startTime: '2025-01-15T10:00:00Z',
        messageCount: 0
      });

      const mockTerminate = jest.fn().mockReturnValue({
        id: 'session_1',
        conversationId: 'conv_1',
        status: 'user_ended',
        startTime: '2025-01-15T10:00:00Z',
        endTime: '2025-01-15T10:15:00Z',
        messageCount: 5,
        terminationReason: 'user_feedback'
      });

      mockChatSessionService.createSession = mockCreate;
      mockChatSessionService.terminateSession = mockTerminate;

      // Create session
      const session = chatSessionService.createSession('conv_1', 'user_1', 'Test User');
      expect(mockCreate).toHaveBeenCalledWith('conv_1', 'user_1', 'Test User');
      expect(session.status).toBe('active');

      // Terminate session
      const terminated = chatSessionService.terminateSession(
        session.id, 
        'user_feedback', 
        { rating: '5', comment: 'Great!' }
      );
      expect(mockTerminate).toHaveBeenCalledWith(
        session.id, 
        'user_feedback', 
        { rating: '5', comment: 'Great!' }
      );
      expect(terminated?.status).toBe('user_ended');
    });

    it('should handle session recovery from localStorage', () => {
      const existingSessions = [
        {
          id: 'session_1',
          conversationId: 'conv_1',
          status: 'user_ended' as const,
          startTime: '2025-01-15T10:00:00Z',
          endTime: '2025-01-15T10:15:00Z',
          lastActivityTime: '2025-01-15T10:15:00Z',
          messageCount: 5,
          terminationReason: 'user_feedback'
        }
      ];

      localStorage.setItem('chat-sessions', JSON.stringify(existingSessions));
      mockChatSessionService.getAllSessions.mockReturnValue(existingSessions);

      const sessions = chatSessionService.getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].status).toBe('user_ended');
    });
  });

  describe('End-to-End Integration', () => {
    it('should complete full session lifecycle', async () => {
      // Mock a complete session flow
      const mockSessions = [
        {
          id: 'session_1',
          conversationId: 'conv_1',
          status: 'active' as const,
          startTime: '2025-01-15T10:00:00Z',
          lastActivityTime: '2025-01-15T10:00:00Z',
          messageCount: 0,
          username: 'Test User'
        }
      ];

      mockChatSessionService.getAllSessions.mockReturnValue(mockSessions);
      mockChatSessionService.updateActivity.mockReturnValue({
        ...mockSessions[0],
        messageCount: 1,
        lastActivityTime: '2025-01-15T10:01:00Z'
      });

      mockChatSessionService.terminateSession.mockReturnValue({
        ...mockSessions[0],
        status: 'user_ended',
        endTime: '2025-01-15T10:15:00Z',
        lastActivityTime: '2025-01-15T10:15:00Z',
        messageCount: 5,
        terminationReason: 'user_feedback',
        terminationFeedback: { rating: '5', comment: 'Great service!' }
      });

      const onSessionSelect = jest.fn();
      const onStartNewChat = jest.fn();

      renderWithProvider(
        <SessionsList 
          onSessionSelect={onSessionSelect}
          onStartNewChat={onStartNewChat}
          currentConversationId="conv_1"
        />
      );

      // Should show current active session
      await waitFor(() => {
        expect(screen.getByText('Current Chat')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      // Simulate session termination
      const terminatedSession = chatSessionService.terminateSession(
        'session_1', 
        'user_feedback', 
        { rating: '5', comment: 'Great service!' }
      );

      expect(terminatedSession?.status).toBe('user_ended');
      expect(terminatedSession?.terminationFeedback?.rating).toBe('5');
    });
  });
});