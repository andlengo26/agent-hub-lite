/**
 * Hook for bi-directional synchronization between chats and engagement history
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCustomerByEmail, useUpsertCustomer } from './useCustomers';
import { Chat, CustomerEngagement } from '@/types';

interface UseChatEngagementSyncProps {
  onNewChat?: (chat: Chat) => void;
  onEngagementUpdate?: (engagement: CustomerEngagement) => void;
}

export function useChatEngagementSync({ onNewChat, onEngagementUpdate }: UseChatEngagementSyncProps = {}) {
  const queryClient = useQueryClient();
  const upsertCustomer = useUpsertCustomer();

  // Auto-create customer and engagement when new chat arrives
  const handleNewChatIngestion = async (chat: Chat) => {
    try {
      // Check if customer exists by email
      const existingCustomer = await queryClient.fetchQuery({
        queryKey: ['customer', 'email', chat.requesterEmail],
        queryFn: async () => {
          const response = await fetch('/mocks/customers.json');
          const data = await response.json();
          return data.data.find((c: any) => c.email === chat.requesterEmail) || null;
        },
      });

      // Create customer if doesn't exist
      if (!existingCustomer && chat.requesterEmail) {
        await upsertCustomer.mutateAsync({
          email: chat.requesterEmail,
          name: chat.requesterName,
          phone: chat.requesterPhone,
        });
      }

      // Create engagement record for the chat
      const newEngagement: CustomerEngagement = {
        id: `eng_${chat.id}`,
        customerId: chat.customerId,
        date: chat.createdAt,
        channel: 'chat',
        agentId: chat.assignedAgentId || '',
        agentName: 'System', // Would be looked up from user data
        aiSummary: chat.summary,
        agentNotes: '',
        tags: [],
        transcript: `Chat started at ${chat.createdAt}`,
      };

      // Invalidate engagement queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['customer-engagements'] });
      queryClient.invalidateQueries({ queryKey: ['engagements'] });

      onNewChat?.(chat);
    } catch (error) {
      console.error('Failed to create customer/engagement for new chat:', error);
    }
  };

  // Listen for real-time updates (stubbed for now)
  useEffect(() => {
    // In a real implementation, this would listen to WebSocket events
    // For now, we'll simulate by checking for new chats periodically
    const interval = setInterval(() => {
      // This would be replaced with actual WebSocket listener
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [queryClient]);

  // Sync engagement updates back to chat data
  const syncEngagementToChat = (engagement: CustomerEngagement) => {
    // Update chat data when engagement is modified
    queryClient.setQueryData(['chat', engagement.id.replace('eng_', 'chat_')], (oldChat: Chat | undefined) => {
      if (!oldChat) return oldChat;
      
      return {
        ...oldChat,
        summary: engagement.aiSummary,
        lastUpdatedAt: new Date().toISOString(),
      };
    });

    onEngagementUpdate?.(engagement);
  };

  return {
    handleNewChatIngestion,
    syncEngagementToChat,
  };
}