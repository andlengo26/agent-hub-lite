/**
 * Hook for managing AI message quotas with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface QuotaState {
  dailyCount: number;
  hourlyCount: number;
  sessionCount: number;
  lastResetDate: string;
  lastResetHour: string;
  isQuotaExceeded: boolean;
  remainingDaily: number;
  remainingHourly: number;
  remainingSession: number;
}

interface UseMessageQuotaProps {
  maxDailyMessages: number;
  maxHourlyMessages: number;
  maxSessionMessages: number;
  enableDailyQuota: boolean;
  enableHourlyQuota: boolean;
  enableSessionQuota: boolean;
  quotaWarningThreshold: number;
}

const STORAGE_KEY = 'widget_message_quota';

export function useMessageQuota({
  maxDailyMessages,
  maxHourlyMessages,
  maxSessionMessages,
  enableDailyQuota,
  enableHourlyQuota,
  enableSessionQuota,
  quotaWarningThreshold
}: UseMessageQuotaProps) {
  const [quotaState, setQuotaState] = useState<QuotaState>({
    dailyCount: 0,
    hourlyCount: 0,
    sessionCount: 0,
    lastResetDate: new Date().toDateString(),
    lastResetHour: new Date().getHours().toString(),
    isQuotaExceeded: false,
    remainingDaily: maxDailyMessages,
    remainingHourly: maxHourlyMessages,
    remainingSession: maxSessionMessages
  });

  const { toast } = useToast();

  // Load quota data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const currentDate = new Date().toDateString();
        const currentHour = new Date().getHours().toString();

        // Reset daily quota if date changed
        if (parsed.lastResetDate !== currentDate) {
          parsed.dailyCount = 0;
          parsed.hourlyCount = 0;
          parsed.lastResetDate = currentDate;
          parsed.lastResetHour = currentHour;
        }
        // Reset hourly quota if hour changed
        else if (parsed.lastResetHour !== currentHour) {
          parsed.hourlyCount = 0;
          parsed.lastResetHour = currentHour;
        }

        setQuotaState({
          ...parsed,
          remainingDaily: Math.max(0, maxDailyMessages - parsed.dailyCount),
          remainingHourly: Math.max(0, maxHourlyMessages - parsed.hourlyCount),
          remainingSession: Math.max(0, maxSessionMessages - parsed.sessionCount),
          isQuotaExceeded: checkQuotaExceeded(parsed, {
            maxDailyMessages,
            maxHourlyMessages,
            maxSessionMessages,
            enableDailyQuota,
            enableHourlyQuota,
            enableSessionQuota
          })
        });
      } catch (error) {
        console.error('Failed to parse quota data:', error);
      }
    }
  }, [maxDailyMessages, maxHourlyMessages, maxSessionMessages, enableDailyQuota, enableHourlyQuota, enableSessionQuota]);

  // Save quota data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotaState));
  }, [quotaState]);

  const checkQuotaExceeded = useCallback((state: Record<string, unknown>, limits: Record<string, unknown>) => {
    if (limits.enableDailyQuota && state.dailyCount >= limits.maxDailyMessages) return true;
    if (limits.enableHourlyQuota && state.hourlyCount >= limits.maxHourlyMessages) return true;
    if (limits.enableSessionQuota && state.sessionCount >= limits.maxSessionMessages) return true;
    return false;
  }, []);

  const incrementQuota = useCallback(() => {
    setQuotaState(prev => {
      const newState = {
        ...prev,
        dailyCount: prev.dailyCount + 1,
        hourlyCount: prev.hourlyCount + 1,
        sessionCount: prev.sessionCount + 1,
        remainingDaily: Math.max(0, maxDailyMessages - (prev.dailyCount + 1)),
        remainingHourly: Math.max(0, maxHourlyMessages - (prev.hourlyCount + 1)),
        remainingSession: Math.max(0, maxSessionMessages - (prev.sessionCount + 1))
      };

      newState.isQuotaExceeded = checkQuotaExceeded(newState, {
        maxDailyMessages,
        maxHourlyMessages,
        maxSessionMessages,
        enableDailyQuota,
        enableHourlyQuota,
        enableSessionQuota
      });

      // Show warning when approaching quota
      const shouldWarn = (
        (enableDailyQuota && newState.remainingDaily <= quotaWarningThreshold) ||
        (enableHourlyQuota && newState.remainingHourly <= quotaWarningThreshold) ||
        (enableSessionQuota && newState.remainingSession <= quotaWarningThreshold)
      ) && !newState.isQuotaExceeded;

      if (shouldWarn) {
        const warningMessage = getWarningMessage(newState);
        toast({
          title: "Message Quota Warning",
          description: warningMessage,
          variant: "destructive"
        });
      }

      if (newState.isQuotaExceeded) {
        const quotaType = getExceededQuotaType(newState);
        toast({
          title: "Message Quota Exceeded",
          description: `You've reached your ${quotaType} message limit. Please try again later or contact a human agent.`,
          variant: "destructive"
        });
      }

      return newState;
    });
  }, [maxDailyMessages, maxHourlyMessages, maxSessionMessages, enableDailyQuota, enableHourlyQuota, enableSessionQuota, quotaWarningThreshold, checkQuotaExceeded, toast]);

  const getWarningMessage = useCallback((state: QuotaState) => {
    const warnings = [];
    if (enableDailyQuota && state.remainingDaily <= quotaWarningThreshold) {
      warnings.push(`${state.remainingDaily} daily messages left`);
    }
    if (enableHourlyQuota && state.remainingHourly <= quotaWarningThreshold) {
      warnings.push(`${state.remainingHourly} hourly messages left`);
    }
    if (enableSessionQuota && state.remainingSession <= quotaWarningThreshold) {
      warnings.push(`${state.remainingSession} session messages left`);
    }
    return warnings.join(', ');
  }, [enableDailyQuota, enableHourlyQuota, enableSessionQuota, quotaWarningThreshold]);

  const getExceededQuotaType = useCallback((state: QuotaState) => {
    if (enableDailyQuota && state.dailyCount >= maxDailyMessages) return 'daily';
    if (enableHourlyQuota && state.hourlyCount >= maxHourlyMessages) return 'hourly';
    if (enableSessionQuota && state.sessionCount >= maxSessionMessages) return 'session';
    return 'message';
  }, [enableDailyQuota, enableHourlyQuota, enableSessionQuota, maxDailyMessages, maxHourlyMessages, maxSessionMessages]);

  const resetSessionQuota = useCallback(() => {
    setQuotaState(prev => ({
      ...prev,
      sessionCount: 0,
      remainingSession: maxSessionMessages,
      isQuotaExceeded: checkQuotaExceeded({
        ...prev,
        sessionCount: 0
      }, {
        maxDailyMessages,
        maxHourlyMessages,
        maxSessionMessages,
        enableDailyQuota,
        enableHourlyQuota,
        enableSessionQuota
      })
    }));
  }, [maxSessionMessages, checkQuotaExceeded, maxDailyMessages, maxHourlyMessages, enableDailyQuota, enableHourlyQuota, enableSessionQuota]);

  const getQuotaStatus = useCallback(() => {
    const status = [];
    if (enableDailyQuota) {
      status.push(`Daily: ${quotaState.remainingDaily}/${maxDailyMessages}`);
    }
    if (enableHourlyQuota) {
      status.push(`Hourly: ${quotaState.remainingHourly}/${maxHourlyMessages}`);
    }
    if (enableSessionQuota) {
      status.push(`Session: ${quotaState.remainingSession}/${maxSessionMessages}`);
    }
    return status.join(' | ');
  }, [quotaState, enableDailyQuota, enableHourlyQuota, enableSessionQuota, maxDailyMessages, maxHourlyMessages, maxSessionMessages]);

  return {
    quotaState,
    incrementQuota,
    resetSessionQuota,
    getQuotaStatus,
    canSendMessage: !quotaState.isQuotaExceeded
  };
}