/**
 * Widget View Persistence Hook
 * Manages persistence of widget navigation state (panels, tabs, selections)
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

export type PanelType = 'main' | 'chat' | 'faq-detail' | 'resource-detail' | 'message-detail';
export type TabType = 'home' | 'messages' | 'resources';

export interface WidgetViewState {
  currentPanel: PanelType;
  activeTab: TabType;
  selectedFAQId?: string;
  selectedResourceId?: string;
  selectedChatId?: string;
  lastDetailPanel?: 'faq-detail' | 'resource-detail' | 'message-detail' | null;
  searchQuery?: string;
  timestamp: Date;
}

interface UseWidgetViewPersistenceProps {
  onStateLoaded?: (state: WidgetViewState | null) => void;
}

const STORAGE_KEY = 'widget_view_state';
const MAX_AGE_HOURS = 24;

export function useWidgetViewPersistence({ onStateLoaded }: UseWidgetViewPersistenceProps = {}) {
  const [viewState, setViewState] = useState<WidgetViewState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load view state from localStorage on initialization
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        
        // Convert timestamp back to Date object
        if (parsed.timestamp) {
          parsed.timestamp = new Date(parsed.timestamp);
          
          // Check if state is not too old
          const hoursSinceCreated = (Date.now() - parsed.timestamp.getTime()) / (1000 * 60 * 60);
          if (hoursSinceCreated < MAX_AGE_HOURS) {
            logger.debug('WIDGET_VIEW_LOADED', {
              panel: parsed.currentPanel,
              tab: parsed.activeTab,
              age: hoursSinceCreated
            }, 'useWidgetViewPersistence');
            
            setViewState(parsed);
            onStateLoaded?.(parsed);
          } else {
            logger.debug('WIDGET_VIEW_EXPIRED', {
              age: hoursSinceCreated,
              maxAge: MAX_AGE_HOURS
            }, 'useWidgetViewPersistence');
            
            localStorage.removeItem(STORAGE_KEY);
            onStateLoaded?.(null);
          }
        }
      } else {
        onStateLoaded?.(null);
      }
    } catch (error) {
      logger.error('WIDGET_VIEW_LOAD_ERROR', error, 'useWidgetViewPersistence');
      localStorage.removeItem(STORAGE_KEY);
      onStateLoaded?.(null);
    } finally {
      setIsLoading(false);
    }
  }, [onStateLoaded]);

  // Save view state to localStorage
  const saveViewState = useCallback((state: WidgetViewState) => {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
      setViewState(state);
      
      logger.debug('WIDGET_VIEW_SAVED', {
        panel: state.currentPanel,
        tab: state.activeTab,
        selectedIds: {
          faq: state.selectedFAQId,
          resource: state.selectedResourceId,
          chat: state.selectedChatId
        }
      }, 'useWidgetViewPersistence');
    } catch (error) {
      logger.error('WIDGET_VIEW_SAVE_ERROR', error, 'useWidgetViewPersistence');
    }
  }, []);

  // Update view state with partial updates
  const updateViewState = useCallback((updates: Partial<Omit<WidgetViewState, 'timestamp'>>) => {
    const newState: WidgetViewState = {
      currentPanel: 'main',
      activeTab: 'home',
      ...viewState,
      ...updates,
      timestamp: new Date()
    };
    
    saveViewState(newState);
  }, [viewState, saveViewState]);

  // Create new view state
  const createViewState = useCallback((initialState?: Partial<WidgetViewState>) => {
    const newState: WidgetViewState = {
      currentPanel: 'main',
      activeTab: 'home',
      ...initialState,
      timestamp: new Date()
    };
    
    saveViewState(newState);
    return newState;
  }, [saveViewState]);

  // Clear view state
  const clearViewState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setViewState(null);
      
      logger.debug('WIDGET_VIEW_CLEARED', {}, 'useWidgetViewPersistence');
    } catch (error) {
      logger.error('WIDGET_VIEW_CLEAR_ERROR', error, 'useWidgetViewPersistence');
    }
  }, []);

  // Navigation tracking helpers
  const trackPanelChange = useCallback((panel: PanelType, additionalState?: Partial<WidgetViewState>) => {
    updateViewState({
      currentPanel: panel,
      ...additionalState
    });
  }, [updateViewState]);

  const trackTabChange = useCallback((tab: TabType) => {
    updateViewState({
      activeTab: tab
    });
  }, [updateViewState]);

  const trackSelection = useCallback((type: 'faq' | 'resource' | 'chat', id: string, panel?: PanelType) => {
    const updates: Partial<WidgetViewState> = {};
    
    if (type === 'faq') {
      updates.selectedFAQId = id;
      updates.lastDetailPanel = 'faq-detail';
      if (panel) updates.currentPanel = panel;
    } else if (type === 'resource') {
      updates.selectedResourceId = id;
      updates.lastDetailPanel = 'resource-detail';
      if (panel) updates.currentPanel = panel;
    } else if (type === 'chat') {
      updates.selectedChatId = id;
      updates.lastDetailPanel = 'message-detail';
      if (panel) updates.currentPanel = panel;
    }
    
    updateViewState(updates);
  }, [updateViewState]);

  const trackSearchChange = useCallback((query: string) => {
    updateViewState({
      searchQuery: query
    });
  }, [updateViewState]);

  // Validation helpers for restored state
  const validateRestoredState = useCallback((
    state: WidgetViewState,
    availableData: {
      faqs?: Array<{ id: string }>;
      resources?: Array<{ id: string }>;
      chats?: Array<{ id: string }>;
    }
  ): WidgetViewState | null => {
    const { faqs = [], resources = [], chats = [] } = availableData;
    
    // Validate selected items exist
    if (state.selectedFAQId && !faqs.find(f => f.id === state.selectedFAQId)) {
      logger.debug('WIDGET_VIEW_INVALID_FAQ', {
        selectedId: state.selectedFAQId,
        availableIds: faqs.map(f => f.id)
      }, 'useWidgetViewPersistence');
      return null;
    }
    
    if (state.selectedResourceId && !resources.find(r => r.id === state.selectedResourceId)) {
      logger.debug('WIDGET_VIEW_INVALID_RESOURCE', {
        selectedId: state.selectedResourceId,
        availableIds: resources.map(r => r.id)
      }, 'useWidgetViewPersistence');
      return null;
    }
    
    if (state.selectedChatId && !chats.find(c => c.id === state.selectedChatId)) {
      logger.debug('WIDGET_VIEW_INVALID_CHAT', {
        selectedId: state.selectedChatId,
        availableIds: chats.map(c => c.id)
      }, 'useWidgetViewPersistence');
      return null;
    }
    
    // Validate panel consistency
    if (state.currentPanel === 'faq-detail' && !state.selectedFAQId) {
      return { ...state, currentPanel: 'main' };
    }
    
    if (state.currentPanel === 'resource-detail' && !state.selectedResourceId) {
      return { ...state, currentPanel: 'main' };
    }
    
    if (state.currentPanel === 'message-detail' && !state.selectedChatId) {
      return { ...state, currentPanel: 'main', activeTab: 'messages' };
    }
    
    return state;
  }, []);

  return {
    viewState,
    isLoading,
    saveViewState,
    updateViewState,
    createViewState,
    clearViewState,
    trackPanelChange,
    trackTabChange,
    trackSelection,
    trackSearchChange,
    validateRestoredState
  };
}