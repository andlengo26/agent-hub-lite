import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Engagement } from '@/types';
import { useChatSessions } from './useChatSessions';
import type { ChatSession } from '@/services/chatSessionService';

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
}

export function useEngagements(params: UseEngagementsParams = {}) {
  const { sessions: chatSessions } = useChatSessions();

  return useQuery<EngagementsResponse>({
    queryKey: ['engagements', params, chatSessions.length],
    queryFn: async () => {
      const response = await fetch('/mocks/engagements.json');
      return response.json();
    },
    select: (data) => {
      // Map chat sessions to engagements
      const sessionEngagements: Engagement[] = chatSessions.map((s) => {
        const lastTime = s.endTime || s.lastActivityTime || s.startTime;
        return {
          id: s.id,
          customerName: s.username || 'Guest',
          customerEmail: '',
          contactNumber: '',
          engagementCount: 1,
          lastEngagedAt: lastTime,
          agentsInvolved: [],
          aiSummary: generateSessionSummary(s),
          source: 'chat_session',
          sessionData: {
            id: s.id,
            conversationId: s.conversationId,
            status: s.status,
            startTime: s.startTime,
            endTime: s.endTime,
            messageCount: s.messageCount,
            terminationReason: s.terminationReason,
            feedback: s.terminationFeedback
              ? { rating: s.terminationFeedback.rating, comment: s.terminationFeedback.comment }
              : undefined,
            duration: s.metadata?.sessionDuration,
          },
        } as Engagement;
      });

      let filteredData = [...sessionEngagements, ...data.data];

      // Apply search filter
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(
          (engagement) =>
            engagement.customerName.toLowerCase().includes(searchLower) ||
            engagement.customerEmail.toLowerCase().includes(searchLower) ||
            engagement.aiSummary.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      if (params.sortBy) {
        filteredData.sort((a, b) => {
          let aValue = a[params.sortBy as keyof Engagement] as any;
          let bValue = b[params.sortBy as keyof Engagement] as any;

          if (params.sortBy === 'lastEngagedAt') {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
          }

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return params.sortOrder === 'desc'
              ? (bValue as string).localeCompare(aValue as string)
              : (aValue as string).localeCompare(bValue as string);
          }

          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return params.sortOrder === 'desc' ? (bValue as number) - (aValue as number) : (aValue as number) - (bValue as number);
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

function generateSessionSummary(session: ChatSession): string {
  const base = `Chat ${session.status.replace('_', ' ')} • ${session.messageCount} messages`;
  if (session.endTime) {
    const duration = session.metadata?.sessionDuration ? Math.round(session.metadata.sessionDuration / 1000) : null;
    return `${base}${duration ? ` • ${duration}s` : ''}`;
  }
  return base;
}
