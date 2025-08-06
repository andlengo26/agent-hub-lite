/**
 * Message Recovery Hook
 * Validates and recovers message state inconsistencies
 */

import { useCallback, useEffect } from 'react';
import { Message } from '@/types/message';
import { logger } from '@/lib/logger';

interface UseMessageRecoveryProps {
  messages: Message[];
  conversationPersistence: any;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
}

export function useMessageRecovery({
  messages,
  conversationPersistence,
  setMessages
}: UseMessageRecoveryProps) {
  
  // Validate message consistency and recover if needed
  const validateAndRecover = useCallback(() => {
    if (conversationPersistence.isLoading || !conversationPersistence.conversationState) {
      return;
    }

    const persistedMessages = conversationPersistence.conversationState.messages || [];
    const currentMessages = messages;

    // Check for message count mismatch
    if (persistedMessages.length !== currentMessages.length) {
      logger.raceCondition('MESSAGE_COUNT_MISMATCH_DETECTED', {
        persistedCount: persistedMessages.length,
        currentCount: currentMessages.length,
        difference: Math.abs(persistedMessages.length - currentMessages.length)
      }, 'useMessageRecovery');

      // Recovery strategy: Use persisted messages as source of truth
      if (persistedMessages.length > currentMessages.length) {
        logger.messagePersistence('RECOVERING_LOST_MESSAGES', {
          recovering: persistedMessages.length - currentMessages.length,
          from: currentMessages.length,
          to: persistedMessages.length
        }, 'useMessageRecovery');

        // Restore missing messages from persistence
        const restoredMessages = persistedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(restoredMessages);
        
        logger.messagePersistence('MESSAGE_RECOVERY_COMPLETE', {
          recoveredCount: persistedMessages.length,
          finalCount: restoredMessages.length
        }, 'useMessageRecovery');
      }
    }

    // Validate message IDs and content integrity
    const messageIdMismatches = currentMessages.filter((currentMsg, index) => {
      const persistedMsg = persistedMessages[index];
      return persistedMsg && currentMsg.id !== persistedMsg.id;
    });

    if (messageIdMismatches.length > 0) {
      logger.raceCondition('MESSAGE_ID_MISMATCH', {
        mismatchCount: messageIdMismatches.length,
        mismatches: messageIdMismatches.map(msg => ({
          currentId: msg.id,
          type: msg.type
        }))
      }, 'useMessageRecovery');
    }

  }, [messages, conversationPersistence, setMessages]);

  // Periodic validation (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(validateAndRecover, 5000);
    return () => clearInterval(interval);
  }, [validateAndRecover]);

  // Immediate validation on dependency changes
  useEffect(() => {
    validateAndRecover();
  }, [validateAndRecover]);

  // Force recovery function for manual use
  const forceRecovery = useCallback(() => {
    logger.messagePersistence('FORCE_RECOVERY_TRIGGERED', {
      currentMessageCount: messages.length,
      persistedMessageCount: conversationPersistence.conversationState?.messages?.length || 0
    }, 'useMessageRecovery');
    
    validateAndRecover();
  }, [validateAndRecover, messages.length, conversationPersistence.conversationState]);

  return {
    validateAndRecover,
    forceRecovery
  };
}