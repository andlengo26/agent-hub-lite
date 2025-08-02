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
  // Exclude final statuses - these should not be considered active
  if (chat.status === 'missed' || chat.status === 'closed') {
    return false;
  }

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
  // 4. Not in a final status (already checked above)
  return !!(
    hasValidRequester &&
    (chat.handledBy === 'ai' || 
     (chat.status === 'waiting' && !chat.assignedAgentId)) &&
    !chat.humanHandoffAt
  );
}

/**
 * Determines if a chat should be shown in the human agent queue
 * Prioritizes handledBy field and human handoff status
 */
export function isHumanQueueChat(chat: Chat): boolean {
  const extendedStatus = (chat as any).status;
  
  // Primary criteria: Chat is waiting and specifically requesting human or has been handed off
  return (
    chat.status === 'waiting' && 
    (chat.handledBy === 'human' || chat.humanHandoffAt != null)
  ) || (
    // Extended statuses for escalation/timeout scenarios
    extendedStatus === 'escalated' ||
    extendedStatus === 'ai-timeout'
  );
}

/**
 * Categorizes chats for the agent console
 * Updated to prioritize handledBy field for better queue management
 */
export function categorizeChats(chats: Chat[], widgetSettings?: WidgetSettings) {
  const result = {
    aiActive: [] as Chat[],
    humanQueue: [] as Chat[], // Renamed from 'waiting' to be more explicit
    active: [] as Chat[],
    missed: [] as Chat[],
    closed: [] as Chat[]
  };

  chats.forEach(chat => {
    // Prioritize final statuses first - these should not be misclassified
    if (chat.status === 'missed') {
      result.missed.push(chat);
    } else if (chat.status === 'closed') {
      result.closed.push(chat);
    } else if (chat.status === 'active') {
      // For active chats, separate by who's handling them
      if (chat.handledBy === 'ai' || (!chat.assignedAgentId && !chat.humanHandoffAt)) {
        result.aiActive.push(chat);
      } else {
        result.active.push(chat); // Human-handled active chats
      }
    } else if (isHumanQueueChat(chat)) {
      // Human queue - these need immediate human attention
      result.humanQueue.push(chat);
    } else if (isActiveAIChat(chat, widgetSettings)) {
      result.aiActive.push(chat);
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
      const handledBy = chat.handledBy; // Now required field
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
  // For backward compatibility, if chat doesn't have handledBy, migrate it
  const migratedChat: Chat = {
    ...chat,
    handledBy: chat.handledBy || (chat.assignedAgentId ? 'human' : 'ai')
  };

  // Set AI start time for waiting chats without assignment
  if (chat.status === 'waiting' && !chat.assignedAgentId && !migratedChat.aiStartedAt) {
    migratedChat.aiStartedAt = chat.createdAt;
  }

  // Set human handoff time for assigned chats or explicit human requests
  if ((chat.assignedAgentId || migratedChat.handledBy === 'human') && !migratedChat.humanHandoffAt) {
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