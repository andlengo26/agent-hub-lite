/**
 * Simplified real-time sync hook
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Chat, CustomerEngagement } from '@/types';

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

  // Simplified sync mechanism - periodically refresh data
  useEffect(() => {
    const syncInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['customer-engagements'] });
    }, 30000); // Every 30 seconds

    return () => clearInterval(syncInterval);
  }, [queryClient]);

  return {
    isConnected: true,
    triggerSync: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['customer-engagements'] });
    },
  };
}