import { renderHook, act } from '@testing-library/react';
import { useConversationLifecycle } from '../useConversationLifecycle';
import { chatSessionService } from '@/services/chatSessionService';

// Minimal settings mock
const settingsMock: any = {
  aiSettings: {
    enableIdleTimeout: false,
    enableMaxSessionLength: false,
    enableMessageQuota: false,
    idleTimeout: 10,
    maxSessionMinutes: 30,
    maxMessagesPerSession: 3,
  },
};

// Silence toasts
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));

// Silence external logging
jest.mock('@/services/conversationService', () => ({
  conversationService: { logTransition: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('@/services/summaryService', () => ({
  summaryService: { generateConversationSummary: jest.fn().mockResolvedValue(null) },
}));

describe('useConversationLifecycle - chat session integration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('creates, updates, and terminates chat sessions through the service', async () => {
    const createSpy = jest.spyOn(chatSessionService, 'createSession');
    const updateSpy = jest.spyOn(chatSessionService, 'updateActivity');
    const terminateSpy = jest.spyOn(chatSessionService, 'terminateSession');

    const { result } = renderHook(() => useConversationLifecycle(settingsMock));

    // initialize conversation
    act(() => {
      result.current.initializeConversation();
    });

    expect(createSpy).toHaveBeenCalledTimes(1);

    // increment messages should update activity
    act(() => {
      result.current.incrementMessageCount();
    });

    expect(updateSpy).toHaveBeenCalledTimes(1);

    // end conversation should terminate session
    await act(async () => {
      await result.current.endConversation('test end');
    });

    expect(terminateSpy).toHaveBeenCalledTimes(1);
  });
});
