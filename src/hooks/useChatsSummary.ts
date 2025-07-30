/**
 * Consolidated hook for chat summary data and counts with deduplication
 * Replaces multiple separate hooks with a unified interface
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Chat, User } from '@/types';
import { ChatDeduplicationService, ConsolidatedChat } from '@/services/chatDeduplicationService';
import { logger } from '@/lib/logger';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatsSummaryParams {
  dateRange?: {
    start: string;
    end: string;
  };
  agentId?: string;
  status?: 'active' | 'resolved' | 'pending';
  enableDeduplication?: boolean;
}

interface ChatsSummary {
  chats: Chat[] | ConsolidatedChat[];
  users: User[];
  counts: {
    total: number;
    active: number;
    missed: number;
    closed: number;
    waiting: number;
  };
  validationResult?: {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  };
  isLoading: boolean;
  error: Error | null;
}

export function useChatsSummary(params: ChatsSummaryParams = {}): ChatsSummary {
  const { currentUser } = useAuth();
  const { data: chatsData, isLoading: chatsLoading, error: chatsError } = useQuery({
    queryKey: ['chats', params],
    queryFn: () => apiClient.getChats({
      status: params.status,
      // Add date range and agent filtering when API supports it
    }),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });

  const chats = chatsData?.data || [];
  const users = usersData?.data || [];

  // Memoize expensive operations
  const processedData = useMemo(() => {
    // Filter chats based on params
    let filteredChats = chats.filter(chat => {
      if (params.agentId && chat.assignedAgentId !== params.agentId) {
        logger.debug('Filtering out chat due to agent mismatch', { 
          chatId: chat.id, 
          chatAgentId: chat.assignedAgentId, 
          filterAgentId: params.agentId 
        });
        return false;
      }
      
      if (params.dateRange) {
        const chatDate = new Date(chat.createdAt);
        const startDate = new Date(params.dateRange.start);
        const endDate = new Date(params.dateRange.end);
        if (chatDate < startDate || chatDate > endDate) {
          return false;
        }
      }
      
      return true;
    });

    // Validate data integrity
    const validationResult = ChatDeduplicationService.validateChats(filteredChats);
    
    // Log validation results
    if (validationResult.warnings.length > 0) {
      logger.warn('Chat data validation warnings', { warnings: validationResult.warnings });
    }
    if (validationResult.errors.length > 0) {
      logger.error('Chat data validation errors', { errors: validationResult.errors });
    }

    // Apply deduplication if enabled
    if (params.enableDeduplication) {
      // Filter conflicting chats first
      filteredChats = ChatDeduplicationService.filterConflictingChats(filteredChats);
      
      // Then consolidate by customer
      const consolidatedChats = ChatDeduplicationService.consolidateChats(filteredChats);
      
      // Calculate counts based on consolidated data
      const counts = {
        total: consolidatedChats.length,
        active: consolidatedChats.filter(chat => chat.status === 'active').length,
        missed: consolidatedChats.filter(chat => chat.status === 'missed').length,
        closed: consolidatedChats.filter(chat => chat.status === 'closed').length,
        waiting: consolidatedChats.filter(chat => chat.status === 'waiting').length,
      };

      return {
        chats: consolidatedChats,
        counts,
        validationResult
      };
    } else {
      // Calculate counts based on original filtered data
      const counts = {
        total: filteredChats.length,
        active: filteredChats.filter(chat => chat.status === 'active').length,
        missed: filteredChats.filter(chat => chat.status === 'missed').length,
        closed: filteredChats.filter(chat => chat.status === 'closed').length,
        waiting: filteredChats.filter(chat => chat.status === 'waiting').length,
      };

      return {
        chats: filteredChats,
        counts,
        validationResult
      };
    }
  }, [chats, params, currentUser]);

  // Debug logging
  if (params.agentId) {
    logger.debug('Chat filtering summary', {
      totalChats: chats.length,
      filteredChats: processedData.chats.length,
      agentId: params.agentId,
      currentUserId: currentUser?.id
    });
  }

  return {
    ...processedData,
    users,
    isLoading: chatsLoading || usersLoading,
    error: chatsError,
  };
}