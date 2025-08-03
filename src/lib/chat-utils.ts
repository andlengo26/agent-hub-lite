/**
 * Simplified chat filtering and categorization utilities
 */

import { Chat } from '@/types';

export interface ChatFilters {
  search?: string;
  status?: string;
  agent?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

/**
 * Filter chats based on provided criteria
 */
export function filterChats(chats: Chat[], filters: ChatFilters): Chat[] {
  return chats.filter(chat => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = [
        chat.requesterName,
        chat.requesterEmail,
        chat.summary,
        chat.geo
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    // Status filter
    if (filters.status && chat.status !== filters.status) {
      return false;
    }

    // Agent filter
    if (filters.agent && chat.assignedAgentId !== filters.agent) {
      return false;
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      const chatDate = new Date(chat.createdAt);
      if (filters.dateRange.from && chatDate < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && chatDate > filters.dateRange.to) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Categorize chats by status
 */
export function categorizeChats(chats: Chat[]) {
  return {
    active: chats.filter(chat => chat.status === 'active'),
    waiting: chats.filter(chat => chat.status === 'waiting'),
    missed: chats.filter(chat => chat.status === 'missed'),
    closed: chats.filter(chat => chat.status === 'closed'),
    humanQueue: chats.filter(chat => chat.status === 'waiting'), // Fixed: Only waiting chats
    aiActive: chats.filter(chat => chat.status === 'active' && chat.handledBy === 'ai'),
  };
}

/**
 * Apply section visibility filtering to chats
 */
export function applySectionVisibility(chats: Chat[], sectionVisibility?: any): Chat[] {
  if (!sectionVisibility) {
    return chats;
  }

  return chats.filter(chat => {
    // Map chat status to section visibility settings
    switch (chat.status) {
      case 'waiting':
        return sectionVisibility.waiting;
      case 'active':
        if (chat.handledBy === 'ai') {
          return sectionVisibility.aiActive;
        } else {
          return sectionVisibility.active;
        }
      case 'missed':
        return sectionVisibility.missed;
      case 'closed':
        return sectionVisibility.closed;
      default:
        return true;
    }
  });
}