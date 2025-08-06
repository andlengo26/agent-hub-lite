/**
 * Enhanced Message Recovery Hook
 * Provides robust validation and recovery with debouncing and detailed logging
 */

import { useCallback, useEffect, useRef } from 'react';
import { Message } from '@/types/message';
import { logger } from '@/lib/logger';

interface UseMessageRecoveryEnhancedProps {
  messages: Message[];
  conversationPersistence: any;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
}

export function useMessageRecoveryEnhanced({
  messages,
  conversationPersistence,
  setMessages
}: UseMessageRecoveryEnhancedProps) {
  
  const lastValidationTimeRef = useRef<number>(0);
  const recoveryInProgressRef = useRef<boolean>(false);
  const DEBOUNCE_DELAY = 3000; // 3 seconds debounce to prevent excessive validation
  
  // Enhanced validation with comprehensive checks
  const validateAndRecover = useCallback(() => {
    const now = Date.now();
    
    // Debounce validation calls to prevent race conditions
    if (now - lastValidationTimeRef.current < DEBOUNCE_DELAY) {
      logger.messagePersistence('VALIDATION_DEBOUNCED', {
        timeSinceLastValidation: now - lastValidationTimeRef.current,
        debounceDelay: DEBOUNCE_DELAY
      }, 'useMessageRecoveryEnhanced');
      return;
    }
    
    if (conversationPersistence.isLoading || !conversationPersistence.conversationState || recoveryInProgressRef.current) {
      return;
    }
    
    lastValidationTimeRef.current = now;
    
    const persistedMessages = conversationPersistence.conversationState.messages || [];
    const currentMessages = messages;
    
    logger.messagePersistence('VALIDATION_START', {
      persistedCount: persistedMessages.length,
      currentCount: currentMessages.length,
      persistedTypes: persistedMessages.map(m => m.type),
      currentTypes: currentMessages.map(m => m.type)
    }, 'useMessageRecoveryEnhanced');
    
    // Check for message count mismatch
    if (persistedMessages.length !== currentMessages.length) {
      logger.raceCondition('MESSAGE_COUNT_MISMATCH_DETECTED', {
        persistedCount: persistedMessages.length,
        currentCount: currentMessages.length,
        difference: Math.abs(persistedMessages.length - currentMessages.length)
      }, 'useMessageRecoveryEnhanced');

      // Only recover if persisted has more messages (prevent data loss)
      if (persistedMessages.length > currentMessages.length) {
        recoveryInProgressRef.current = true;
        
        logger.messagePersistence('RECOVERING_LOST_MESSAGES', {
          recovering: persistedMessages.length - currentMessages.length,
          from: currentMessages.length,
          to: persistedMessages.length
        }, 'useMessageRecoveryEnhanced');

        // Restore missing messages from persistence with enhanced validation
        const restoredMessages = persistedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        // Validate restored messages integrity
        const duplicateIds = new Set();
        const uniqueIds = new Set();
        restoredMessages.forEach(msg => {
          if (uniqueIds.has(msg.id)) {
            duplicateIds.add(msg.id);
          }
          uniqueIds.add(msg.id);
        });
        
        if (duplicateIds.size > 0) {
          logger.raceCondition('DUPLICATE_IDS_IN_RECOVERY', {
            duplicateIds: Array.from(duplicateIds)
          }, 'useMessageRecoveryEnhanced');
        }
        
        setMessages(restoredMessages);
        
        logger.messagePersistence('MESSAGE_RECOVERY_COMPLETE', {
          recoveredCount: persistedMessages.length,
          finalCount: restoredMessages.length,
          hasDuplicates: duplicateIds.size > 0
        }, 'useMessageRecoveryEnhanced');
        
        // Clear recovery flag after a delay to allow state to settle
        setTimeout(() => {
          recoveryInProgressRef.current = false;
        }, 1000);
      } else {
        logger.messagePersistence('RECOVERY_SKIPPED_CURRENT_HAS_MORE', {
          persistedCount: persistedMessages.length,
          currentCount: currentMessages.length
        }, 'useMessageRecoveryEnhanced');
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
      }, 'useMessageRecoveryEnhanced');
    }
    
    // Validate message type consistency
    const typeInconsistencies = currentMessages.filter((currentMsg, index) => {
      const persistedMsg = persistedMessages[index];
      return persistedMsg && currentMsg.type !== persistedMsg.type;
    });
    
    if (typeInconsistencies.length > 0) {
      logger.raceCondition('MESSAGE_TYPE_INCONSISTENCY', {
        inconsistencyCount: typeInconsistencies.length,
        inconsistencies: typeInconsistencies.map((msg, index) => ({
          currentType: msg.type,
          persistedType: persistedMessages[index]?.type
        }))
      }, 'useMessageRecoveryEnhanced');
    }
    
    logger.messagePersistence('VALIDATION_COMPLETE', {
      result: 'success',
      issues: {
        countMismatch: persistedMessages.length !== currentMessages.length,
        idMismatches: messageIdMismatches.length,
        typeInconsistencies: typeInconsistencies.length
      }
    }, 'useMessageRecoveryEnhanced');

  }, [messages, conversationPersistence, setMessages]);

  // Periodic validation with longer interval to reduce overhead
  useEffect(() => {
    const interval = setInterval(validateAndRecover, 10000); // 10 seconds instead of 5
    return () => clearInterval(interval);
  }, [validateAndRecover]);

  // Immediate validation on dependency changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(validateAndRecover, 1000); // 1 second delay
    return () => clearTimeout(timeoutId);
  }, [validateAndRecover]);

  // Force recovery function for manual use
  const forceRecovery = useCallback(() => {
    logger.messagePersistence('FORCE_RECOVERY_TRIGGERED', {
      currentMessageCount: messages.length,
      persistedMessageCount: conversationPersistence.conversationState?.messages?.length || 0
    }, 'useMessageRecoveryEnhanced');
    
    // Reset debounce timer for force recovery
    lastValidationTimeRef.current = 0;
    recoveryInProgressRef.current = false;
    validateAndRecover();
  }, [validateAndRecover, messages.length, conversationPersistence.conversationState]);

  return {
    validateAndRecover,
    forceRecovery,
    isRecoveryInProgress: recoveryInProgressRef.current
  };
}