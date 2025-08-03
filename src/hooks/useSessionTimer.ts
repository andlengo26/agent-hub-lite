/**
 * Hook for managing AI session timer - starts on first AI message and runs independently
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SessionTimerState {
  isActive: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  maxDurationMinutes: number;
  showMaxDurationBanner: boolean;
}

interface UseSessionTimerProps {
  maxDurationMinutes: number;
  enabled: boolean;
  onMaxDurationReached: () => void;
}

export function useSessionTimer({ 
  maxDurationMinutes, 
  enabled, 
  onMaxDurationReached 
}: UseSessionTimerProps) {
  const [timerState, setTimerState] = useState<SessionTimerState>({
    isActive: false,
    startTime: null,
    elapsedSeconds: 0,
    maxDurationMinutes,
    showMaxDurationBanner: false
  });

  const intervalRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, []);

  // Update max duration when settings change
  useEffect(() => {
    setTimerState(prev => ({
      ...prev,
      maxDurationMinutes
    }));
  }, [maxDurationMinutes]);

  const startTimer = useCallback(() => {
    if (!enabled || timerState.isActive) return;

    const startTime = new Date();
    const maxDurationMs = maxDurationMinutes * 60 * 1000;
    const warningMs = Math.max(30000, maxDurationMs * 0.1); // Show warning at 90% or 30 seconds before

    setTimerState(prev => ({
      ...prev,
      isActive: true,
      startTime,
      elapsedSeconds: 0,
      showMaxDurationBanner: false
    }));

    // Start elapsed time counter
    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        if (!prev.startTime) return prev;
        const elapsed = Math.floor((Date.now() - prev.startTime.getTime()) / 1000);
        return { ...prev, elapsedSeconds: elapsed };
      });
    }, 1000);

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      setTimerState(prev => ({
        ...prev,
        showMaxDurationBanner: true
      }));
      
      toast({
        title: "Session Almost Complete",
        description: `Your AI session will end soon. Maximum duration: ${maxDurationMinutes} minutes.`,
        variant: "destructive"
      });
    }, maxDurationMs - warningMs);

    // Set max duration timeout
    timeoutRef.current = setTimeout(() => {
      setTimerState(prev => ({
        ...prev,
        isActive: false,
        showMaxDurationBanner: false
      }));
      
      onMaxDurationReached();
      
      toast({
        title: "AI Session Complete",
        description: "Maximum session duration reached. Would you like to talk to a human agent?",
        variant: "destructive"
      });
      
      // Cleanup intervals
      if (intervalRef.current) clearInterval(intervalRef.current);
    }, maxDurationMs);

    console.log(`Session timer started: ${maxDurationMinutes} minutes max duration`);
  }, [enabled, timerState.isActive, maxDurationMinutes, onMaxDurationReached, toast]);

  const stopTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isActive: false,
      showMaxDurationBanner: false
    }));

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    console.log('Session timer stopped');
  }, []);

  const extendSession = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      showMaxDurationBanner: false
    }));
    
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    
    toast({
      title: "Session Extended",
      description: "Your session will continue with the current maximum duration.",
    });
  }, [toast]);

  const getRemainingMinutes = useCallback(() => {
    if (!timerState.isActive || !timerState.startTime) return maxDurationMinutes;
    
    const elapsedMinutes = timerState.elapsedSeconds / 60;
    return Math.max(0, maxDurationMinutes - elapsedMinutes);
  }, [timerState.isActive, timerState.startTime, timerState.elapsedSeconds, maxDurationMinutes]);

  const formatElapsedTime = useCallback(() => {
    const minutes = Math.floor(timerState.elapsedSeconds / 60);
    const seconds = timerState.elapsedSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timerState.elapsedSeconds]);

  return {
    timerState,
    startTimer,
    stopTimer,
    extendSession,
    getRemainingMinutes,
    formatElapsedTime
  };
}