/**
 * Consolidated hook for chat summary data and counts
 * Replaces multiple separate hooks with a unified interface
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Chat, User } from '@/types';

interface ChatsSummaryParams {
  dateRange?: {
    start: string;
    end: string;
  };
  agentId?: string;
  status?: 'active' | 'resolved' | 'pending';
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

  // Filter chats based on params
  const filteredChats = chats.filter(chat => {
    if (params.agentId && chat.assignedAgentId !== params.agentId) {
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

  // Calculate counts
  const counts = {
    total: filteredChats.length,
    active: filteredChats.filter(chat => chat.status === 'active').length,
    missed: filteredChats.filter(chat => chat.status === 'missed').length,
    closed: filteredChats.filter(chat => chat.status === 'closed').length,
    waiting: filteredChats.filter(chat => !chat.assignedAgentId).length,
  };

  return {
    chats: filteredChats,
    users,
    counts,
    isLoading: chatsLoading || usersLoading,
    error: chatsError,
  };
}