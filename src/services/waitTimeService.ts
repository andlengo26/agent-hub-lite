import { Chat } from '@/types';

interface WaitTimeTransition {
  chatId: string;
  from: 'waiting';
  to: 'missed';
  waitTimeMinutes: number;
  timestamp: string;
  triggeredBy: 'system';
  reason: 'wait_time_exceeded';
}

class WaitTimeService {
  private transitions: WaitTimeTransition[] = [];

  /**
   * Transition a chat from waiting to missed status
   */
  async transitionToMissed(chatId: string, waitTimeMinutes: number): Promise<boolean> {
    try {
      const transition: WaitTimeTransition = {
        chatId,
        from: 'waiting',
        to: 'missed',
        waitTimeMinutes,
        timestamp: new Date().toISOString(),
        triggeredBy: 'system',
        reason: 'wait_time_exceeded'
      };

      // In a real implementation, this would call an API
      // For now, we simulate the API call
      console.log('Transitioning chat to missed:', transition);
      
      this.transitions.push(transition);
      
      // Simulate API success
      return true;
    } catch (error) {
      console.error('Failed to transition chat to missed:', error);
      return false;
    }
  }

  /**
   * Get wait time transitions for analytics
   */
  getTransitions(): WaitTimeTransition[] {
    return [...this.transitions];
  }

  /**
   * Get wait time statistics
   */
  getWaitTimeStats() {
    const totalTransitions = this.transitions.length;
    const avgWaitTime = totalTransitions > 0 
      ? this.transitions.reduce((sum, t) => sum + t.waitTimeMinutes, 0) / totalTransitions 
      : 0;
    
    const waitTimeDistribution = this.transitions.reduce((acc, t) => {
      const bucket = Math.floor(t.waitTimeMinutes / 5) * 5; // 5-minute buckets
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalMissedByTimeout: totalTransitions,
      averageWaitTime: avgWaitTime,
      waitTimeDistribution
    };
  }

  /**
   * Clear all stored transitions (for testing/reset)
   */
  clearTransitions(): void {
    this.transitions = [];
  }
}

export const waitTimeService = new WaitTimeService();