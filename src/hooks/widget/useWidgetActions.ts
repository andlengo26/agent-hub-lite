/**
 * Widget Actions Hook
 * Handles all widget actions like sending messages, file uploads, etc.
 */

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types/message';
import { IdentificationSession } from '@/types/user-identification';
import { conversationService } from '@/services/conversationService';
import { feedbackService } from '@/services/feedbackService';

interface UseWidgetActionsProps {
  settings: any;
  sessionPersistence: any;
  conversationState: any;
  messageQuota: any;
  spamPrevention: any;
  userIdentification: any;
  isExpanded: boolean;
  hasUserSentFirstMessage: boolean;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setIsTyping: (typing: boolean) => void;
  setIsRecording: (recording: boolean) => void;
  setInputValue: (value: string) => void;
  setHasUserSentFirstMessage: (sent: boolean) => void;
  incrementMessageCount: () => void;
  startAISession: () => void;
  requestHumanAgent: (reason: string) => void;
  handleConfirmedEnd: () => void;
}

export function useWidgetActions({
  settings,
  sessionPersistence,
  conversationState,
  messageQuota,
  spamPrevention,
  userIdentification,
  isExpanded,
  hasUserSentFirstMessage,
  messages,
  setMessages,
  setIsTyping,
  setIsRecording,
  setInputValue,
  setHasUserSentFirstMessage,
  incrementMessageCount,
  startAISession,
  requestHumanAgent,
  handleConfirmedEnd
}: UseWidgetActionsProps) {
  const { toast } = useToast();

  const handleSendMessage = useCallback(async (inputValue: string) => {
    if (!inputValue.trim()) return;
    
    // Check conversation state
    if (conversationState.status !== 'active' && conversationState.status !== 'waiting_human') {
      toast({
        title: "Conversation Ended",
        description: "This conversation has ended. Please start a new conversation.",
        variant: "destructive"
      });
      return;
    }

    // Check message quota
    if (!messageQuota.canSendMessage) {
      toast({
        title: "Message Limit Reached",
        description: "You've reached your message limit. Please wait or talk to a human agent.",
        variant: "destructive"
      });
      return;
    }

    // Check spam prevention
    if (spamPrevention.checkSpamAttempt()) {
      return; // Spam prevention will show its own toast
    }

    // Check if user identification is required
    const isFirstMessage = !hasUserSentFirstMessage;
    
    // Allow first message even without identification, but require it for subsequent messages
    if (!isFirstMessage && !userIdentification.canSendMessage()) {
      // Add identification message for subsequent messages when not identified
      const identificationMessage: Message = {
        id: `identification_${Date.now()}`,
        type: 'identification',
        timestamp: new Date(),
        isCompleted: false
      };
      setMessages(prev => [...prev, identificationMessage]);
      sessionPersistence.addMessage?.(identificationMessage, isExpanded);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    sessionPersistence.addMessage?.(userMessage, isExpanded);
    setInputValue('');
    incrementMessageCount();
    messageQuota.incrementQuota();
    spamPrevention.recordMessage();
    sessionPersistence.updateLastInteraction?.();
    setIsTyping(true);

    // Mark that user has sent their first message
    if (isFirstMessage) {
      setHasUserSentFirstMessage(true);
    }

    // Generate AI response only if user is identified or it's the first message
    if (userIdentification.canSendMessage() || isFirstMessage) {
      // Simulate AI response with user context
      setTimeout(() => {
        const isWelcomeMessage = messages.length === 0 || 
          (messages.length === 1 && messages[0].type === 'ai' && messages[0].content.includes(settings?.aiSettings?.welcomeMessage || ''));
        
        const userContext = userIdentification.getUserContext();
        const contextSuffix = !isWelcomeMessage && userContext ? ` (${userContext})` : '';
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `Thank you for your message: "${userMessage.content}". This is a demo response from the ${settings?.aiSettings?.assistantName}. In production, this would connect to your configured AI model (${settings?.integrations?.aiModel}) to provide intelligent responses.${contextSuffix}`,
          timestamp: new Date(),
          feedbackSubmitted: false
        };
        
        setMessages(prev => [...prev, aiResponse]);
        sessionPersistence.addMessage?.(aiResponse, isExpanded);
        incrementMessageCount();
        messageQuota.incrementQuota();
        sessionPersistence.updateLastInteraction?.();
        setIsTyping(false);
        
        // Start the AI session timer on first AI response
        if (messages.length === 1) {
          startAISession();
        }
      }, 1000 + Math.random() * 2000);
    }

    // After first message, check if identification is needed
    if (isFirstMessage && userIdentification.isRequired && !userIdentification.isCompleted) {
      setTimeout(() => {
        const identificationMessage: Message = {
          id: `identification_${Date.now()}`,
          type: 'identification',
          timestamp: new Date(),
          isCompleted: false
        };
        setMessages(prev => [...prev, identificationMessage]);
        sessionPersistence.addMessage?.(identificationMessage, isExpanded);
        setIsTyping(false); // Stop typing for identification prompt
      }, 1500); // Delay to allow first AI response
    }
  }, [
    conversationState.status,
    messageQuota,
    spamPrevention,
    hasUserSentFirstMessage,
    userIdentification,
    messages,
    settings,
    isExpanded,
    sessionPersistence,
    incrementMessageCount,
    startAISession,
    setMessages,
    setInputValue,
    setIsTyping,
    setHasUserSentFirstMessage,
    toast
  ]);

  const handleVoiceRecording = useCallback(() => {
    if (!settings?.voice?.enableVoiceCalls) {
      toast({
        title: "Voice disabled",
        description: "Voice features are not enabled in settings",
        variant: "destructive"
      });
      return;
    }

    const currentRecording = false; // We'll track this properly
    setIsRecording(!currentRecording);
    
    toast({
      title: !currentRecording ? "Recording started" : "Recording stopped",
      description: !currentRecording ? "Speak your message" : "Processing voice message...",
    });

    if (!currentRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false);
        setInputValue("This is a transcribed voice message (demo)");
      }, 3000);
    }
  }, [settings?.voice?.enableVoiceCalls, setIsRecording, setInputValue, toast]);

  const handleFileUpload = useCallback(() => {
    toast({
      title: "File upload",
      description: "File upload feature is ready for integration",
    });
  }, [toast]);

  const handleVoiceCall = useCallback(() => {
    if (!settings?.voice?.enableVoiceCalls) {
      toast({
        title: "Voice calls disabled",
        description: "Voice calls are not enabled in settings",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Voice call initiated",
      description: "Connecting to support agent...",
    });
  }, [settings?.voice?.enableVoiceCalls, toast]);

  const handleTalkToHuman = useCallback(async () => {
    requestHumanAgent('User clicked Talk to Human button');
    
    try {
      const handoffRequest = {
        conversationId: `conv_${Date.now()}`,
        reason: 'User requested human agent',
        userData: {
          name: userIdentification.session?.userData?.name || 'Anonymous User',
          email: userIdentification.session?.userData?.email || '',
          phone: userIdentification.session?.userData?.mobile || ''
        },
        context: {
          pageUrl: window.location.href,
          browser: navigator.userAgent,
          ipAddress: '127.0.0.1',
          identificationType: userIdentification.session?.type || 'anonymous'
        }
      };
      
      const { chatId } = await conversationService.requestHumanHandoff(handoffRequest);
      
      toast({
        title: "Human Agent Requested",
        description: "You'll be connected to a human agent shortly. Please wait...",
      });
      
      const systemMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: "I'm connecting you with a human agent. Please wait while we find someone to help you.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
      
      console.log('Chat request created with ID:', chatId);
    } catch (error) {
      console.error('Failed to request human handoff:', error);
      toast({
        title: "Error",
        description: "Failed to connect to human agent. Please try again.",
        variant: "destructive"
      });
    }
  }, [requestHumanAgent, userIdentification.session, setMessages, toast]);

  const handleFeedback = useCallback(async (messageId: string, feedback: 'positive' | 'negative', comment?: string) => {
    try {
      await feedbackService.submitFeedback({
        messageId,
        conversationId: `conv_${Date.now()}`,
        type: feedback,
        comment: comment || ''
      });

      // Update message to mark feedback as submitted
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedbackSubmitted: true }
          : msg
      ));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  }, [setMessages]);

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

  const handleFAQSelect = useCallback((question: string, answer: string) => {
    const faqMessage: Message = {
      id: `faq_${Date.now()}`,
      type: 'ai',
      content: `**${question}**\n\n${answer}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, faqMessage]);
    sessionPersistence.addMessage?.(faqMessage, isExpanded);
  }, [setMessages, sessionPersistence, isExpanded]);

  const handleResourceSelect = useCallback((title: string, content: string) => {
    const resourceMessage: Message = {
      id: `resource_${Date.now()}`,
      type: 'ai',
      content: `**${title}**\n\n${content}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, resourceMessage]);
    sessionPersistence.addMessage?.(resourceMessage, isExpanded);
  }, [setMessages, sessionPersistence, isExpanded]);

  const handleStartNewChat = useCallback(() => {
    setMessages([]);
    sessionPersistence.clearSession?.();
    
    // Create new session with welcome message
    if (settings?.aiSettings?.welcomeMessage) {
      const welcomeMessage: Message = {
        id: 'welcome_new',
        type: 'ai',
        content: settings.aiSettings.welcomeMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      sessionPersistence.createNewSession?.(welcomeMessage, isExpanded);
    }
  }, [settings?.aiSettings?.welcomeMessage, setMessages, sessionPersistence, isExpanded]);

  const handleEndConversationWithFeedback = useCallback(async (feedback?: { rating: string; comment: string }) => {
    try {
      await conversationService.endConversation({
        conversationId: `conv_${Date.now()}`,
        reason: 'User ended conversation',
        feedback
      });
      
      handleConfirmedEnd();
      
      const endMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: "Thank you for using our support chat. Your conversation has been ended.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, endMessage]);
      
      if (feedback) {
        console.log('Conversation feedback submitted:', feedback);
      }
    } catch (error) {
      console.error('Failed to end conversation:', error);
      toast({
        title: "Error",
        description: "Failed to end conversation properly. Please try again.",
        variant: "destructive"
      });
    }
  }, [handleConfirmedEnd, setMessages, toast]);

  return {
    handleSendMessage,
    handleVoiceRecording,
    handleFileUpload,
    handleVoiceCall,
    handleTalkToHuman,
    handleFeedback,
    handleIdentificationComplete,
    handleFAQSelect,
    handleResourceSelect,
    handleStartNewChat,
    handleEndConversationWithFeedback
  };
}