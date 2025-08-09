import { renderHook, act } from '@testing-library/react';
import { useConversationPersistence } from '../useConversationPersistence';
import { chatSessionService } from '@/services/chatSessionService';
import { Message } from '@/types/message';

// Mocks
jest.mock('@/lib/logger', () => ({
  logger: {
    messagePersistence: jest.fn(),
    raceCondition: jest.fn(),
    messageValidation: jest.fn(),
    stateTransition: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useConversationPersistence (refactor coverage)', () => {
  const STORAGE_KEY = 'widget_conversation_state';

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('restores terminated chat session and hydrates dates', async () => {
    // Arrange: create a terminated chat session
    const convId = 'conv_refactor_test';
    const session = chatSessionService.createSession(convId);
    chatSessionService.terminateSession(session.id, 'user_ended', { rating: '5' });

    // Prepare persisted conversation state
    const message: Message = {
      id: 'm1',
      type: 'user',
      content: 'Hello',
      timestamp: new Date().toISOString() as any,
    } as any;

    const savedState = {
      messages: [message],
      identificationSession: null,
      conversationId: convId,
      chatSessionId: session.id,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastInteractionTime: new Date().toISOString(),
      isExpanded: false,
      pendingMessages: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

    // Act
    const { result } = renderHook(() => useConversationPersistence());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    // Assert: status mapped to terminated and timestamps hydrated
    const state = result.current.conversationState!;
    expect(state.status).toBe('terminated');
    expect(state.terminationReason).toBe('user_ended');
    expect(state.messages[0].timestamp instanceof Date).toBe(true);
  });

  it('clears invalid JSON without crashing', async () => {
    localStorage.setItem(STORAGE_KEY, '{bad json');

    const { result } = renderHook(() => useConversationPersistence());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current.conversationState).toBeNull();
  });
});
