/**
 * Enhanced useEngagements hook to include chat session data
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Engagement } from '../types/engagement';
import { useChatSessions } from './useChatSessions';
import { chatSessionService } from '../services/chatSessionService';

interface EngagementsResponse {
  data: Engagement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseEngagementsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeChatSessions?: boolean;
}

export function useEngagements(params: UseEngagementsParams = {}) {
  const { includeChatSessions = true } = params;
  
  // Get chat sessions for integration
  const { sessions: chatSessions } = useChatSessions({
    filter: includeChatSessions ? { status: 'user_ended' } : undefined
  });

  return useQuery<EngagementsResponse>({
    queryKey: ['engagements', params, chatSessions.length],
    queryFn: async () => {
      const response = await fetch('/mocks/engagements.json');
      const mockData = await response.json();
      
      // Integrate chat session data if enabled
      if (includeChatSessions && chatSessions.length > 0) {
        const chatEngagements = chatSessions
          .filter(session => session.status !== 'active') // Only terminated sessions
          .map(session => ({
            id: `chat_${session.id}`,
            customerName: session.username || 'Anonymous User',
            customerEmail: session.userId ? `${session.userId}@example.com` : 'anonymous@example.com',
            contactNumber: 'Via Chat Widget',
            engagementCount: 1,
            lastEngagedAt: session.endTime || session.startTime,
            agentsInvolved: session.status === 'escalated' ? ['Human Agent'] : ['AI Assistant'],
            aiSummary: generateSessionSummary(session),
            source: 'chat_session',
            sessionData: {
              id: session.id,
              conversationId: session.conversationId,
              status: session.status,
              startTime: session.startTime,
              endTime: session.endTime,
              messageCount: session.messageCount,
              terminationReason: session.terminationReason,
              feedback: session.terminationFeedback,
              duration: session.metadata?.sessionDuration
            }
          }));

        // Merge chat engagements with mock data
        mockData.data = [...chatEngagements, ...mockData.data];
        mockData.pagination.total += chatEngagements.length;
      }
      
      return mockData;
    },
    select: (data) => {
      let filteredData = [...data.data];

      // Apply search filter
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(
          engagement =>
            engagement.customerName.toLowerCase().includes(searchLower) ||
            engagement.customerEmail.toLowerCase().includes(searchLower) ||
            engagement.aiSummary.toLowerCase().includes(searchLower) ||
            (engagement.source === 'chat_session' && 
             engagement.sessionData?.terminationReason?.toLowerCase().includes(searchLower))
        );
      }

      // Apply sorting
      if (params.sortBy) {
        filteredData.sort((a, b) => {
          let aValue = a[params.sortBy as keyof Engagement];
          let bValue = b[params.sortBy as keyof Engagement];

          if (params.sortBy === 'lastEngagedAt') {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
          }

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return params.sortOrder === 'desc' 
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          }

          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return params.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
          }

          return 0;
        });
      }

      // Apply pagination
      const startIndex = ((params.page || 1) - 1) * (params.limit || 10);
      const endIndex = startIndex + (params.limit || 10);
      const paginatedData = filteredData.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: filteredData.length,
          totalPages: Math.ceil(filteredData.length / (params.limit || 10)),
        },
      };
    },
  });
}

/**
 * Generate a summary for chat sessions
 */
function generateSessionSummary(session: any): string {
  const duration = session.metadata?.sessionDuration 
    ? Math.round(session.metadata.sessionDuration / 1000 / 60) 
    : 0;
  
  let summary = `Chat session with ${session.messageCount} messages`;
  
  if (duration > 0) {
    summary += ` lasting ${duration} minute${duration !== 1 ? 's' : ''}`;
  }
  
  switch (session.status) {
    case 'user_ended':
      summary += '. Ended by user';
      if (session.terminationFeedback?.rating) {
        summary += ` with ${session.terminationFeedback.rating}-star rating`;
      }
      break;
    case 'idle_timeout':
      summary += '. Ended due to inactivity';
      break;
    case 'ai_timeout':
      summary += '. Ended due to AI session limit';
      break;
    case 'escalated':
      summary += '. Escalated to human agent';
      if (session.metadata?.escalationReason) {
        summary += ` - ${session.metadata.escalationReason}`;
      }
      break;
    default:
      summary += '. Session completed';
  }
  
  if (session.terminationFeedback?.comment) {
    summary += `. User feedback: "${session.terminationFeedback.comment}"`;
  }
  
  return summary;
}