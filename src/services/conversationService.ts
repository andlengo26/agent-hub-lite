/**
 * Service for managing conversation lifecycle API calls
 */

export interface ConversationEndRequest {
  conversationId: string;
  reason: string;
  feedback?: {
    rating: string;
    comment: string;
  };
}

export interface HumanHandoffRequest {
  conversationId: string;
  reason: string;
  userData: {
    name: string;
    email: string;
    phone: string;
  };
  context: {
    pageUrl: string;
    browser: string;
    ipAddress: string;
  };
}

export interface ConversationTransition {
  conversationId: string;
  from: string;
  to: string;
  reason: string;
  triggeredBy: 'user' | 'system' | 'ai';
  timestamp: string;
  metadata?: Record<string, any>;
}

class ConversationService {
  private baseUrl = '/api/conversations';

  async endConversation(request: ConversationEndRequest): Promise<void> {
    // Mock API call
    console.log('API: End conversation', request);
    
    // In real implementation:
    // const response = await fetch(`${this.baseUrl}/${request.conversationId}/end`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(request)
    // });
    
    // if (!response.ok) {
    //   throw new Error('Failed to end conversation');
    // }
    
    return Promise.resolve();
  }

  async requestHumanHandoff(request: HumanHandoffRequest): Promise<{ chatId: string }> {
    // Mock API call
    const chatId = `chat_${Date.now()}`;
    console.log('API: Request human handoff', { ...request, chatId });
    
    // In real implementation:
    // const response = await fetch(`${this.baseUrl}/${request.conversationId}/handoff`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(request)
    // });
    
    // if (!response.ok) {
    //   throw new Error('Failed to request human handoff');
    // }
    
    // const data = await response.json();
    // return data;
    
    return Promise.resolve({ chatId });
  }

  async logTransition(transition: ConversationTransition): Promise<void> {
    // Mock API call
    console.log('API: Log conversation transition', transition);
    
    // In real implementation:
    // const response = await fetch(`${this.baseUrl}/transitions`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(transition)
    // });
    
    // if (!response.ok) {
    //   throw new Error('Failed to log transition');
    // }
    
    return Promise.resolve();
  }

  async getConversationState(conversationId: string): Promise<any> {
    // Mock API call
    console.log('API: Get conversation state', conversationId);
    
    // In real implementation:
    // const response = await fetch(`${this.baseUrl}/${conversationId}/state`);
    
    // if (!response.ok) {
    //   throw new Error('Failed to get conversation state');
    // }
    
    // return response.json();
    
    return Promise.resolve({
      id: conversationId,
      status: 'active',
      messageCount: 0,
      sessionStartTime: new Date().toISOString(),
      lastActivityTime: new Date().toISOString()
    });
  }
}

export const conversationService = new ConversationService();