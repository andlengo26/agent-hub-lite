/**
 * Service for handling AI message feedback
 */

export interface FeedbackSubmission {
  messageId: string;
  conversationId: string;
  type: 'positive' | 'negative';
  comment?: string;
  timestamp?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface FeedbackResponse {
  id: string;
  status: 'success' | 'error';
  message: string;
}

export interface FeedbackSummary {
  totalFeedback: number;
  positive: number;
  negative: number;
  averageRating: number;
  responsesWithFeedback: number;
  feedbackRate: number;
}

class FeedbackService {
  private async simulateApiCall<T>(data: T, delay: number = 500): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, delay));
    return data;
  }

  async submitFeedback(feedback: FeedbackSubmission): Promise<FeedbackResponse> {
    console.log('Submitting feedback:', feedback);
    
    try {
      // Simulate API call to /api/mock/ai-feedback
      const response = await this.simulateApiCall({
        id: `fb_${Date.now()}`,
        status: 'success' as const,
        message: 'Feedback submitted successfully'
      });

      // In a real implementation, this would make an actual API call:
      // const response = await fetch('/api/mock/ai-feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...feedback,
      //     timestamp: feedback.timestamp || new Date().toISOString(),
      //     userAgent: feedback.userAgent || navigator.userAgent,
      //     ipAddress: feedback.ipAddress || '127.0.0.1'
      //   })
      // });
      // return response.json();

      return response;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw new Error('Failed to submit feedback');
    }
  }

  async getFeedbackSummary(conversationId?: string): Promise<FeedbackSummary> {
    console.log('Fetching feedback summary for conversation:', conversationId);
    
    try {
      // Simulate fetching from /api/mock/ai-feedback
      const mockSummary = await this.simulateApiCall({
        totalFeedback: 15,
        positive: 12,
        negative: 3,
        averageRating: 0.8,
        responsesWithFeedback: 15,
        feedbackRate: 0.75
      });

      return mockSummary;
    } catch (error) {
      console.error('Failed to fetch feedback summary:', error);
      throw new Error('Failed to fetch feedback summary');
    }
  }

  async getFeedbackHistory(conversationId: string): Promise<FeedbackSubmission[]> {
    console.log('Fetching feedback history for conversation:', conversationId);
    
    try {
      // Simulate fetching feedback history
      const mockHistory = await this.simulateApiCall([
        {
          messageId: 'msg_001',
          conversationId,
          type: 'positive' as const,
          comment: '',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userAgent: navigator.userAgent,
          ipAddress: '127.0.0.1'
        }
      ]);

      return mockHistory;
    } catch (error) {
      console.error('Failed to fetch feedback history:', error);
      throw new Error('Failed to fetch feedback history');
    }
  }
}

export const feedbackService = new FeedbackService();