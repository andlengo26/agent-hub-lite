/**
 * Hook for managing AI conversation lifecycle states and transitions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WidgetSettings } from './useWidgetSettings';
import { conversationService, ConversationTransition } from '@/services/conversationService';

export interface ConversationState {
  status: 'active' | 'ended' | 'waiting_human' | 'idle_timeout' | 'max_session' | 'quota_exceeded';
  messageCount: number;
  sessionStartTime: Date;
  lastActivityTime: Date;
  idleTimeoutId?: NodeJS.Timeout;
  sessionTimeoutId?: NodeJS.Timeout;
}

export interface ConversationTransitionLocal {
  from: ConversationState['status'];
  to: ConversationState['status'];
  timestamp: Date;
  reason: string;
  triggeredBy: 'user' | 'system' | 'ai';
}

export function useConversationLifecycle(settings: WidgetSettings | null) {
  const [conversationState, setConversationState] = useState<ConversationState>({
    status: 'active',
    messageCount: 0,
    sessionStartTime: new Date(),
    lastActivityTime: new Date()
  });
  
  const [transitions, setTransitions] = useState<ConversationTransitionLocal[]>([]);
  const conversationIdRef = useRef(`conv_${Date.now()}`);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const { toast } = useToast();
  
  const timeoutRefs = useRef<{
    idle?: NodeJS.Timeout;
    session?: NodeJS.Timeout;
  }>({});

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRefs.current.idle) clearTimeout(timeoutRefs.current.idle);
      if (timeoutRefs.current.session) clearTimeout(timeoutRefs.current.session);
    };
  }, []);

  const logTransition = useCallback(async (
    from: ConversationState['status'],
    to: ConversationState['status'],
    reason: string,
    triggeredBy: 'user' | 'system' | 'ai',
    metadata?: Record<string, any>
  ) => {
    const localTransition: ConversationTransitionLocal = {
      from,
      to,
      timestamp: new Date(),
      reason,
      triggeredBy
    };
    
    setTransitions(prev => [...prev, localTransition]);
    console.log('Conversation transition:', localTransition);
    
    // Log to service
    try {
      await conversationService.logTransition({
        conversationId: conversationIdRef.current,
        from,
        to,
        reason,
        triggeredBy,
        timestamp: new Date().toISOString(),
        metadata
      });
    } catch (error) {
      console.error('Failed to log transition:', error);
    }
  }, []);

  const setIdleTimeout = useCallback(() => {
    if (!settings?.aiSettings.enableIdleTimeout) return;
    
    // Clear existing timeout
    if (timeoutRefs.current.idle) {
      clearTimeout(timeoutRefs.current.idle);
    }

    const idleTimeMinutes = settings.aiSettings.idleTimeout || 10;
    timeoutRefs.current.idle = setTimeout(() => {
      setConversationState(prev => {
        if (prev.status === 'active') {
          logTransition('active', 'idle_timeout', `No activity for ${idleTimeMinutes} minutes`, 'system');
          return { ...prev, status: 'idle_timeout' };
        }
        return prev;
      });
      
      toast({
        title: "Conversation Timeout",
        description: "Your conversation has been closed due to inactivity.",
        variant: "destructive"
      });
    }, idleTimeMinutes * 60 * 1000);
  }, [settings, logTransition, toast]);

  const setSessionTimeout = useCallback(() => {
    if (!settings?.aiSettings.enableMaxSessionLength) return;
    
    const maxMinutes = settings.aiSettings.maxSessionMinutes || 30;
    timeoutRefs.current.session = setTimeout(() => {
      setConversationState(prev => {
        if (prev.status === 'active') {
          logTransition('active', 'max_session', `Maximum session length of ${maxMinutes} minutes reached`, 'system');
          return { ...prev, status: 'max_session' };
        }
        return prev;
      });
      
      toast({
        title: "Session Limit Reached",
        description: "Your conversation has reached the maximum session length. Would you like to talk to a human agent?",
        variant: "destructive"
      });
    }, maxMinutes * 60 * 1000);
  }, [settings, logTransition, toast]);

  const initializeConversation = useCallback(() => {
    const now = new Date();
    setConversationState({
      status: 'active',
      messageCount: 0,
      sessionStartTime: now,
      lastActivityTime: now
    });
    
    setIdleTimeout();
    setSessionTimeout();
    
    logTransition('active', 'active', 'Conversation initialized', 'system');
  }, [setIdleTimeout, setSessionTimeout, logTransition]);

  const recordActivity = useCallback(() => {
    setConversationState(prev => ({
      ...prev,
      lastActivityTime: new Date()
    }));
    
    // Reset idle timeout
    setIdleTimeout();
  }, [setIdleTimeout]);

  const incrementMessageCount = useCallback(() => {
    setConversationState(prev => {
      const newCount = prev.messageCount + 1;
      const maxMessages = settings?.aiSettings.maxMessagesPerSession || 20;
      
      if (settings?.aiSettings.enableMessageQuota && newCount >= maxMessages) {
        logTransition('active', 'quota_exceeded', `Message quota of ${maxMessages} exceeded`, 'system');
        
        toast({
          title: "Message Limit Reached",
          description: "You've reached the maximum number of messages for this session. Would you like to talk to a human agent?",
          variant: "destructive"
        });
        
        return { ...prev, messageCount: newCount, status: 'quota_exceeded' };
      }
      
      return { ...prev, messageCount: newCount };
    });
    
    recordActivity();
  }, [settings, logTransition, toast, recordActivity]);

  const endConversation = useCallback((reason = 'User ended conversation') => {
    // Clear all timeouts
    if (timeoutRefs.current.idle) clearTimeout(timeoutRefs.current.idle);
    if (timeoutRefs.current.session) clearTimeout(timeoutRefs.current.session);

    setConversationState(prev => {
      logTransition(prev.status, 'ended', reason, 'user');
      return { ...prev, status: 'ended' };
    });

    toast({
      title: "Conversation Ended",
      description: "Thank you for using our support chat.",
    });
  }, [logTransition, toast]);

  const requestHumanAgent = useCallback((reason = 'User requested human agent') => {
    setConversationState(prev => {
      logTransition(prev.status, 'waiting_human', reason, 'user');
      return { ...prev, status: 'waiting_human' };
    });
    
    recordActivity();
  }, [logTransition, recordActivity]);

  const confirmEndConversation = useCallback(() => {
    setShowEndConfirmation(true);
  }, []);

  const cancelEndConversation = useCallback(() => {
    setShowEndConfirmation(false);
  }, []);

  const handleConfirmedEnd = useCallback(() => {
    setShowEndConfirmation(false);
    endConversation('User confirmed end conversation');
  }, [endConversation]);

  // Initialize conversation when settings are available
  useEffect(() => {
    if (settings && conversationState.status === 'active' && conversationState.messageCount === 0) {
      initializeConversation();
    }
  }, [settings, initializeConversation, conversationState.status, conversationState.messageCount]);

  return {
    conversationState,
    transitions,
    showEndConfirmation,
    incrementMessageCount,
    recordActivity,
    endConversation,
    requestHumanAgent,
    confirmEndConversation,
    cancelEndConversation,
    handleConfirmedEnd,
    initializeConversation
  };
}