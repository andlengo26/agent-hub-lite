/**
 * Hook for accessing conversation analytics, transitions, and summaries
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { conversationService } from '@/services/conversationService';
import { ConversationSummary } from '@/services/summaryService';
import { waitTimeService } from '@/services/waitTimeService';

export interface ConversationAnalytics {
  conversationId: string;
  transitions: Array<{
    id: string;
    from: string;
    to: string;
    reason: string;
    triggeredBy: 'user' | 'system' | 'ai';
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  summary?: ConversationSummary;
  metrics: {
    totalDuration: number; // in minutes
    messageCount: number;
    handoffRequested: boolean;
    outcome: string;
    waitTimeMetrics?: {
      totalMissedByTimeout: number;
      averageWaitTime: number;
    };
  };
}

interface UseConversationAnalyticsParams {
  conversationId?: string;
  customerId?: string;
}

export function useConversationAnalytics({
  conversationId,
  customerId
}: UseConversationAnalyticsParams = {}) {
  
  // Fetch transitions for a specific conversation
  const { data: transitions = [], isLoading: transitionsLoading } = useQuery({
    queryKey: ['conversation-transitions', conversationId],
    queryFn: () => conversationService.getConversationTransitions(conversationId!),
    enabled: !!conversationId,
  });

  // Fetch all transitions from localStorage for customer view
  const { data: allTransitions = [], isLoading: allTransitionsLoading } = useQuery({
    queryKey: ['all-conversation-transitions'],
    queryFn: async () => {
      try {
        const stored = localStorage.getItem('conversation-transitions');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    },
    enabled: !!customerId && !conversationId,
  });

  // Fetch conversation summaries
  const { data: summaries = [], isLoading: summariesLoading } = useQuery({
    queryKey: ['conversation-summaries', customerId],
    queryFn: async () => {
      try {
        const stored = localStorage.getItem('conversation-summaries');
        const allSummaries = stored ? JSON.parse(stored) : [];
        return customerId 
          ? allSummaries.filter((s: ConversationSummary) => s.conversationId.includes(customerId))
          : allSummaries;
      } catch {
        return [];
      }
    },
    enabled: true,
  });

  // Get wait time analytics
  const waitTimeStats = waitTimeService.getWaitTimeStats();

  // Calculate analytics for conversation or customer
  const analytics = useMemo((): ConversationAnalytics | null => {
    const relevantTransitions = conversationId ? transitions : allTransitions;
    const relevantSummary = summaries.find((s: ConversationSummary) => 
      conversationId ? s.conversationId === conversationId : true
    );

    if (relevantTransitions.length === 0) return null;

    // Calculate metrics
    const firstTransition = relevantTransitions[0];
    const lastTransition = relevantTransitions[relevantTransitions.length - 1];
    
    const totalDuration = firstTransition && lastTransition
      ? Math.round((new Date(lastTransition.timestamp).getTime() - new Date(firstTransition.timestamp).getTime()) / (1000 * 60))
      : 0;

    const handoffRequested = relevantTransitions.some((t: any) => t.to === 'waiting_human');
    const outcome = lastTransition?.to || 'unknown';
    
    return {
      conversationId: conversationId || 'aggregate',
      transitions: relevantTransitions,
      summary: relevantSummary,
      metrics: {
        totalDuration,
        messageCount: relevantSummary?.messageCount || 0,
        handoffRequested,
        outcome,
        waitTimeMetrics: {
          totalMissedByTimeout: waitTimeStats.totalMissedByTimeout,
          averageWaitTime: waitTimeStats.averageWaitTime
        }
      },
    };
  }, [conversationId, transitions, allTransitions, summaries]);

  const isLoading = transitionsLoading || allTransitionsLoading || summariesLoading;

  return {
    analytics,
    transitions: conversationId ? transitions : allTransitions,
    summaries,
    isLoading,
    refetch: () => {
      // Could trigger refetch of queries if needed
    },
  };
}

// Helper hook for just transitions (simpler interface)
export function useConversationTransitions(conversationId?: string) {
  return useQuery({
    queryKey: ['conversation-transitions', conversationId],
    queryFn: () => conversationService.getConversationTransitions(conversationId!),
    enabled: !!conversationId,
  });
}

// Helper hook for just summaries  
export function useConversationSummaries(customerId?: string) {
  return useQuery({
    queryKey: ['conversation-summaries', customerId],
    queryFn: async () => {
      try {
        const stored = localStorage.getItem('conversation-summaries');
        const allSummaries = stored ? JSON.parse(stored) : [];
        return customerId 
          ? allSummaries.filter((s: ConversationSummary) => s.conversationId.includes(customerId))
          : allSummaries;
      } catch {
        return [];
      }
    },
  });
}