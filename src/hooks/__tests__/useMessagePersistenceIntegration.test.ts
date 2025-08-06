/**
 * End-to-end integration test for message persistence system
 * Tests the complete flow from user message to AI response with identification
 */

import { renderHook, act } from '@testing-library/react';
import { useConversationPersistence } from '../useConversationPersistence';
import { useMessageRecoveryEnhanced } from '../useMessageRecoveryEnhanced';
import { useWidgetActions } from '../widget/useWidgetActions';
import { Message } from '@/types/message';
import { IdentificationSession } from '@/types/user-identification';

// Mock dependencies
jest.mock('@/lib/logger', () => ({
  logger: {
    messagePersistence: jest.fn(),
    raceCondition: jest.fn(),
    messageValidation: jest.fn(),
    stateTransition: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() })
}));

jest.mock('@/services/conversationService', () => ({
  conversationService: {
    requestHumanHandoff: jest.fn()
  }
}));

jest.mock('@/services/feedbackService', () => ({
  feedbackService: {
    submitFeedback: jest.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Message Persistence Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should handle complete user identification flow without race conditions', async () => {
    // Setup conversation persistence
    const { result: persistenceResult } = renderHook(() => 
      useConversationPersistence({})
    );

    // Wait for loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Create initial user message requiring identification
    const userMessage: Message = {
      id: 'user_1',
      type: 'user',
      content: 'Hello, I need help',
      timestamp: new Date(),
      isPending: true
    };

    // Add message through persistence layer
    act(() => {
      persistenceResult.current.addMessage(userMessage);
    });

    // Verify message was added
    expect(persistenceResult.current.conversationState?.messages).toHaveLength(1);
    expect(persistenceResult.current.conversationState?.messages[0].id).toBe('user_1');

    // Create identification session
    const identificationSession: IdentificationSession = {
      id: 'session_1',
      type: 'manual_form_submission',
      userData: {
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '123-456-7890'
      },
      timestamp: new Date(),
      isValid: true
    };

    // Add identification message
    const identificationMessage: Message = {
      id: 'identification_1',
      type: 'identification',
      timestamp: new Date(),
      isCompleted: false
    };

    act(() => {
      persistenceResult.current.addMessage(identificationMessage);
    });

    // Complete identification session
    act(() => {
      persistenceResult.current.setIdentificationSession(identificationSession);
    });

    // Verify identification was processed correctly
    expect(persistenceResult.current.conversationState?.identificationSession).toBeDefined();
    expect(persistenceResult.current.conversationState?.messages).not.toContain(
      expect.objectContaining({ type: 'identification' })
    );

    // Verify user message is no longer pending
    const userMessageAfterIdentification = persistenceResult.current.conversationState?.messages.find(
      msg => msg.id === 'user_1'
    ) as any;
    expect(userMessageAfterIdentification?.isPending).toBeFalsy();
  });

  it('should detect and recover from message count mismatches', async () => {
    const messages: Message[] = [
      {
        id: 'msg_1',
        type: 'user',
        content: 'Test message',
        timestamp: new Date()
      }
    ];

    const setMessages = jest.fn();

    // Mock persistence with more messages than current state
    const mockPersistence = {
      isLoading: false,
      conversationState: {
        messages: [
          ...messages,
          {
            id: 'msg_2',
            type: 'ai',
            content: 'AI response',
            timestamp: new Date()
          }
        ]
      }
    };

    const { result } = renderHook(() => 
      useMessageRecoveryEnhanced({
        messages,
        conversationPersistence: mockPersistence,
        setMessages
      })
    );

    // Trigger recovery
    act(() => {
      result.current.forceRecovery();
    });

    // Verify recovery was triggered
    expect(setMessages).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'msg_1' }),
        expect.objectContaining({ id: 'msg_2' })
      ])
    );
  });

  it('should prevent duplicate message IDs during updates', async () => {
    const { result } = renderHook(() => 
      useConversationPersistence({})
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Create messages with duplicate IDs
    const messagesWithDuplicates: Message[] = [
      {
        id: 'duplicate_id',
        type: 'user',
        content: 'First message',
        timestamp: new Date()
      },
      {
        id: 'duplicate_id',
        type: 'ai',
        content: 'Duplicate ID message',
        timestamp: new Date()
      },
      {
        id: 'unique_id',
        type: 'user',
        content: 'Unique message',
        timestamp: new Date()
      }
    ];

    // Create initial conversation
    act(() => {
      result.current.createNewConversation();
    });

    // Update messages with duplicates
    act(() => {
      result.current.updateMessages(messagesWithDuplicates, 'TEST_DUPLICATE_PREVENTION');
    });

    // Verify duplicates were removed
    const finalMessages = result.current.conversationState?.messages || [];
    expect(finalMessages).toHaveLength(2); // Should deduplicate to 2 messages
    
    const ids = finalMessages.map(msg => msg.id);
    expect(new Set(ids).size).toBe(2); // All IDs should be unique
  });

  it('should maintain message order during atomic updates', async () => {
    const { result } = renderHook(() => 
      useConversationPersistence({})
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const orderedMessages: Message[] = [
      {
        id: 'msg_1',
        type: 'user',
        content: 'First',
        timestamp: new Date(Date.now() - 3000)
      },
      {
        id: 'msg_2',
        type: 'ai',
        content: 'Second',
        timestamp: new Date(Date.now() - 2000)
      },
      {
        id: 'msg_3',
        type: 'user',
        content: 'Third',
        timestamp: new Date(Date.now() - 1000)
      }
    ];

    // Create conversation and add messages
    act(() => {
      result.current.createNewConversation();
    });

    act(() => {
      result.current.updateMessages(orderedMessages, 'ORDER_TEST');
    });

    // Verify order is maintained
    const finalMessages = result.current.conversationState?.messages || [];
    expect(finalMessages.map(msg => msg.id)).toEqual(['msg_1', 'msg_2', 'msg_3']);
  });
});