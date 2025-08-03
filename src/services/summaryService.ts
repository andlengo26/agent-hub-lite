/**
 * AI Conversation Summary Service
 * Generates intelligent summaries for completed conversations
 */

import { ConversationTransitionLocal } from '@/hooks/useConversationLifecycle';
import { Chat } from '@/types';

export interface ConversationSummary {
  id: string;
  conversationId: string;
  summary: string;
  keyTopics: string[];
  outcome: 'resolved' | 'escalated' | 'abandoned' | 'timeout';
  customerSatisfaction?: 'satisfied' | 'neutral' | 'unsatisfied';
  resolutionTime: number; // in minutes
  messageCount: number;
  handoffRequested: boolean;
  createdAt: string;
}

class SummaryService {
  /**
   * Generate AI summary for a completed conversation
   */
  async generateConversationSummary(
    conversationId: string,
    transitions: ConversationTransitionLocal[],
    messages: { content: string; sender: 'user' | 'ai' | 'agent' }[] = [],
    metadata?: {
      sessionDuration?: number;
      messageCount?: number;
      feedback?: { rating: string; comment?: string };
    }
  ): Promise<ConversationSummary> {
    // Analyze conversation to determine outcome
    const outcome = this.determineOutcome(transitions);
    const handoffRequested = transitions.some(t => t.to === 'waiting_human');
    
    // Calculate resolution time from first to last transition
    const startTime = transitions[0]?.timestamp || new Date();
    const endTime = transitions[transitions.length - 1]?.timestamp || new Date();
    const resolutionTime = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    // Generate intelligent summary based on conversation flow
    const summary = this.generateIntelligentSummary(transitions, messages, metadata);
    const keyTopics = this.extractKeyTopics(messages);

    const conversationSummary: ConversationSummary = {
      id: `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      summary,
      keyTopics,
      outcome,
      customerSatisfaction: metadata?.feedback?.rating as any,
      resolutionTime,
      messageCount: metadata?.messageCount || messages.length,
      handoffRequested,
      createdAt: new Date().toISOString(),
    };

    // Persist summary to engagements
    await this.persistSummaryToEngagements(conversationSummary);

    console.log('Generated conversation summary:', conversationSummary);
    return conversationSummary;
  }

  /**
   * Determine conversation outcome based on transitions
   */
  private determineOutcome(transitions: ConversationTransitionLocal[]): ConversationSummary['outcome'] {
    const lastTransition = transitions[transitions.length - 1];
    
    if (!lastTransition) return 'abandoned';
    
    switch (lastTransition.to) {
      case 'ended':
        return lastTransition.triggeredBy === 'user' ? 'resolved' : 'abandoned';
      case 'waiting_human':
        return 'escalated';
      case 'idle_timeout':
      case 'max_session':
        return 'timeout';
      case 'quota_exceeded':
        return 'abandoned';
      default:
        return 'abandoned';
    }
  }

  /**
   * Generate intelligent summary based on conversation context
   */
  private generateIntelligentSummary(
    transitions: ConversationTransitionLocal[],
    messages: { content: string; sender: 'user' | 'ai' | 'agent' }[],
    metadata?: any
  ): string {
    const outcome = this.determineOutcome(transitions);
    const messageCount = metadata?.messageCount || messages.length;
    const duration = metadata?.sessionDuration ? Math.round(metadata.sessionDuration / 60) : 0;
    
    // Extract user intent from messages (simplified AI simulation)
    const userMessages = messages.filter(m => m.sender === 'user').map(m => m.content);
    const intent = this.extractUserIntent(userMessages);
    
    // Build context-aware summary
    let summary = '';
    
    if (intent) {
      summary += `Customer inquiry regarding ${intent}. `;
    }
    
    switch (outcome) {
      case 'resolved':
        summary += `Issue was successfully resolved through AI assistance. `;
        if (metadata?.feedback?.rating === 'satisfied') {
          summary += `Customer provided positive feedback. `;
        }
        break;
      case 'escalated':
        summary += `Conversation was escalated to human agent as requested by customer. `;
        break;
      case 'timeout':
        summary += `Session ended due to inactivity after ${duration} minutes. `;
        break;
      case 'abandoned':
        summary += `Customer left the conversation without resolution. `;
        break;
    }
    
    summary += `Total interaction: ${messageCount} messages over ${duration} minutes.`;
    
    if (metadata?.feedback?.comment) {
      summary += ` Customer feedback: "${metadata.feedback.comment}"`;
    }
    
    return summary.trim();
  }

  /**
   * Extract key topics from conversation messages (simplified)
   */
  private extractKeyTopics(messages: { content: string; sender: string }[]): string[] {
    const topics = new Set<string>();
    const keywords = [
      'billing', 'payment', 'pricing', 'subscription',
      'technical', 'bug', 'error', 'integration', 'api',
      'account', 'login', 'password', 'access',
      'feature', 'request', 'support', 'help',
      'refund', 'cancel', 'upgrade', 'downgrade'
    ];
    
    const allText = messages
      .filter(m => m.sender === 'user')
      .map(m => m.content.toLowerCase())
      .join(' ');
    
    keywords.forEach(keyword => {
      if (allText.includes(keyword)) {
        topics.add(keyword);
      }
    });
    
    return Array.from(topics).slice(0, 5); // Limit to 5 key topics
  }

  /**
   * Extract user intent from messages (simplified)
   */
  private extractUserIntent(userMessages: string[]): string | null {
    if (userMessages.length === 0) return null;
    
    const firstMessage = userMessages[0].toLowerCase();
    
    if (firstMessage.includes('bill') || firstMessage.includes('payment')) {
      return 'billing support';
    } else if (firstMessage.includes('technical') || firstMessage.includes('error')) {
      return 'technical support';
    } else if (firstMessage.includes('account') || firstMessage.includes('login')) {
      return 'account assistance';
    } else if (firstMessage.includes('feature') || firstMessage.includes('how')) {
      return 'product information';
    } else {
      return 'general inquiry';
    }
  }

  /**
   * Persist summary to engagements mock data
   */
  private async persistSummaryToEngagements(summary: ConversationSummary): Promise<void> {
    // In a real implementation, this would save to the database
    // For now, we'll simulate API call and log
    console.log('API: Persist conversation summary to engagements', summary);
    
    // Store in localStorage for development (simulate persistent storage)
    try {
      const existingSummaries = JSON.parse(localStorage.getItem('conversation-summaries') || '[]');
      existingSummaries.push(summary);
      localStorage.setItem('conversation-summaries', JSON.stringify(existingSummaries));
    } catch (error) {
      console.warn('Failed to store summary in localStorage:', error);
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export const summaryService = new SummaryService();