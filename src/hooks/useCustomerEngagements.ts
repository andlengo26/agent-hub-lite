import { useQuery } from '@tanstack/react-query';
import { CustomerEngagementsResponse, CustomerEngagement, Chat, User } from '@/types';

interface UseCustomerEngagementsParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Generate mock engagement data from chat history
function generateEngagementFromChat(chat: Chat, agent: User | null): CustomerEngagement {
  const engagementTypes = ['initial inquiry', 'follow-up', 'technical support', 'billing inquiry', 'feature request'];
  const channels = ['chat', 'email', 'phone'] as const;
  const tags = [
    ['support', 'urgent'],
    ['billing', 'payment'],
    ['technical', 'api'],
    ['sales', 'demo'],
    ['onboarding', 'training']
  ];

  const randomType = engagementTypes[Math.floor(Math.random() * engagementTypes.length)];
  const randomChannel = channels[Math.floor(Math.random() * channels.length)];
  const randomTags = tags[Math.floor(Math.random() * tags.length)];

  return {
    id: `ce_${chat.id}`,
    customerId: chat.customerId,
    date: chat.createdAt,
    channel: randomChannel,
    agentId: chat.assignedAgentId || 'usr_001',
    agentName: agent?.firstName && agent?.lastName ? `${agent.firstName} ${agent.lastName}` : 'Sarah Johnson',
    aiSummary: `Customer ${randomType}: ${chat.summary}`,
    agentNotes: `Handled ${randomType} for customer. Status: ${chat.status}. ${chat.status === 'closed' ? 'Issue resolved successfully.' : 'Follow-up may be required.'}`,
    notes: [],
    tags: randomTags,
    transcript: `Generated transcript for ${randomChannel} conversation: ${chat.summary}`,
    sourceId: chat.id
  };
}

export function useCustomerEngagements(
  customerId: string,
  params: UseCustomerEngagementsParams = {}
) {
  return useQuery({
    queryKey: ['customer-engagements', customerId, params],
    queryFn: async (): Promise<CustomerEngagementsResponse> => {
      // Fetch chats and users data
      const [chatsResponse, usersResponse] = await Promise.all([
        fetch('/mocks/chats.json'),
        fetch('/mocks/users.json')
      ]);
      
      const chatsData = await chatsResponse.json();
      const usersData = await usersResponse.json();
      
      // Filter chats for this customer
      const customerChats = chatsData.data.filter((chat: Chat) => chat.customerId === customerId);
      
      if (customerChats.length === 0) {
        throw new Error(`Customer ${customerId} not found`);
      }

      // Get customer info from first chat
      const firstChat = customerChats[0];
      const customerName = firstChat.requesterName;
      const customerEmail = firstChat.requesterEmail;
      const contactNumber = firstChat.requesterPhone;

      // Generate engagements from chats
      let engagements = customerChats.map((chat: Chat) => {
        const agent = usersData.data.find((user: User) => user.id === chat.assignedAgentId);
        return generateEngagementFromChat(chat, agent);
      });

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
        customerId: customerId,
        customerName: customerName,
        customerEmail: customerEmail,
        contactNumber: contactNumber,
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