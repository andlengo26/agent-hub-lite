/**
 * Enhanced types for engagements with chat session support
 */

export interface Engagement {
  id: string;
  customerName: string;
  customerEmail: string;
  contactNumber: string;
  engagementCount: number;
  lastEngagedAt: string;
  agentsInvolved: string[];
  aiSummary: string;
  source?: 'chat_session' | 'external';
  sessionData?: {
    id: string;
    conversationId: string;
    status: string;
    startTime: string;
    endTime?: string;
    messageCount: number;
    terminationReason?: string;
    feedback?: {
      rating: string;
      comment?: string;
    };
    duration?: number;
  };
}