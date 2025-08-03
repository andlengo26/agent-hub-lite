/**
 * Hook for spam prevention with message timing validation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SpamPreventionState {
  canSendMessage: boolean;
  remainingCooldown: number;
  lastMessageTime: number | null;
  isInCooldown: boolean;
}

interface UseSpamPreventionProps {
  minDelaySeconds: number;
  enabled: boolean;
}

export function useSpamPrevention({ minDelaySeconds, enabled }: UseSpamPreventionProps) {
  const [spamState, setSpamState] = useState<SpamPreventionState>({
    canSendMessage: true,
    remainingCooldown: 0,
    lastMessageTime: null,
    isInCooldown: false
  });

  const cooldownIntervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  const startCooldown = useCallback(() => {
    if (!enabled) return;

    const currentTime = Date.now();
    const cooldownMs = minDelaySeconds * 1000;

    setSpamState(prev => ({
      ...prev,
      canSendMessage: false,
      lastMessageTime: currentTime,
      isInCooldown: true,
      remainingCooldown: minDelaySeconds
    }));

    // Clear any existing interval
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }

    // Start countdown
    cooldownIntervalRef.current = setInterval(() => {
      setSpamState(prev => {
        const elapsed = (Date.now() - currentTime) / 1000;
        const remaining = Math.max(0, minDelaySeconds - elapsed);

        if (remaining <= 0) {
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
          }
          return {
            ...prev,
            canSendMessage: true,
            remainingCooldown: 0,
            isInCooldown: false
          };
        }

        return {
          ...prev,
          remainingCooldown: Math.ceil(remaining)
        };
      });
    }, 100);
  }, [enabled, minDelaySeconds]);

  const checkSpamAttempt = useCallback(() => {
    if (!enabled) return false;

    if (spamState.lastMessageTime) {
      const timeSinceLastMessage = (Date.now() - spamState.lastMessageTime) / 1000;
      
      if (timeSinceLastMessage < minDelaySeconds) {
        const waitTime = Math.ceil(minDelaySeconds - timeSinceLastMessage);
        
        toast({
          title: "Please slow down",
          description: `Please wait ${waitTime} seconds before sending another message.`,
          variant: "destructive"
        });
        
        return true; // Is spam attempt
      }
    }

    return false; // Not spam
  }, [enabled, spamState.lastMessageTime, minDelaySeconds, toast]);

  const recordMessage = useCallback(() => {
    if (!enabled) return;
    startCooldown();
  }, [enabled, startCooldown]);

  const resetCooldown = useCallback(() => {
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }
    
    setSpamState({
      canSendMessage: true,
      remainingCooldown: 0,
      lastMessageTime: null,
      isInCooldown: false
    });
  }, []);

  const formatCooldownTime = useCallback(() => {
    if (spamState.remainingCooldown <= 0) return '';
    return `${spamState.remainingCooldown}s`;
  }, [spamState.remainingCooldown]);

  return {
    spamState,
    checkSpamAttempt,
    recordMessage,
    resetCooldown,
    formatCooldownTime,
    canSendMessage: enabled ? spamState.canSendMessage : true
  };
}