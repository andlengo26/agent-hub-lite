import { useState, useEffect, useCallback, useRef } from 'react';
import { Chat } from '@/types';
import { useWidgetSettings } from './useWidgetSettings';

interface WaitTimeState {
  activeChatId: string | null;
  startTime: Date | null;
  isActive: boolean;
}

interface UseWaitTimeTrackingProps {
  chats: Chat[];
  onChatMissed?: (chatId: string, waitTime: number) => void;
}

export function useWaitTimeTracking({ chats, onChatMissed }: UseWaitTimeTrackingProps) {
  const { settings } = useWidgetSettings();
  const [waitTimeState, setWaitTimeState] = useState<WaitTimeState>({
    activeChatId: null,
    startTime: null,
    isActive: false
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const waitTimeMinutes = settings?.aiSettings?.requestWaitingTime || 5;

  const startWaitTimer = useCallback((chatId: string) => {
    // Clear any existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const startTime = new Date();
    setWaitTimeState({
      activeChatId: chatId,
      startTime,
      isActive: true
    });

    // Set timeout for the configured wait time
    timeoutRef.current = setTimeout(() => {
      const waitTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60);
      onChatMissed?.(chatId, waitTime);
      
      setWaitTimeState({
        activeChatId: null,
        startTime: null,
        isActive: false
      });
    }, waitTimeMinutes * 60 * 1000);
  }, [waitTimeMinutes, onChatMissed]);

  const stopWaitTimer = useCallback((chatId?: string) => {
    if (timeoutRef.current && (!chatId || waitTimeState.activeChatId === chatId)) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      
      setWaitTimeState({
        activeChatId: null,
        startTime: null,
        isActive: false
      });
    }
  }, [waitTimeState.activeChatId]);

  const getElapsedWaitTime = useCallback(() => {
    if (!waitTimeState.isActive || !waitTimeState.startTime) {
      return 0;
    }
    return Math.floor((new Date().getTime() - waitTimeState.startTime.getTime()) / 1000 / 60);
  }, [waitTimeState]);

  const getRemainingWaitTime = useCallback(() => {
    const elapsed = getElapsedWaitTime();
    return Math.max(0, waitTimeMinutes - elapsed);
  }, [getElapsedWaitTime, waitTimeMinutes]);

  // Monitor waiting chats and start/stop timers accordingly
  useEffect(() => {
    const waitingChats = chats.filter(chat => chat.status === 'waiting');
    
    // If there's a waiting chat and no active timer, start one
    if (waitingChats.length > 0 && !waitTimeState.isActive) {
      const oldestWaitingChat = waitingChats.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )[0];
      startWaitTimer(oldestWaitingChat.id);
    }
    
    // If there are no waiting chats but timer is active, stop it
    if (waitingChats.length === 0 && waitTimeState.isActive) {
      stopWaitTimer();
    }
    
    // If the active chat is no longer waiting, stop its timer
    if (waitTimeState.activeChatId && 
        !waitingChats.some(chat => chat.id === waitTimeState.activeChatId)) {
      stopWaitTimer(waitTimeState.activeChatId);
    }
  }, [chats, waitTimeState.isActive, waitTimeState.activeChatId, startWaitTimer, stopWaitTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    waitTimeState,
    startWaitTimer,
    stopWaitTimer,
    getElapsedWaitTime,
    getRemainingWaitTime,
    waitTimeMinutes
  };
}