import { useQuery } from '@tanstack/react-query';
import { CustomerEngagementsResponse, CustomerEngagement } from '@/types';

interface UseCustomerEngagementsParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export function useCustomerEngagements(
  customerId: string,
  params: UseCustomerEngagementsParams = {}
) {
  return useQuery({
    queryKey: ['customer-engagements', customerId, params],
    queryFn: async (): Promise<CustomerEngagementsResponse> => {
      const response = await fetch('/mocks/customer-engagements.json');
      const data = await response.json();
      
      const customerData = data[customerId];
      
      if (!customerData) {
        throw new Error(`Customer ${customerId} not found`);
      }

      let { engagements } = customerData;

      // Apply search filter
      if (params.search && params.search.trim()) {
        const searchLower = params.search.toLowerCase();
        engagements = engagements.filter((engagement: CustomerEngagement) =>
          engagement.aiSummary.toLowerCase().includes(searchLower) ||
          engagement.agentName.toLowerCase().includes(searchLower) ||
          engagement.agentNotes.toLowerCase().includes(searchLower) ||
          engagement.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Apply sorting
      if (params.sortBy) {
        engagements.sort((a: CustomerEngagement, b: CustomerEngagement) => {
          let aValue, bValue;
          
          switch (params.sortBy) {
            case 'date':
              aValue = new Date(a.date);
              bValue = new Date(b.date);
              break;
            case 'agentName':
              aValue = a.agentName;
              bValue = b.agentName;
              break;
            case 'channel':
              aValue = a.channel;
              bValue = b.channel;
              break;
            default:
              aValue = a[params.sortBy as keyof CustomerEngagement];
              bValue = b[params.sortBy as keyof CustomerEngagement];
          }

          if (aValue < bValue) return params.sortOrder === 'desc' ? 1 : -1;
          if (aValue > bValue) return params.sortOrder === 'desc' ? -1 : 1;
          return 0;
        });
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEngagements = engagements.slice(startIndex, endIndex);

      return {
        customerId: customerData.customerId,
        customerName: customerData.customerName,
        customerEmail: customerData.customerEmail,
        contactNumber: customerData.contactNumber,
        engagements: paginatedEngagements,
        pagination: {
          page,
          limit,
          total: engagements.length,
          totalPages: Math.ceil(engagements.length / limit),
        },
      };
    },
  });
}