/**
 * Main hook for coordinating real-time synchronization between WebSocket events and data sync
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocketChats } from './useWebSocketChats';
import { useChatEngagementSync } from './useChatEngagementSync';
import { Chat, CustomerEngagement } from '@/types';
import { toast } from '@/hooks/use-toast';

interface UseRealTimeSyncProps {
  onChatUpdate?: (chat: Chat) => void;
  onEngagementUpdate?: (engagement: CustomerEngagement) => void;
  enableNotifications?: boolean;
}

export function useRealTimeSync({
  onChatUpdate,
  onEngagementUpdate,
  enableNotifications = true,
}: UseRealTimeSyncProps = {}) {
  const queryClient = useQueryClient();
  const { isConnected, lastUpdate } = useWebSocketChats();
  const { handleNewChatIngestion, syncEngagementToChat } = useChatEngagementSync({
    onNewChat: onChatUpdate,
    onEngagementUpdate,
  });

  // Handle WebSocket updates
  useEffect(() => {
    if (!lastUpdate) return;

    const handleWebSocketUpdate = async () => {
      switch (lastUpdate.type) {
        case 'new_message':
          // Invalidate chat queries to fetch latest messages
          queryClient.invalidateQueries({ queryKey: ['chats'] });
          queryClient.invalidateQueries({ queryKey: ['chat', lastUpdate.chatId] });
          
          if (enableNotifications) {
            toast({
              title: "New Message",
              description: lastUpdate.data?.message || "New customer message received",
              duration: 3000,
            });
          }
          break;

        case 'chat_update':
          // Handle chat metadata updates
          queryClient.invalidateQueries({ queryKey: ['chat', lastUpdate.chatId] });
          break;

        case 'agent_assigned':
          // Handle agent assignment
          queryClient.invalidateQueries({ queryKey: ['chats'] });
          queryClient.invalidateQueries({ queryKey: ['chat', lastUpdate.chatId] });
          
          if (enableNotifications) {
            toast({
              title: "Agent Assigned",
              description: `Chat ${lastUpdate.chatId} has been assigned to an agent`,
              duration: 3000,
            });
          }
          break;

        case 'chat_closed':
          // Handle chat closure - create final engagement record
          try {
            const chatData = await queryClient.fetchQuery({
              queryKey: ['chat', lastUpdate.chatId],
              queryFn: async () => {
                const response = await fetch('/mocks/chats.json');
                const data = await response.json();
                return data.data.find((chat: Chat) => chat.id === lastUpdate.chatId);
              },
            });

            if (chatData) {
              await handleNewChatIngestion(chatData);
            }
          } catch (error) {
            console.error('Failed to process closed chat:', error);
          }

          queryClient.invalidateQueries({ queryKey: ['chats'] });
          queryClient.invalidateQueries({ queryKey: ['customer-engagements'] });
          
          if (enableNotifications) {
            toast({
              title: "Chat Closed",
              description: `Chat ${lastUpdate.chatId} has been closed and archived`,
              duration: 3000,
            });
          }
          break;

        default:
          console.warn('Unknown WebSocket update type:', lastUpdate.type);
      }
    };

    handleWebSocketUpdate();
  }, [lastUpdate, queryClient, handleNewChatIngestion, enableNotifications]);

  // Periodic sync for consistency (fallback mechanism)
  useEffect(() => {
    if (!isConnected) return;

    const syncInterval = setInterval(() => {
      // Perform periodic sync to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['customer-engagements'] });
      queryClient.invalidateQueries({ queryKey: ['engagements'] });
    }, 60000); // Every minute

    return () => clearInterval(syncInterval);
  }, [isConnected, queryClient]);

  return {
    isConnected,
    lastUpdate,
    syncEngagementToChat,
    handleNewChatIngestion,
  };
}