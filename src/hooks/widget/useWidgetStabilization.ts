/**
 * Widget Stabilization Hook
 * Provides emergency recovery and stability features
 */

import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import { LoadingStateManager } from './useWidgetLoadingState';

export interface StabilizationConfig {
  maxContinuousOperations: number;
  operationTimeoutMs: number;
  emergencyRecoveryInterval: number;
  debugMode: boolean;
}

const DEFAULT_CONFIG: StabilizationConfig = {
  maxContinuousOperations: 10,
  operationTimeoutMs: 5000,
  emergencyRecoveryInterval: 10000,
  debugMode: process.env.NODE_ENV === 'development'
};

export function useWidgetStabilization(
  loadingStateManager: LoadingStateManager,
  config: Partial<StabilizationConfig> = {}
) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const operationCounts = useRef<Map<string, number>>(new Map());
  const lastRecovery = useRef<number>(0);
  const emergencyTimer = useRef<NodeJS.Timeout>();

  const checkForStuckOperations = useCallback(() => {
    const now = Date.now();
    const activeOps = loadingStateManager.activeOperations;
    
    // Check for operations that have been active too long
    const stuckOperations = activeOps.filter(op => {
      const count = operationCounts.current.get(op.id) || 0;
      return count > fullConfig.maxContinuousOperations;
    });

    if (stuckOperations.length > 0) {
      if (fullConfig.debugMode) {
        logger.debug('STUCK_OPERATIONS_DETECTED', {
          stuckCount: stuckOperations.length,
          operations: stuckOperations.map(op => ({
            id: op.id,
            type: op.type,
            count: operationCounts.current.get(op.id)
          }))
        }, 'useWidgetStabilization');
      }

      // Force remove stuck operations
      stuckOperations.forEach(op => {
        loadingStateManager.removeOperation(op.id);
        operationCounts.current.delete(op.id);
      });

      return true;
    }

    return false;
  }, [loadingStateManager, fullConfig]);

  const emergencyRecovery = useCallback(() => {
    const now = Date.now();
    
    // Throttle emergency recovery
    if (now - lastRecovery.current < fullConfig.emergencyRecoveryInterval) {
      return;
    }

    lastRecovery.current = now;

    if (fullConfig.debugMode) {
      logger.debug('EMERGENCY_RECOVERY_TRIGGERED', {
        activeOperations: loadingStateManager.activeOperations.length,
        timestamp: now
      }, 'useWidgetStabilization');
    }

    // Clear all operations
    loadingStateManager.clearAllOperations();
    
    // Reset counters
    operationCounts.current.clear();

    // Enhanced force re-enable of interactive elements
    try {
      const blockedElements = document.querySelectorAll('[data-blocked-by-loading="true"], [style*="pointer-events: none"]');
      blockedElements.forEach(element => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.pointerEvents = 'auto';
        htmlElement.removeAttribute('data-blocked-by-loading');
      });

      // Specifically target widget content areas
      const widgetElements = document.querySelectorAll('.widget-content, .widget-nav, .chat-input, .message-item, .nav-tab');
      widgetElements.forEach(element => {
        const htmlElement = element as HTMLElement;
        if (htmlElement.style.pointerEvents === 'none') {
          htmlElement.style.pointerEvents = 'auto';
          htmlElement.removeAttribute('data-blocked-by-loading');
        }
      });
    } catch (error) {
      // Silent recovery
    }

    return true;
  }, [loadingStateManager, fullConfig]);

  // Track operation counts
  useEffect(() => {
    loadingStateManager.activeOperations.forEach(op => {
      const currentCount = operationCounts.current.get(op.id) || 0;
      operationCounts.current.set(op.id, currentCount + 1);
    });

    // Clean up counters for removed operations
    const activeIds = new Set(loadingStateManager.activeOperations.map(op => op.id));
    for (const [id] of operationCounts.current) {
      if (!activeIds.has(id)) {
        operationCounts.current.delete(id);
      }
    }
  }, [loadingStateManager.activeOperations]);

  // Periodic stability check
  useEffect(() => {
    if (emergencyTimer.current) {
      clearInterval(emergencyTimer.current);
    }

    emergencyTimer.current = setInterval(() => {
      checkForStuckOperations();
    }, fullConfig.emergencyRecoveryInterval);

    return () => {
      if (emergencyTimer.current) {
        clearInterval(emergencyTimer.current);
      }
    };
  }, [checkForStuckOperations, fullConfig.emergencyRecoveryInterval]);

  // Global error recovery
  useEffect(() => {
    const handleGlobalError = () => {
      if (loadingStateManager.activeOperations.length > 0) {
        emergencyRecovery();
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleGlobalError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, [emergencyRecovery, loadingStateManager]);

  return {
    emergencyRecovery,
    checkForStuckOperations,
    getOperationCounts: () => Object.fromEntries(operationCounts.current)
  };
}