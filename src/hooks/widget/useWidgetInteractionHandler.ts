/**
 * Widget Interaction Handler Hook
 * Manages click events and prevents interaction conflicts
 */

import { useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import { LoadingStateManager } from './useWidgetLoadingState';

export interface InteractionEvent {
  type: 'click' | 'focus' | 'hover';
  target: HTMLElement;
  timestamp: number;
  blocked: boolean;
}

export function useWidgetInteractionHandler(
  loadingStateManager: LoadingStateManager,
  debugMode = process.env.NODE_ENV === 'development'
) {
  const lastInteraction = useRef<InteractionEvent | null>(null);
  const interactionCount = useRef(0);

  const handleInteraction = useCallback((
    event: React.MouseEvent | React.FocusEvent, 
    interactionType: 'click' | 'focus' | 'hover' = 'click'
  ) => {
    const target = event.target as HTMLElement;
    const now = Date.now();
    const shouldBlock = loadingStateManager.shouldBlockInteractions();
    
    // Enhanced critical element detection
    const isCritical = target.matches(`
      button[aria-label*="minimize"], 
      button[aria-label*="close"], 
      [data-critical="true"],
      .widget-header,
      .close-button,
      .minimize-button,
      .widget-content,
      .widget-nav,
      .chat-input,
      .message-item,
      .nav-tab
    `.replace(/\s+/g, ' ').trim()) || target.closest('.widget-content, .widget-nav');

    // Force recovery if elements are stuck with pointer-events: none
    if (target.style.pointerEvents === 'none' && !shouldBlock) {
      target.style.pointerEvents = 'auto';
      target.removeAttribute('data-blocked-by-loading');
      
      if (debugMode) {
        logger.debug('FORCE_RECOVERED_ELEMENT', {
          element: target.tagName,
          className: target.className,
          id: target.id
        }, 'useWidgetInteractionHandler');
      }
    }

    if (shouldBlock && !isCritical) {
      event.preventDefault();
      event.stopPropagation();
      
      if (debugMode) {
        logger.debug('INTERACTION_BLOCKED', {
          type: interactionType,
          targetElement: target.tagName,
          targetClass: target.className,
          activeOperations: loadingStateManager.activeOperations.length,
          isCritical
        }, 'useWidgetInteractionHandler');
      }
      
      return false;
    }

    // Log interaction for debugging
    const interaction: InteractionEvent = {
      type: interactionType,
      target,
      timestamp: now,
      blocked: shouldBlock && !isCritical
    };
    
    lastInteraction.current = interaction;
    interactionCount.current++;

    if (debugMode && interactionCount.current % 10 === 0) {
      logger.debug('INTERACTION_STATS', {
        totalInteractions: interactionCount.current,
        lastInteraction: {
          type: interaction.type,
          element: target.tagName,
          blocked: interaction.blocked
        },
        loadingOperations: loadingStateManager.activeOperations.length
      }, 'useWidgetInteractionHandler');
    }

    return true;
  }, [loadingStateManager, debugMode]);

  const getInteractionStats = useCallback(() => {
    return {
      totalInteractions: interactionCount.current,
      lastInteraction: lastInteraction.current,
      activeOperations: loadingStateManager.activeOperations.length
    };
  }, [loadingStateManager]);

  return {
    handleInteraction,
    getInteractionStats
  };
}