/**
 * Chat filtering utilities for AI-first routing
 * Provides backward compatible filtering with AI routing support
 */

import { Chat, ChatFilters } from '@/types';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

/**
 * Determines if a chat should be considered an active AI chat
 * based on widget settings and chat properties
 */
export function isActiveAIChat(chat: Chat, widgetSettings?: WidgetSettings): boolean {
  // Backward compatibility: if no AI settings, use legacy logic
  if (!widgetSettings?.aiSettings?.enableAIFirst) {
    return chat.status === 'waiting' && !chat.assignedAgentId;
  }

  const allowAnonymous = widgetSettings.userInfo?.anonymousChat ?? false;
  
  // Check if chat has valid requester identification
  const hasValidRequester = allowAnonymous 
    ? (chat.requesterEmail || chat.anonymousUserId)
    : chat.requesterEmail;

  // AI chat criteria:
  // 1. Has valid requester identification based on settings
  // 2. Is handled by AI or waiting for assignment
  // 3. Not assigned to human agent yet
  return !!(
    hasValidRequester &&
    (chat.handledBy === 'ai' || 
     (chat.status === 'waiting' && !chat.assignedAgentId)) &&
    !chat.humanHandoffAt
  );
}

/**
 * Determines if a chat should be shown in the human agent queue
 */
export function isHumanQueueChat(chat: Chat): boolean {
  const extendedStatus = (chat as any).status;
  
  return (
    chat.status === 'waiting' && 
    (chat.handledBy === 'human' || chat.humanHandoffAt != null)
  ) || (
    extendedStatus === 'escalated' ||
    extendedStatus === 'ai-timeout'
  );
}

/**
 * Categorizes chats for the agent console
 */
export function categorizeChats(chats: Chat[], widgetSettings?: WidgetSettings) {
  const result = {
    aiActive: [] as Chat[],
    humanQueue: [] as Chat[],
    active: [] as Chat[],
    missed: [] as Chat[],
    closed: [] as Chat[]
  };

  chats.forEach(chat => {
    // Categorize based on status and AI routing
    if (isActiveAIChat(chat, widgetSettings)) {
      result.aiActive.push(chat);
    } else if (isHumanQueueChat(chat)) {
      result.humanQueue.push(chat);
    } else if (chat.status === 'active') {
      result.active.push(chat);
    } else if (chat.status === 'missed') {
      result.missed.push(chat);
    } else if (chat.status === 'closed') {
      result.closed.push(chat);
    }
  });

  return result;
}

/**
 * Filters chats based on the provided criteria
 */
export function filterChats(chats: Chat[], filters: ChatFilters): Chat[] {
  return chats.filter(chat => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      const chatStatus = chat.status as any; // Allow extended status types
      if (!filters.status.includes(chatStatus)) {
        return false;
      }
    }

    // HandledBy filter
    if (filters.handledBy && filters.handledBy.length > 0) {
      const handledBy = chat.handledBy || 'human'; // Default to human for legacy chats
      if (!filters.handledBy.includes(handledBy)) {
        return false;
      }
    }

    // Agent filter
    if (filters.agentId && chat.assignedAgentId !== filters.agentId) {
      return false;
    }

    // Time range filter
    if (filters.timeRange) {
      const chatTime = new Date(chat.createdAt);
      const startTime = new Date(filters.timeRange.start);
      const endTime = new Date(filters.timeRange.end);
      
      if (chatTime < startTime || chatTime > endTime) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Migrates legacy chat data to support AI-first routing
 * This ensures backward compatibility with existing data
 */
export function migrateLegacyChat(chat: Chat): Chat {
  // If already has AI routing fields, return as-is
  if (chat.handledBy !== undefined) {
    return chat;
  }

  // Migrate based on current status
  const migratedChat: Chat = {
    ...chat,
    handledBy: chat.assignedAgentId ? 'human' : 'ai'
  };

  // Set AI start time for waiting chats
  if (chat.status === 'waiting' && !chat.assignedAgentId) {
    migratedChat.aiStartedAt = chat.createdAt;
  }

  // Set human handoff time for assigned chats
  if (chat.assignedAgentId) {
    migratedChat.humanHandoffAt = chat.lastUpdatedAt;
  }

  return migratedChat;
}

/**
 * Determines if a chat needs AI timeout handling
 */
export function shouldAITimeout(chat: Chat, widgetSettings?: WidgetSettings): boolean {
  if (!chat.aiStartedAt || chat.handledBy !== 'ai') {
    return false;
  }

  const waitingTime = widgetSettings?.aiSettings?.requestWaitingTime || 5; // Default 5 minutes
  const aiStartTime = new Date(chat.aiStartedAt);
  const now = new Date();
  const minutesWaiting = (now.getTime() - aiStartTime.getTime()) / (1000 * 60);

  return minutesWaiting >= waitingTime;
}