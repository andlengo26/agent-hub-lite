/**
 * Simplified hook for chat summary data and counts
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Chat, User } from '@/types';
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
  chats: Chat[];
  users: User[];
  counts: {
    total: number;
    active: number;
    missed: number;
    closed: number;
    waiting: number;
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

    // Calculate counts based on filtered data
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
    };
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