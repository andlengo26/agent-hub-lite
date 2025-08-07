/**
 * Interaction Protection Hook
 * Ensures interactive elements remain clickable and recovers from stuck states
 */

import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import { LoadingStateManager } from './useWidgetLoadingState';

export interface InteractionProtectionConfig {
  protectedSelectors: string[];
  recoveryInterval: number;
  debugMode: boolean;
}

const DEFAULT_CONFIG: InteractionProtectionConfig = {
  protectedSelectors: [
    'button:not([disabled])',
    '[role="button"]:not([disabled])',
    'a:not([disabled])',
    '[role="tab"]:not([disabled])',
    '[role="menuitem"]:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex="0"]:not([disabled])',
    '.clickable:not([disabled])'
  ],
  recoveryInterval: 2000,
  debugMode: process.env.NODE_ENV === 'development'
};

export function useInteractionProtection(
  loadingStateManager: LoadingStateManager,
  config: Partial<InteractionProtectionConfig> = {}
) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const recoveryIntervalRef = useRef<NodeJS.Timeout>();
  const lastRecoveryCheck = useRef<number>(0);

  const ensureInteractiveElements = useCallback(() => {
    const shouldBlock = loadingStateManager.shouldBlockInteractions();
    const elements = document.querySelectorAll(fullConfig.protectedSelectors.join(', '));
    
    let recoveredCount = 0;
    let blockedCount = 0;

    elements.forEach(element => {
      const htmlElement = element as HTMLElement;
      const currentStyle = window.getComputedStyle(htmlElement);
      const hasPointerEvents = currentStyle.pointerEvents !== 'none';
      
      if (shouldBlock) {
        // Apply blocking only to non-critical elements
        const isCritical = htmlElement.matches('button[aria-label*="minimize"], button[aria-label*="close"], [data-critical="true"]');
        
        if (!isCritical && hasPointerEvents) {
          htmlElement.style.pointerEvents = 'none';
          htmlElement.setAttribute('data-blocked-by-loading', 'true');
          blockedCount++;
        }
      } else {
        // Remove blocking and ensure interactions work
        const wasBlocked = htmlElement.hasAttribute('data-blocked-by-loading');
        
        if (!hasPointerEvents || wasBlocked) {
          htmlElement.style.pointerEvents = 'auto';
          htmlElement.removeAttribute('data-blocked-by-loading');
          recoveredCount++;
        }
      }
    });

    if (fullConfig.debugMode && (recoveredCount > 0 || blockedCount > 0)) {
      logger.debug('INTERACTION_PROTECTION', {
        shouldBlock,
        elementsRecovered: recoveredCount,
        elementsBlocked: blockedCount,
        totalElements: elements.length,
        activeOperations: loadingStateManager.activeOperations.length
      }, 'useInteractionProtection');
    }

    return { recoveredCount, blockedCount };
  }, [loadingStateManager, fullConfig]);

  const runRecoveryCheck = useCallback(() => {
    const now = Date.now();
    
    // Throttle recovery checks to prevent performance issues
    if (now - lastRecoveryCheck.current < 500) return;
    lastRecoveryCheck.current = now;

    try {
      const result = ensureInteractiveElements();
      
      // If we recovered elements, log for debugging
      if (result.recoveredCount > 0 && fullConfig.debugMode) {
        logger.debug('INTERACTION_RECOVERY', {
          recoveredElements: result.recoveredCount,
          timestamp: now,
          loadingOperations: loadingStateManager.activeOperations.map(op => ({
            id: op.id,
            type: op.type,
            blockInteractions: op.blockInteractions
          }))
        }, 'useInteractionProtection');
      }
    } catch (error) {
      logger.debug('INTERACTION_RECOVERY_ERROR', { error }, 'useInteractionProtection');
    }
  }, [ensureInteractiveElements, fullConfig.debugMode, loadingStateManager]);

  // Monitor loading state changes
  useEffect(() => {
    ensureInteractiveElements();
  }, [loadingStateManager.activeOperations, ensureInteractiveElements]);

  // Periodic recovery check
  useEffect(() => {
    if (recoveryIntervalRef.current) {
      clearInterval(recoveryIntervalRef.current);
    }

    recoveryIntervalRef.current = setInterval(runRecoveryCheck, fullConfig.recoveryInterval);

    return () => {
      if (recoveryIntervalRef.current) {
        clearInterval(recoveryIntervalRef.current);
      }
    };
  }, [runRecoveryCheck, fullConfig.recoveryInterval]);

  // Emergency recovery on unmount
  useEffect(() => {
    return () => {
      try {
        // Force recover all elements on unmount
        const elements = document.querySelectorAll('[data-blocked-by-loading="true"]');
        elements.forEach(element => {
          const htmlElement = element as HTMLElement;
          htmlElement.style.pointerEvents = 'auto';
          htmlElement.removeAttribute('data-blocked-by-loading');
        });
      } catch (error) {
        // Silent cleanup
      }
    };
  }, []);

  const forceRecovery = useCallback(() => {
    loadingStateManager.clearAllOperations();
    runRecoveryCheck();
  }, [loadingStateManager, runRecoveryCheck]);

  return {
    ensureInteractiveElements,
    runRecoveryCheck,
    forceRecovery
  };
}