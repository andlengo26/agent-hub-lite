/**
 * Unified Widget Loading State Management
 * Coordinates all loading states to prevent pointer-events conflicts
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/lib/logger';

export interface LoadingOperation {
  id: string;
  type: 'settings' | 'conversation' | 'message' | 'identification' | 'resource' | 'faq' | 'chat' | 'voice';
  priority: number; // Higher priority blocks interactions
  blockInteractions: boolean;
}

export interface LoadingStateManager {
  isLoading: boolean;
  hasBlockingOperation: boolean;
  activeOperations: LoadingOperation[];
  addOperation: (operation: LoadingOperation) => void;
  removeOperation: (id: string) => void;
  clearAllOperations: () => void;
  getOperationsByType: (type: string) => LoadingOperation[];
  shouldBlockInteractions: () => boolean;
}

export function useWidgetLoadingState(): LoadingStateManager {
  const [activeOperations, setActiveOperations] = useState<LoadingOperation[]>([]);
  const operationsRef = useRef<LoadingOperation[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Sync ref with state
  useEffect(() => {
    operationsRef.current = activeOperations;
  }, [activeOperations]);

  const addOperation = useCallback((operation: LoadingOperation) => {
    logger.debug('LOADING_STATE_ADD', { operation }, 'useWidgetLoadingState');
    
    setActiveOperations(prev => {
      const existing = prev.find(op => op.id === operation.id);
      if (existing) {
        // Update existing operation
        return prev.map(op => op.id === operation.id ? operation : op);
      }
      // Add new operation
      return [...prev, operation];
    });

    // Auto-remove operation after 30 seconds to prevent stuck states
    const timeout = setTimeout(() => {
      logger.debug('LOADING_STATE_TIMEOUT', { operationId: operation.id }, 'useWidgetLoadingState');
      removeOperation(operation.id);
    }, 30000);

    timeoutRefs.current.set(operation.id, timeout);
  }, []);

  const removeOperation = useCallback((id: string) => {
    logger.debug('LOADING_STATE_REMOVE', { operationId: id }, 'useWidgetLoadingState');
    
    setActiveOperations(prev => prev.filter(op => op.id !== id));
    
    // Clear timeout
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
  }, []);

  const clearAllOperations = useCallback(() => {
    logger.debug('LOADING_STATE_CLEAR_ALL', { 
      clearedCount: operationsRef.current.length 
    }, 'useWidgetLoadingState');
    
    setActiveOperations([]);
    
    // Clear all timeouts
    for (const timeout of timeoutRefs.current.values()) {
      clearTimeout(timeout);
    }
    timeoutRefs.current.clear();
  }, []);

  const getOperationsByType = useCallback((type: string) => {
    return operationsRef.current.filter(op => op.type === type);
  }, []);

  const shouldBlockInteractions = useCallback(() => {
    return operationsRef.current.some(op => op.blockInteractions);
  }, []);

  const isLoading = activeOperations.length > 0;
  const hasBlockingOperation = activeOperations.some(op => op.blockInteractions);

  return {
    isLoading,
    hasBlockingOperation,
    activeOperations,
    addOperation,
    removeOperation,
    clearAllOperations,
    getOperationsByType,
    shouldBlockInteractions
  };
}