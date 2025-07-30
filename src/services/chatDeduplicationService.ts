/**
 * Service for handling chat deduplication and customer consolidation
 */
import { Chat } from '@/types';
import { logger } from '@/lib/logger';

export interface ConsolidatedChat extends Chat {
  totalChats: number;
  otherChatIds: string[];
  isRepeatCustomer: boolean;
  lastInteractionDate: string;
}

export interface ChatValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export class ChatDeduplicationService {
  /**
   * Validates chat data for inconsistencies
   */
  static validateChats(chats: Chat[]): ChatValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Group chats by customer
    const customerChats = new Map<string, Chat[]>();
    chats.forEach(chat => {
      const key = chat.customerId || chat.requesterEmail;
      if (!customerChats.has(key)) {
        customerChats.set(key, []);
      }
      customerChats.get(key)!.push(chat);
    });

    // Check for problematic scenarios
    customerChats.forEach((customerChatList, customerId) => {
      if (customerChatList.length > 1) {
        const activeChats = customerChatList.filter(chat => chat.status === 'active');
        const waitingChats = customerChatList.filter(chat => chat.status === 'waiting');
        
        // Error: Multiple active chats for same customer
        if (activeChats.length > 1) {
          errors.push(`Customer ${customerId} has ${activeChats.length} active chats simultaneously`);
        }
        
        // Warning: Customer has both active and waiting chats
        if (activeChats.length > 0 && waitingChats.length > 0) {
          warnings.push(`Customer ${customerId} has both active and waiting chats`);
        }
        
        // Warning: Multiple recent chats (within 24 hours)
        const recentChats = customerChatList.filter(chat => {
          const chatDate = new Date(chat.createdAt);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return chatDate > dayAgo;
        });
        
        if (recentChats.length > 2) {
          warnings.push(`Customer ${customerId} has ${recentChats.length} chats in the last 24 hours`);
        }
      }
    });

    logger.debug('Chat validation completed', { 
      totalChats: chats.length, 
      warningsCount: warnings.length, 
      errorsCount: errors.length 
    });

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  /**
   * Consolidates chats by customer, showing only the most relevant chat per status
   */
  static consolidateChats(chats: Chat[]): ConsolidatedChat[] {
    // Group chats by customer and status
    const customerStatusGroups = new Map<string, Map<string, Chat[]>>();
    
    chats.forEach(chat => {
      const customerKey = chat.customerId || chat.requesterEmail;
      const status = chat.status;
      
      if (!customerStatusGroups.has(customerKey)) {
        customerStatusGroups.set(customerKey, new Map());
      }
      
      const statusMap = customerStatusGroups.get(customerKey)!;
      if (!statusMap.has(status)) {
        statusMap.set(status, []);
      }
      
      statusMap.get(status)!.push(chat);
    });

    const consolidatedChats: ConsolidatedChat[] = [];

    // For each customer and status combination, pick the most relevant chat
    customerStatusGroups.forEach((statusMap, customerKey) => {
      statusMap.forEach((chatList, status) => {
        if (chatList.length === 0) return;

        // Sort chats to find the most relevant one
        const sortedChats = [...chatList].sort((a, b) => {
          // For active/waiting: prefer most recent
          if (status === 'active' || status === 'waiting') {
            return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
          }
          // For closed/missed: prefer most recent completion
          return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
        });

        const primaryChat = sortedChats[0];
        const otherChatIds = sortedChats.slice(1).map(chat => chat.id);
        
        // Get the most recent interaction across all chats for this customer
        const allCustomerChats = Array.from(statusMap.values()).flat();
        const lastInteractionDate = allCustomerChats
          .map(chat => chat.lastUpdatedAt)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

        const consolidatedChat: ConsolidatedChat = {
          ...primaryChat,
          totalChats: chatList.length,
          otherChatIds,
          isRepeatCustomer: allCustomerChats.length > 1,
          lastInteractionDate
        };

        consolidatedChats.push(consolidatedChat);
      });
    });

    return consolidatedChats;
  }

  /**
   * Gets the primary chat for a customer based on priority rules
   */
  static getPrimaryChat(customerChats: Chat[]): Chat {
    if (customerChats.length === 1) return customerChats[0];

    // Priority order: active > waiting > missed > closed
    const statusPriority: Record<string, number> = {
      'active': 1,
      'waiting': 2,
      'missed': 3,
      'closed': 4
    };

    return customerChats.sort((a, b) => {
      const priorityDiff = (statusPriority[a.status] || 999) - (statusPriority[b.status] || 999);
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same status, prefer most recent
      return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
    })[0];
  }

  /**
   * Filters chats to prevent conflicting statuses for the same customer
   */
  static filterConflictingChats(chats: Chat[]): Chat[] {
    const customerGroups = new Map<string, Chat[]>();
    
    // Group by customer
    chats.forEach(chat => {
      const key = chat.customerId || chat.requesterEmail;
      if (!customerGroups.has(key)) {
        customerGroups.set(key, []);
      }
      customerGroups.get(key)!.push(chat);
    });

    const filteredChats: Chat[] = [];

    customerGroups.forEach((customerChats) => {
      // If customer has only one chat, include it
      if (customerChats.length === 1) {
        filteredChats.push(customerChats[0]);
        return;
      }

      // Apply conflict resolution rules
      const hasActive = customerChats.some(chat => chat.status === 'active');
      const hasWaiting = customerChats.some(chat => chat.status === 'waiting');

      // If customer has active chat, exclude waiting chats (they can't wait if already active)
      if (hasActive && hasWaiting) {
        const resolvedChats = customerChats.filter(chat => chat.status !== 'waiting');
        filteredChats.push(...resolvedChats);
        
        logger.debug(`Resolved conflict for customer: removed waiting status due to active chat`, {
          customerChats: customerChats.length,
          resolvedChats: resolvedChats.length
        });
      } else {
        // No conflicts, include all chats
        filteredChats.push(...customerChats);
      }
    });

    return filteredChats;
  }
}