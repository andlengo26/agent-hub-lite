/**
 * WebSocket hook for real-time chat updates
 * Initially stubbed, can be implemented with actual WebSocket later
 */

import { useEffect, useState } from 'react';
import { Chat } from '@/types';
import { toast } from '@/hooks/use-toast';

interface WebSocketUpdate {
  type: 'chat_update' | 'new_message' | 'agent_assigned' | 'chat_closed';
  chatId: string;
  data?: any;
}

interface UseWebSocketChatsReturn {
  isConnected: boolean;
  lastUpdate: WebSocketUpdate | null;
}

export function useWebSocketChats(): UseWebSocketChatsReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<WebSocketUpdate | null>(null);

  useEffect(() => {
    // Simulate WebSocket connection
    const timer = setTimeout(() => setIsConnected(true), 1000);

    // Simulate periodic updates
    const updateInterval = setInterval(() => {
      const mockUpdate: WebSocketUpdate = {
        type: 'new_message',
        chatId: 'chat_001',
        data: { message: 'New customer message received' }
      };
      
      setLastUpdate(mockUpdate);
      
      // Show toast notification for new messages
      if (mockUpdate.type === 'new_message') {
        toast({
          title: "New Message",
          description: "Customer sent a new message",
          duration: 3000,
        });
      }
    }, 30000); // Every 30 seconds for demo

    return () => {
      clearTimeout(timer);
      clearInterval(updateInterval);
    };
  }, []);

  return {
    isConnected,
    lastUpdate,
  };
}