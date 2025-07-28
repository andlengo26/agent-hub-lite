import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Engagement } from '@/types';

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
  return useQuery<EngagementsResponse>({
    queryKey: ['engagements', params],
    queryFn: async () => {
      const response = await fetch('/mocks/engagements.json');
      return response.json();
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
            engagement.aiSummary.toLowerCase().includes(searchLower)
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