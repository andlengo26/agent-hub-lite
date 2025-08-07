/**
 * Widget DOM Cleaner Hook
 * Prevents and fixes stuck pointer-events styling
 */

import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

export interface DOMCleanerConfig {
  cleanupInterval: number;
  debugMode: boolean;
  targetSelectors: string[];
}

const DEFAULT_CONFIG: DOMCleanerConfig = {
  cleanupInterval: 2000,
  debugMode: process.env.NODE_ENV === 'development',
  targetSelectors: [
    '.widget-content',
    '.widget-nav', 
    '.chat-input',
    '.message-item',
    '.nav-tab',
    '[data-widget-section]',
    'span[id]' // Target specific span elements that get stuck
  ]
};

export function useWidgetDOMCleaner(
  config: Partial<DOMCleanerConfig> = {}
) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const cleanupTimer = useRef<NodeJS.Timeout>();
  const cleanupCount = useRef(0);

  const cleanStuckElements = useCallback(() => {
    try {
      let fixedCount = 0;

      fullConfig.targetSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const htmlElement = element as HTMLElement;
          
          // Check if element has stuck pointer-events
          if (htmlElement.style.pointerEvents === 'none' && 
              !htmlElement.hasAttribute('data-loading-blocked')) {
            
            htmlElement.style.pointerEvents = 'auto';
            htmlElement.removeAttribute('data-blocked-by-loading');
            fixedCount++;

            if (fullConfig.debugMode) {
              logger.debug('DOM_CLEANER_FIXED', {
                element: htmlElement.tagName,
                className: htmlElement.className,
                id: htmlElement.id,
                selector
              }, 'useWidgetDOMCleaner');
            }
          }
        });
      });

      if (fixedCount > 0) {
        cleanupCount.current += fixedCount;
        
        if (fullConfig.debugMode) {
          logger.debug('DOM_CLEANUP_COMPLETED', {
            elementsFixed: fixedCount,
            totalFixed: cleanupCount.current
          }, 'useWidgetDOMCleaner');
        }
      }

      return fixedCount;
    } catch (error) {
      if (fullConfig.debugMode) {
        logger.debug('DOM_CLEANUP_ERROR', { error }, 'useWidgetDOMCleaner');
      }
      return 0;
    }
  }, [fullConfig]);

  const forceCleanup = useCallback(() => {
    return cleanStuckElements();
  }, [cleanStuckElements]);

  // Periodic cleanup
  useEffect(() => {
    if (cleanupTimer.current) {
      clearInterval(cleanupTimer.current);
    }

    cleanupTimer.current = setInterval(() => {
      cleanStuckElements();
    }, fullConfig.cleanupInterval);

    return () => {
      if (cleanupTimer.current) {
        clearInterval(cleanupTimer.current);
      }
    };
  }, [cleanStuckElements, fullConfig.cleanupInterval]);

  // Initial cleanup on mount
  useEffect(() => {
    const initialCleanup = setTimeout(() => {
      cleanStuckElements();
    }, 100);

    return () => clearTimeout(initialCleanup);
  }, [cleanStuckElements]);

  return {
    forceCleanup,
    getCleanupStats: () => ({
      totalFixed: cleanupCount.current,
      lastRun: Date.now()
    })
  };
}