/**
 * Enhanced Message Recovery Hook
 * Provides robust validation and recovery with bidirectional sync and fingerprinting
 */

import { useCallback, useEffect, useRef } from 'react';
import { Message } from '@/types/message';
import { logger } from '@/lib/logger';

// Enhanced message with fingerprint for integrity checking
interface MessageWithFingerprint {
  id: string;
  type: 'user' | 'ai' | 'identification';
  timestamp: Date;
  fingerprint?: string;
  content?: string;
  isCompleted?: boolean;
  isPending?: boolean;
  feedbackSubmitted?: boolean;
}

interface UseMessageRecoveryEnhancedProps {
  messages: Message[];
  conversationPersistence: any;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  debugMode?: boolean;
}

export function useMessageRecoveryEnhanced({
  messages,
  conversationPersistence,
  setMessages,
  debugMode = false
}: UseMessageRecoveryEnhancedProps) {
  
  const lastValidationTimeRef = useRef<number>(0);
  const recoveryInProgressRef = useRef<boolean>(false);
  const recoveryMetricsRef = useRef({ recoveries: 0, skips: 0, conflicts: 0 });
  const DEBOUNCE_DELAY = 3000; // 3 seconds debounce to prevent excessive validation
  
  // Generate message fingerprint for content integrity
  const generateFingerprint = useCallback((message: Message): string => {
    const content = message.type === 'identification' ? 'identification' : (message as any).content || '';
    const timestamp = message.timestamp.getTime();
    return btoa(`${message.id}:${content}:${timestamp}`).substring(0, 16);
  }, []);
  
  // Smart merge function that resolves conflicts using fingerprints
  const smartMergeMessages = useCallback((
    currentMessages: Message[], 
    persistedMessages: Message[]
  ): { mergedMessages: Message[]; hasConflicts: boolean } => {
    const currentMap = new Map<string, MessageWithFingerprint>();
    const persistedMap = new Map<string, MessageWithFingerprint>();
    
    // Add fingerprints and create maps
    currentMessages.forEach(msg => {
      const withFingerprint = { ...msg, fingerprint: generateFingerprint(msg) };
      currentMap.set(msg.id, withFingerprint);
    });
    
    persistedMessages.forEach(msg => {
      const withFingerprint = { ...msg, fingerprint: generateFingerprint(msg) };
      persistedMap.set(msg.id, withFingerprint);
    });
    
    const mergedMap = new Map<string, MessageWithFingerprint>();
    let hasConflicts = false;
    
    // Process all unique message IDs
    const allIds = new Set([...currentMap.keys(), ...persistedMap.keys()]);
    
    for (const id of allIds) {
      const current = currentMap.get(id);
      const persisted = persistedMap.get(id);
      
      if (current && persisted) {
        // Both exist - check for conflicts
        if (current.fingerprint !== persisted.fingerprint) {
          hasConflicts = true;
          // Resolve conflict by timestamp (newer wins)
          const winner = current.timestamp > persisted.timestamp ? current : persisted;
          mergedMap.set(id, winner);
          
          logger.raceCondition('MESSAGE_CONFLICT_RESOLVED', {
            messageId: id,
            winner: winner === current ? 'current' : 'persisted',
            currentFingerprint: current.fingerprint,
            persistedFingerprint: persisted.fingerprint
          }, 'useMessageRecoveryEnhanced');
        } else {
          // No conflict - use current
          mergedMap.set(id, current);
        }
      } else if (current) {
        // Only in current
        mergedMap.set(id, current);
      } else if (persisted) {
        // Only in persisted
        mergedMap.set(id, persisted);
      }
    }
    
    // Sort by timestamp to maintain order
    const mergedMessages = Array.from(mergedMap.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(({ fingerprint, ...msg }) => msg as Message); // Remove fingerprint from final result
    
    return { mergedMessages, hasConflicts };
  }, [generateFingerprint]);
  
  // Enhanced bidirectional sync with smart merge
  const validateAndRecover = useCallback(() => {
    const now = Date.now();
    
    // Debounce validation calls to prevent race conditions
    if (now - lastValidationTimeRef.current < DEBOUNCE_DELAY) {
      if (debugMode) {
        logger.messagePersistence('VALIDATION_DEBOUNCED', {
          timeSinceLastValidation: now - lastValidationTimeRef.current,
          debounceDelay: DEBOUNCE_DELAY
        }, 'useMessageRecoveryEnhanced');
      }
      return;
    }
    
    if (conversationPersistence.isLoading || !conversationPersistence.conversationState || recoveryInProgressRef.current) {
      return;
    }
    
    lastValidationTimeRef.current = now;
    
    const persistedMessages = conversationPersistence.conversationState.messages || [];
    const currentMessages = messages;
    
    // Only log start for significant mismatches to reduce noise
    const shouldLogDetails = Math.abs(persistedMessages.length - currentMessages.length) > 0;
    
    if (shouldLogDetails) {
      logger.messagePersistence('VALIDATION_START', {
        persistedCount: persistedMessages.length,
        currentCount: currentMessages.length,
        persistedTypes: persistedMessages.map(m => m.type),
        currentTypes: currentMessages.map(m => m.type)
      }, 'useMessageRecoveryEnhanced');
    }
    
    // Check for message count mismatch - refined logging
    if (persistedMessages.length !== currentMessages.length) {
      const difference = persistedMessages.length - currentMessages.length;
      
      // Only warn about potential data loss scenarios
      if (persistedMessages.length > currentMessages.length) {
        logger.raceCondition('POTENTIAL_DATA_LOSS_DETECTED', {
          persistedCount: persistedMessages.length,
          currentCount: currentMessages.length,
          lostMessages: difference
        }, 'useMessageRecoveryEnhanced');
        
        recoveryInProgressRef.current = true;
        recoveryMetricsRef.current.recoveries++;
        
        // Smart merge with conflict resolution
        const { mergedMessages, hasConflicts } = smartMergeMessages(currentMessages, persistedMessages);
        
        if (hasConflicts) {
          recoveryMetricsRef.current.conflicts++;
        }
        
        logger.messagePersistence('SMART_MERGE_RECOVERY', {
          recovering: difference,
          finalCount: mergedMessages.length,
          hasConflicts,
          recoveryMetrics: recoveryMetricsRef.current
        }, 'useMessageRecoveryEnhanced');
        
        // Update both stores atomically
        setMessages(mergedMessages);
        conversationPersistence.updateMessages(mergedMessages, 'SMART_MERGE_RECOVERY');
        
        // Clear recovery flag after state settles
        setTimeout(() => {
          recoveryInProgressRef.current = false;
        }, 1000);
      } else {
        // Current has more - lower log level (benign mismatch)
        recoveryMetricsRef.current.skips++;
        
        if (debugMode) {
          logger.messagePersistence('CURRENT_AHEAD_SYNC_PERSISTENCE', {
            persistedCount: persistedMessages.length,
            currentCount: currentMessages.length,
            extraMessages: -difference,
            recoveryMetrics: recoveryMetricsRef.current
          }, 'useMessageRecoveryEnhanced');
        }
        
        // Sync persistence to match current state
        conversationPersistence.updateMessages(currentMessages, 'SYNC_TO_CURRENT');
      }
    } else if (currentMessages.length > 0) {
      // Same count but validate content integrity with fingerprints
      const { mergedMessages, hasConflicts } = smartMergeMessages(currentMessages, persistedMessages);
      
      if (hasConflicts) {
        recoveryMetricsRef.current.conflicts++;
        
        logger.raceCondition('CONTENT_CONFLICTS_RESOLVED', {
          messageCount: mergedMessages.length,
          conflictCount: recoveryMetricsRef.current.conflicts
        }, 'useMessageRecoveryEnhanced');
        
        // Update both stores with resolved conflicts
        setMessages(mergedMessages);
        conversationPersistence.updateMessages(mergedMessages, 'CONFLICT_RESOLUTION');
      }
    }
    
    if (shouldLogDetails) {
      logger.messagePersistence('VALIDATION_COMPLETE', {
        result: 'success',
        finalCounts: {
          current: currentMessages.length,
          persisted: persistedMessages.length
        },
        metrics: recoveryMetricsRef.current
      }, 'useMessageRecoveryEnhanced');
    }

  }, [messages, conversationPersistence, setMessages, smartMergeMessages, debugMode]);

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

  // User-facing emergency functions
  const syncConversation = useCallback(() => {
    logger.messagePersistence('MANUAL_SYNC_TRIGGERED', {
      currentMessageCount: messages.length,
      persistedMessageCount: conversationPersistence.conversationState?.messages?.length || 0,
      metrics: recoveryMetricsRef.current
    }, 'useMessageRecoveryEnhanced');
    
    // Reset debounce timer for manual sync
    lastValidationTimeRef.current = 0;
    recoveryInProgressRef.current = false;
    validateAndRecover();
  }, [validateAndRecover, messages.length, conversationPersistence.conversationState]);
  
  const emergencyReset = useCallback(() => {
    logger.messagePersistence('EMERGENCY_RESET_TRIGGERED', {
      currentMessageCount: messages.length,
      persistedMessageCount: conversationPersistence.conversationState?.messages?.length || 0
    }, 'useMessageRecoveryEnhanced');
    
    // Clear all conversation data and reinitialize
    conversationPersistence.clearConversation();
    setMessages([]);
    
    // Reset recovery state
    lastValidationTimeRef.current = 0;
    recoveryInProgressRef.current = false;
    recoveryMetricsRef.current = { recoveries: 0, skips: 0, conflicts: 0 };
  }, [conversationPersistence, setMessages]);
  
  // Conversation corruption detection
  const detectCorruption = useCallback((): boolean => {
    if (!conversationPersistence.conversationState) return false;
    
    const persistedMessages = conversationPersistence.conversationState.messages || [];
    const currentMessages = messages;
    
    // Check for severe corruption indicators
    const severeMismatch = Math.abs(persistedMessages.length - currentMessages.length) > 5;
    const hasNullMessages = [...persistedMessages, ...currentMessages].some(msg => !msg || !msg.id);
    const hasDuplicateIds = new Set([...persistedMessages, ...currentMessages].map(msg => msg?.id)).size < 
      (persistedMessages.length + currentMessages.length);
    
    return severeMismatch || hasNullMessages || hasDuplicateIds;
  }, [messages, conversationPersistence.conversationState]);

  return {
    validateAndRecover,
    syncConversation, // Manual sync function (debug mode)
    emergencyReset, // Clear all data and restart
    detectCorruption, // Check for data corruption
    isRecoveryInProgress: recoveryInProgressRef.current,
    recoveryMetrics: recoveryMetricsRef.current,
    debugMode
  };
}