/**
 * Loading Overlay Component
 * Provides visual feedback during loading states without blocking critical interactions
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { LoadingStateManager } from '@/hooks/widget/useWidgetLoadingState';

interface LoadingOverlayProps {
  loadingStateManager: LoadingStateManager;
  className?: string;
}

export function LoadingOverlay({ loadingStateManager, className = '' }: LoadingOverlayProps) {
  if (!loadingStateManager.hasBlockingOperation) {
    return null;
  }

  const highestPriorityOperation = loadingStateManager.activeOperations
    .filter(op => op.blockInteractions)
    .sort((a, b) => b.priority - a.priority)[0];

  if (!highestPriorityOperation) return null;

  const getLoadingMessage = (type: string) => {
    switch (type) {
      case 'settings':
        return 'Loading settings...';
      case 'conversation':
        return 'Loading conversation...';
      case 'message':
        return 'Sending message...';
      case 'identification':
        return 'Verifying identity...';
      case 'resource':
        return 'Loading resources...';
      case 'faq':
        return 'Loading FAQs...';
      case 'chat':
        return 'Connecting to chat...';
      case 'voice':
        return 'Initializing voice...';
      default:
        return 'Loading...';
    }
  };

  return (
    <div 
      className={`absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
      style={{ pointerEvents: 'all' }}
    >
      <div className="bg-card border rounded-lg p-6 shadow-lg max-w-xs text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-sm text-muted-foreground">
          {getLoadingMessage(highestPriorityOperation.type)}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-muted-foreground/60">
            Operations: {loadingStateManager.activeOperations.length}
          </div>
        )}
      </div>
    </div>
  );
}