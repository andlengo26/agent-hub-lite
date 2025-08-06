/**
 * Widget Actions Hook
 * Handles all widget actions like sending messages, file uploads, etc.
 */

import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types/message';
import { IdentificationSession } from '@/types/user-identification';
import { conversationService } from '@/services/conversationService';
import { feedbackService } from '@/services/feedbackService';
import { logger } from '@/lib/logger';

interface UseWidgetActionsProps {
  settings: any;
  conversationPersistence: any;
  conversationState: any;
  messageQuota: any;
  spamPrevention: any;
  userIdentification: any;
  isExpanded: boolean;
  hasUserSentFirstMessage: boolean;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
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
  conversationPersistence,
  conversationState,
  messageQuota,
  spamPrevention,
  userIdentification,
  isExpanded,
  hasUserSentFirstMessage,
  messages,
  setMessages,
  setIsRecording,
  setInputValue,
  setHasUserSentFirstMessage,
  incrementMessageCount,
  startAISession,
  requestHumanAgent,
  handleConfirmedEnd
}: UseWidgetActionsProps) {
  const { toast } = useToast();
  const [localIsTyping, setLocalIsTyping] = useState(false);

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

    const isFirstMessage = !hasUserSentFirstMessage;
    const needsIdentification = !userIdentification.canSendMessage();
    
    // Always store the user message first, mark as pending if identification needed
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      isPending: needsIdentification
    };

    setMessages(prev => [...prev, userMessage]);
    conversationPersistence.addMessage?.(userMessage, isExpanded);
    setInputValue('');
    incrementMessageCount();
    
    // If identification is required, show identification form
    if (needsIdentification) {
      userIdentification.showIdentificationForm();
      
      const hasIdentificationMessage = messages.some(msg => msg.type === 'identification');
      if (!hasIdentificationMessage) {
        const identificationMessage: Message = {
          id: `identification_${Date.now()}`,
          type: 'identification',
          timestamp: new Date(),
          isCompleted: false
        };
        setMessages(prev => [...prev, identificationMessage]);
        conversationPersistence.addMessage?.(identificationMessage, isExpanded);
      }
      return;
    }

    // Process the message normally (identification already completed)
    messageQuota.incrementQuota();
    spamPrevention.recordMessage();
    conversationPersistence.updateLastInteraction?.();
    setLocalIsTyping(true);

    // Mark that user has sent their first message
    if (isFirstMessage) {
      setHasUserSentFirstMessage(true);
    }

    // Generate AI response with typing delay
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
      conversationPersistence.addMessage?.(aiResponse, isExpanded);
      incrementMessageCount();
      messageQuota.incrementQuota();
      conversationPersistence.updateLastInteraction?.();
      setLocalIsTyping(false);
      
      // Start the AI session timer on first AI response
      if (messages.length === 1) {
        startAISession();
      }
    }, 800 + Math.random() * 1200);
  }, [
    conversationState.status,
    messageQuota,
    spamPrevention,
    hasUserSentFirstMessage,
    userIdentification,
    messages,
    settings,
    isExpanded,
    conversationPersistence,
    incrementMessageCount,
    startAISession,
    setMessages,
    setInputValue,
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
    logger.stateTransition('IDENTIFICATION_PENDING', 'IDENTIFICATION_COMPLETE', 'User completed identification', {
      userData: session.userData,
      currentMessageCount: messages.length
    }, 'useWidgetActions');
    
    // Hide identification form after completion
    userIdentification.hideIdentificationForm();
    
    setMessages(prev => {
      const originalCount = prev.length;
      logger.messagePersistence('IDENTIFICATION_PROCESSING_START', {
        originalMessageCount: originalCount,
        messageTypes: prev.map(m => m.type)
      }, 'useWidgetActions');
      
      // CRITICAL FIX: Preserve ALL messages, don't filter out any existing content
      // Only remove identification messages, keep all user and AI messages
      const messagesWithoutIdentification = prev.filter(msg => msg.type !== 'identification');
      const updatedMessages = messagesWithoutIdentification.map(msg => 
        msg.type === 'user' && msg.isPending ? { ...msg, isPending: false } : msg
      );
      
      logger.messagePersistence('MESSAGES_FILTERED', {
        originalCount,
        afterFilterCount: messagesWithoutIdentification.length,
        afterUpdateCount: updatedMessages.length,
        removedIdentificationCount: originalCount - messagesWithoutIdentification.length
      }, 'useWidgetActions');
      
      const { userData } = session;
      const welcomeFields = [];
      if (userData.name) welcomeFields.push(`name: ${userData.name}`);
      if (userData.email) welcomeFields.push(`email: ${userData.email}`);
      if (userData.mobile) welcomeFields.push(`phone: ${userData.mobile}`);
      
      const acknowledgmentMessage: Message = {
        id: `ack_${Date.now()}`,
        type: 'ai',
        content: `Thank you for providing your information${welcomeFields.length > 0 ? ` (${welcomeFields.join(', ')})` : ''}. I can now assist you more effectively.`,
        timestamp: new Date()
      };
      
      const newMessages = [...updatedMessages, acknowledgmentMessage];
      
      logger.messagePersistence('ACKNOWLEDGMENT_ADDED', {
        beforeAckCount: updatedMessages.length,
        afterAckCount: newMessages.length
      }, 'useWidgetActions');
      
      // Process any pending user messages
      const pendingMessages = messagesWithoutIdentification.filter(msg => 
        msg.type === 'user' && msg.isPending
      );
      
      if (pendingMessages.length > 0) {
        logger.messagePersistence('PROCESSING_PENDING_MESSAGES', {
          pendingCount: pendingMessages.length,
          pendingMessages: pendingMessages.map(m => ({ id: m.id, content: m.content?.substring(0, 50) }))
        }, 'useWidgetActions');
        
        // Generate AI response to the latest pending message
        const latestPendingMessage = pendingMessages[pendingMessages.length - 1];
        setTimeout(() => {
          const userContext = `${userData.name || 'User'}${userData.email ? ` (${userData.email})` : ''}`;
          const contextSuffix = ` (${userContext})`;
          
          const aiResponse: Message = {
            id: `ai_${Date.now()}`,
            type: 'ai',
            content: `Thank you for your message: "${latestPendingMessage.content}". This is a demo response from the ${settings?.aiSettings?.assistantName}. In production, this would connect to your configured AI model (${settings?.integrations?.aiModel}) to provide intelligent responses.${contextSuffix}`,
            timestamp: new Date(),
            feedbackSubmitted: false
          };
          
          setMessages(current => {
            const updatedCurrent = [...current, aiResponse];
            logger.messagePersistence('AI_RESPONSE_ADDED', {
              messageCount: updatedCurrent.length
            }, 'useWidgetActions');
            return updatedCurrent;
          });
          conversationPersistence.addMessage?.(aiResponse, isExpanded);
          incrementMessageCount();
          messageQuota.incrementQuota();
          setLocalIsTyping(false);
        }, 1000);
        
        setLocalIsTyping(true);
      }
      
      // CRITICAL FIX: Use addMessage instead of updateMessages to preserve message history
      // This ensures we don't overwrite the entire conversation history
      conversationPersistence.addMessage?.(acknowledgmentMessage, isExpanded);
      
      logger.messagePersistence('IDENTIFICATION_PROCESSING_COMPLETE', {
        finalMessageCount: newMessages.length,
        messageTypes: newMessages.map(m => m.type)
      }, 'useWidgetActions');
      
      logger.messageValidation(originalCount, newMessages.length, 'IDENTIFICATION_COMPLETE', {
        expectedReduction: 1, // Only identification message should be removed
        actualChange: newMessages.length - originalCount
      });
      
      return newMessages;
    });
  }, [setMessages, conversationPersistence, isExpanded, settings, incrementMessageCount, messageQuota, userIdentification, messages.length]);

  const handleFAQSelect = useCallback((question: string, answer: string) => {
    const faqMessage: Message = {
      id: `faq_${Date.now()}`,
      type: 'ai',
      content: `**${question}**\n\n${answer}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, faqMessage]);
    conversationPersistence.addMessage?.(faqMessage, isExpanded);
  }, [setMessages, conversationPersistence, isExpanded]);

  const handleResourceSelect = useCallback((title: string, content: string) => {
    const resourceMessage: Message = {
      id: `resource_${Date.now()}`,
      type: 'ai',
      content: `**${title}**\n\n${content}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, resourceMessage]);
    conversationPersistence.addMessage?.(resourceMessage, isExpanded);
  }, [setMessages, conversationPersistence, isExpanded]);

  const handleStartNewChat = useCallback(() => {
    setMessages([]);
    conversationPersistence.clearConversation?.();
    
    // Create new session with welcome message
    if (settings?.aiSettings?.welcomeMessage) {
      const welcomeMessage: Message = {
        id: 'welcome_new',
        type: 'ai',
        content: settings.aiSettings.welcomeMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      conversationPersistence.createNewConversation?.(welcomeMessage, isExpanded);
    }
  }, [settings?.aiSettings?.welcomeMessage, setMessages, conversationPersistence, isExpanded]);

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
    handleEndConversationWithFeedback,
    isTyping: localIsTyping
  };
}