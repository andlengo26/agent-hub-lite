/**
 * Enhanced real-time sync hook with notification support
 */

import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Chat, CustomerEngagement } from '@/types';
import { toast } from '@/hooks/use-toast';

interface UseRealTimeSyncProps {
  onChatUpdate?: (chat: Chat) => void;
  onEngagementUpdate?: (engagement: CustomerEngagement) => void;
  onNotification?: (notification: AgentNotification) => void;
  enableNotifications?: boolean;
  enableDesktopNotifications?: boolean;
}

interface AgentNotification {
  id: string;
  type: 'new_chat' | 'chat_message' | 'escalation' | 'quota_alert' | 'system_alert';
  title: string;
  message: string;
  chatId?: string;
  customerId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  actions?: Array<{ type: string; label: string }>;
}

export function useRealTimeSync({
  onChatUpdate,
  onEngagementUpdate,
  onNotification,
  enableNotifications = true,
  enableDesktopNotifications = false,
}: UseRealTimeSyncProps = {}) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(true);
  const [lastNotificationCheck, setLastNotificationCheck] = useState(Date.now());

  // Request desktop notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!enableDesktopNotifications || !('Notification' in window)) return;
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return Notification.permission === 'granted';
  }, [enableDesktopNotifications]);

  // Show desktop notification
  const showDesktopNotification = useCallback((notification: AgentNotification) => {
    if (!enableDesktopNotifications || Notification.permission !== 'granted') return;

    const options: NotificationOptions = {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      silent: false,
    };

    const desktopNotification = new Notification(notification.title, options);
    
    desktopNotification.onclick = () => {
      window.focus();
      if (notification.chatId) {
        // Navigate to chat if needed
        window.location.href = `/chats/all?chat=${notification.chatId}`;
      }
      desktopNotification.close();
    };

    // Auto-close after 5 seconds for non-urgent notifications
    if (notification.priority !== 'urgent') {
      setTimeout(() => desktopNotification.close(), 5000);
    }
  }, [enableDesktopNotifications]);

  // Handle new notifications
  const handleNotification = useCallback((notification: AgentNotification) => {
    if (!enableNotifications) return;

    // Show toast notification
    const priorityConfig = {
      urgent: { variant: 'destructive' as const, duration: 0 },
      high: { variant: 'default' as const, duration: 6000 },
      normal: { variant: 'default' as const, duration: 4000 },
      low: { variant: 'default' as const, duration: 3000 }
    };

    const config = priorityConfig[notification.priority];
    
    toast({
      title: notification.title,
      description: notification.message,
      variant: config.variant,
      duration: config.duration,
    });

    // Show desktop notification
    showDesktopNotification(notification);

    // Call custom handler
    onNotification?.(notification);
  }, [enableNotifications, showDesktopNotification, onNotification]);

  // Mock notification polling (in real implementation, this would be WebSocket/SSE)
  const checkForNotifications = useCallback(async () => {
    try {
      // Simulate checking for new notifications
      const now = Date.now();
      if (now - lastNotificationCheck > 30000) { // Check every 30 seconds
        // Mock new notification
        if (Math.random() < 0.1) { // 10% chance of new notification
          const mockNotification: AgentNotification = {
            id: `notif_${Date.now()}`,
            type: 'chat_message',
            title: 'New Message',
            message: 'Customer has sent a new message',
            chatId: 'chat_123',
            priority: 'normal',
            createdAt: new Date().toISOString(),
            actions: [{ type: 'reply', label: 'Reply Now' }]
          };
          
          handleNotification(mockNotification);
        }
        setLastNotificationCheck(now);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
      setIsConnected(false);
    }
  }, [lastNotificationCheck, handleNotification]);

  // Data sync mechanism
  useEffect(() => {
    const syncInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['customer-engagements'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Check for new notifications
      checkForNotifications();
    }, 30000); // Every 30 seconds

    return () => clearInterval(syncInterval);
  }, [queryClient, checkForNotifications]);

  // Initialize desktop notifications
  useEffect(() => {
    if (enableDesktopNotifications) {
      requestNotificationPermission();
    }
  }, [enableDesktopNotifications, requestNotificationPermission]);

  return {
    isConnected,
    triggerSync: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['customer-engagements'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      checkForNotifications();
    },
    requestNotificationPermission,
    hasNotificationPermission: enableDesktopNotifications && Notification.permission === 'granted',
  };
}