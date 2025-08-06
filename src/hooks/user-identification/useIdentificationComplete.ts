/**
 * Hook for handling identification completion and AI response generation
 */

import { useCallback } from 'react';
import { Message } from '@/types/message';
import { IdentificationSession } from '@/types/user-identification';

interface UseIdentificationCompleteProps {
  settings: any;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  sessionPersistence: any;
  isExpanded: boolean;
  incrementMessageCount: () => void;
  messageQuota: any;
}

export function useIdentificationComplete({
  settings,
  messages,
  setMessages,
  sessionPersistence,
  isExpanded,
  incrementMessageCount,
  messageQuota
}: UseIdentificationCompleteProps) {
  
  const handleIdentificationComplete = useCallback((session: IdentificationSession) => {
    // Remove identification message and add acknowledgment
    setMessages(prev => {
      const filtered = prev.filter(msg => msg.type !== 'identification');
      const { userData } = session;
      const welcomeFields = [];
      if (userData.name) welcomeFields.push(`name: ${userData.name}`);
      if (userData.email) welcomeFields.push(`email: ${userData.email}`);
      if (userData.mobile) welcomeFields.push(`phone: ${userData.mobile}`);
      
      const acknowledgmentMessage: Message = {
        id: `ack_${Date.now()}`,
        type: 'ai',
        content: `Thank you for providing your information${welcomeFields.length > 0 ? ` (${welcomeFields.join(', ')})` : ''}. I can now assist you more effectively. How can I help you today?`,
        timestamp: new Date()
      };
      
      sessionPersistence.addMessage?.(acknowledgmentMessage, isExpanded);
      
      // Generate AI response to the last user message if there was one pending
      const lastUserMessage = filtered[filtered.length - 1];
      if (lastUserMessage && lastUserMessage.type === 'user') {
        setTimeout(() => {
          const userContext = `${userData.name || 'User'}${userData.email ? ` (${userData.email})` : ''}`;
          const contextSuffix = ` (${userContext})`;
          
          const aiResponse: Message = {
            id: `ai_${Date.now()}`,
            type: 'ai',
            content: `Thank you for your message: "${lastUserMessage.content}". This is a demo response from the ${settings?.aiSettings?.assistantName}. In production, this would connect to your configured AI model (${settings?.integrations?.aiModel}) to provide intelligent responses.${contextSuffix}`,
            timestamp: new Date(),
            feedbackSubmitted: false
          };
          
          setMessages(current => [...current, aiResponse]);
          sessionPersistence.addMessage?.(aiResponse, isExpanded);
          incrementMessageCount();
          messageQuota.incrementQuota();
        }, 1000);
      }
      
      return [...filtered, acknowledgmentMessage];
    });
  }, [setMessages, sessionPersistence, isExpanded, settings, incrementMessageCount, messageQuota]);

  return {
    handleIdentificationComplete
  };
}