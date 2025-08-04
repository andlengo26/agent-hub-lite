import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Maximize2, Minimize2, Send, Paperclip, Mic, MicOff, Phone, User, LogOut, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { useToast } from "@/hooks/use-toast";
import { useConversationLifecycle } from "@/hooks/useConversationLifecycle";
import { useMessageQuota } from "@/hooks/useMessageQuota";
import { useSpamPrevention } from "@/hooks/useSpamPrevention";
import { useUserIdentification } from "@/hooks/useUserIdentification";
import { useMoodleAutoIdentification } from "@/hooks/useMoodleAutoIdentification";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { ConversationEndModal } from "./ConversationEndModal";
import { CountdownBadge } from "@/components/widget/CountdownBadge";
import { MaxDurationBanner } from "@/components/widget/MaxDurationBanner";
import { QuotaBadge } from "@/components/widget/QuotaBadge";
import { QuotaWarningBanner } from "@/components/widget/QuotaWarningBanner";
import { MessageRenderer } from "@/components/widget/messages/MessageRenderer";
import { FAQBrowser } from "@/components/widget/FAQBrowser";
import { ChatClosedState } from "@/components/widget/ChatClosedState";
import { PostChatFeedback } from "@/components/widget/PostChatFeedback";
import { MoodleReLoginPrompt } from "@/components/widget/MoodleReLoginPrompt";
import { conversationService } from "@/services/conversationService";
import { feedbackService } from "@/services/feedbackService";
import { CustomerService } from "@/services/customerService";
import { Message } from "@/types/message";
import { IdentificationSession } from "@/types/user-identification";

export function InteractiveWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);
  const [showFAQBrowser, setShowFAQBrowser] = useState(false);
  const [showPostChatFeedback, setShowPostChatFeedback] = useState(false);
  const [showMoodleReLoginPrompt, setShowMoodleReLoginPrompt] = useState(false);
  const [isConversationClosed, setIsConversationClosed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { settings } = useWidgetSettings();
  const { toast } = useToast();
  
  const {
    conversationState,
    showEndConfirmation,
    incrementMessageCount,
    recordActivity,
    requestHumanAgent,
    confirmEndConversation,
    cancelEndConversation,
    handleConfirmedEnd,
    sessionTimer,
    startAISession
  } = useConversationLifecycle(settings);

  // Message quota management
  const messageQuota = useMessageQuota({
    maxDailyMessages: settings?.aiSettings.maxDailyMessages || 50,
    maxHourlyMessages: settings?.aiSettings.maxHourlyMessages || 10,
    maxSessionMessages: settings?.aiSettings.maxMessagesPerSession || 20,
    enableDailyQuota: settings?.aiSettings.enableDailyQuota || false,
    enableHourlyQuota: settings?.aiSettings.enableHourlyQuota || false,
    enableSessionQuota: settings?.aiSettings.enableMessageQuota || false,
    quotaWarningThreshold: settings?.aiSettings.quotaWarningThreshold || 5
  });

  // Spam prevention
  const spamPrevention = useSpamPrevention({
    minDelaySeconds: settings?.aiSettings.minMessageDelaySeconds || 3,
    enabled: settings?.aiSettings.enableSpamPrevention || false
  });

  // User identification
  const userIdentification = useUserIdentification({
    settings,
    onIdentificationComplete: async (session) => {
      // Create customer record when identification is complete
      try {
        await CustomerService.createCustomerFromIdentification(session);
        console.log('Customer created from identification session:', session.id);
      } catch (error) {
        console.error('Failed to create customer from identification:', error);
      }
    }
  });

  // Session persistence with widget state restoration
  const sessionPersistence = useSessionPersistence({
    onSessionLoaded: (session) => {
      console.log('📱 Session loaded:', { 
        sessionId: session.id, 
        status: session.status, 
        isExpanded: session.isExpanded, 
        messagesCount: session.messages.length 
      });
      
      setMessages(session.messages);
      if (session.status === 'closed') {
        setIsConversationClosed(true);
      }
      
      // Check if we should show Moodle re-login prompt
      if (session.userContext && settings?.integrations?.moodle) {
        setShowMoodleReLoginPrompt(true);
      }
      
      // Widget state will be restored in the dedicated useEffect below
    }
  });

  // Auto-identification for Moodle users
  const moodleAutoIdentification = useMoodleAutoIdentification({
    settings,
    onAutoIdentificationSuccess: async (session) => {
      // Update user identification state with auto-identified session
      userIdentification.setIdentificationSession(session);
      
      // Create customer record
      try {
        await CustomerService.createCustomerFromIdentification(session);
        console.log('Customer auto-created from Moodle identification:', session.id);
      } catch (error) {
        console.error('Failed to create customer from auto-identification:', error);
      }
      
    // Show auto-identification success message
    const autoWelcomeMessage: Message = {
      id: `auto_welcome_${Date.now()}`,
      type: 'ai',
      content: `Welcome back, ${session.userData.name || 'Student'}! I can see you're logged into Moodle. How can I assist you today?`,
      timestamp: new Date()
    };
      setMessages(prev => [...prev, autoWelcomeMessage]);
      sessionPersistence.addMessage(autoWelcomeMessage, isExpanded);
    },
    onAutoIdentificationError: (error) => {
      console.log('Moodle auto-identification failed, will use manual identification if needed:', error);
    }
  });

  // Determine widget expand state based on session and settings
  const determineWidgetExpandState = (session: any, settings: any): boolean => {
    if (!session || !settings) return false;
    
    console.log('🎯 Determining widget state:', { 
      sessionStatus: session.status, 
      sessionExpanded: session.isExpanded, 
      autoOpen: settings.appearance?.autoOpenWidget 
    });
    
    // For idle_timeout sessions, preserve the session's expand state (don't force collapse)
    // This allows users to continue where they left off after being idle
    if (session.status === 'idle_timeout') {
      return session.isExpanded;
    }
    
    // Never auto-expand if session is ended or closed
    if (session.status === 'ended' || session.status === 'closed') {
      return false;
    }
    
    // If session has explicit isExpanded state, use it (highest priority)
    if (typeof session.isExpanded === 'boolean') {
      return session.isExpanded;
    }
    
    // Fall back to autoOpenWidget setting for active sessions with messages
    return settings.appearance?.autoOpenWidget && session.messages?.length > 0;
  };

  // Restore widget state after both session and settings are loaded
  const restoreWidgetState = () => {
    if (!sessionPersistence.currentSession || !settings) return;
    
    const shouldExpand = determineWidgetExpandState(sessionPersistence.currentSession, settings);
    console.log('🔄 Restoring widget state:', { shouldExpand, currentExpanded: isExpanded });
    
    if (shouldExpand !== isExpanded) {
      setIsExpanded(shouldExpand);
      // Don't call updateWidgetState here to avoid circular updates during restoration
    }
  };

  // Restore widget state when session and settings are both available
  useEffect(() => {
    restoreWidgetState();
  }, [sessionPersistence.currentSession, settings]); // Only trigger when these core dependencies change

  // Auto-open widget for new sessions (only when no existing session)
  useEffect(() => {
    if (settings?.appearance.autoOpenWidget && 
        !isExpanded && 
        messages.length === 0 && 
        !sessionPersistence.currentSession) {
      console.log('🚀 Auto-opening widget for new session');
      setTimeout(() => {
        setIsExpanded(true);
        sessionPersistence.updateWidgetState(true);
      }, 2000);
    }
  }, [settings?.appearance.autoOpenWidget, isExpanded, messages.length, sessionPersistence.currentSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create welcome message for new expanded sessions
  useEffect(() => {
    if (isExpanded && 
        messages.length === 0 && 
        settings?.aiSettings?.welcomeMessage && 
        !sessionPersistence.currentSession) {
      console.log('📝 Creating welcome message for new session');
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: settings.aiSettings.welcomeMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      sessionPersistence.createNewSession(welcomeMessage, true);
    }
  }, [isExpanded, messages.length, settings?.aiSettings?.welcomeMessage, sessionPersistence.currentSession]);

  // Initialize welcome message when settings are loaded for the first time
  useEffect(() => {
    if (settings?.aiSettings?.welcomeMessage && 
        !isExpanded && 
        messages.length === 0 && 
        !sessionPersistence.currentSession) {
      console.log('📝 Initializing welcome message when settings loaded');
      const welcomeMessage: Message = {
        id: 'welcome_init',
        type: 'ai',
        content: settings.aiSettings.welcomeMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [settings?.aiSettings?.welcomeMessage]);

  // Reset session quota when conversation ends
  useEffect(() => {
    if (conversationState.status === 'ended') {
      messageQuota.resetSessionQuota();
      spamPrevention.resetCooldown();
      sessionPersistence.updateSession({ status: 'ended' });
      
      // Show post-chat feedback for human-handled conversations
      // Note: wasHandledByHuman would be added to ConversationState in a real implementation
      setShowPostChatFeedback(false); // Disabled for now since property doesn't exist
    }
  }, [conversationState.status, messageQuota, spamPrevention, sessionPersistence]);

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative', comment?: string) => {
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
  };

  if (!settings) return null;

  const { appearance, aiSettings, userInfo, voice } = settings;
  
  const getPositionClasses = () => {
    const paddingX = `${appearance.paddingX || 24}px`;
    const paddingY = `${appearance.paddingY || 24}px`;
    
    switch (appearance.buttonPosition) {
      case 'bottom-left':
        return { bottom: paddingY, left: paddingX };
      case 'top-right':
        return { top: paddingY, right: paddingX };
      case 'top-left':
        return { top: paddingY, left: paddingX };
      default: // bottom-right
        return { bottom: paddingY, right: paddingX };
    }
  };

  const getExpandedPositionClasses = () => {
    if (isMaximized) return { top: '16px', left: '16px', right: '16px', bottom: '16px' };
    
    const paddingX = `${appearance.paddingX || 24}px`;
    const paddingY = `${appearance.paddingY || 24}px`;
    
    const baseStyle = { width: '384px', height: '500px' };
    
    switch (appearance.buttonPosition) {
      case 'bottom-left':
        return { ...baseStyle, bottom: paddingY, left: paddingX };
      case 'top-right':
        return { ...baseStyle, top: paddingY, right: paddingX };
      case 'top-left':
        return { ...baseStyle, top: paddingY, left: paddingX };
      default: // bottom-right
        return { ...baseStyle, bottom: paddingY, right: paddingX };
    }
  };

  const handleSendMessage = async () => {
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
    if (!userIdentification.canSendMessage()) {
      // Add identification message to the conversation
      const identificationMessage: Message = {
        id: `identification_${Date.now()}`,
        type: 'identification',
        timestamp: new Date(),
        isCompleted: false
      };
      setMessages(prev => [...prev, identificationMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    sessionPersistence.addMessage(userMessage, isExpanded);
    setInputValue("");
    incrementMessageCount();
    messageQuota.incrementQuota();
    spamPrevention.recordMessage();
    sessionPersistence.updateLastInteraction?.();
    setIsTyping(true);

    // Simulate AI response with user context
    setTimeout(() => {
      const userContext = userIdentification.getUserContext();
      const contextSuffix = userContext ? ` (${userContext})` : '';
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Thank you for your message: "${userMessage.content}". This is a demo response from the ${aiSettings.assistantName}. In production, this would connect to your configured AI model (${settings.integrations.aiModel}) to provide intelligent responses.${contextSuffix}`,
        timestamp: new Date(),
        feedbackSubmitted: false
      };
      setMessages(prev => [...prev, aiResponse]);
      sessionPersistence.addMessage(aiResponse, isExpanded);
      incrementMessageCount();
      messageQuota.incrementQuota();
      sessionPersistence.updateLastInteraction?.();
      setIsTyping(false);
      
      // Start the AI session timer on first AI response
      if (messages.length === 1) { // welcome message + user message = 2, so first AI response
        startAISession();
      }
    }, 1000 + Math.random() * 2000);
  };

  const handleVoiceRecording = () => {
    if (!voice.enableVoiceCalls) {
      toast({
        title: "Voice disabled",
        description: "Voice features are not enabled in settings",
        variant: "destructive"
      });
      return;
    }

    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording stopped" : "Recording started",
      description: isRecording ? "Processing voice message..." : "Speak your message",
    });

    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false);
        setInputValue("This is a transcribed voice message (demo)");
      }, 3000);
    }
  };

  const handleFileUpload = () => {
    toast({
      title: "File upload",
      description: "File upload feature is ready for integration",
    });
  };

  const handleVoiceCall = () => {
    if (!voice.enableVoiceCalls) {
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
  };

  // Handle identification completion - AI acknowledges user and removes identification form
  const handleIdentificationComplete = (session: IdentificationSession) => {
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
      
      sessionPersistence.addMessage(acknowledgmentMessage, isExpanded);
      return [...filtered, acknowledgmentMessage];
    });
  };

  const handleTalkToHuman = async () => {
    requestHumanAgent('User clicked Talk to Human button');
    
    try {
      // Create a new chat request with human handoff using the service
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
            ipAddress: '127.0.0.1', // In real app, would be actual IP
            identificationType: userIdentification.session?.type || 'anonymous'
          }
        };
      
      const { chatId } = await conversationService.requestHumanHandoff(handoffRequest);
      
      toast({
        title: "Human Agent Requested",
        description: "You'll be connected to a human agent shortly. Please wait...",
      });
      
      // Add system message
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
  };

  const handleEndConversationWithFeedback = async (feedback?: { rating: string; comment: string }) => {
    try {
      // End conversation through service
      await conversationService.endConversation({
        conversationId: `conv_${Date.now()}`,
        reason: 'User ended conversation',
        feedback
      });
      
      handleConfirmedEnd();
      
      // Add system message
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
  };

  // Handle starting a new chat
  const handleStartNewChat = () => {
    setIsConversationClosed(false);
    setMessages([]);
    setShowPostChatFeedback(false);
    sessionPersistence.clearSession();
    
    // Create new session with welcome message
    if (settings?.aiSettings.welcomeMessage) {
      const welcomeMessage: Message = {
        id: 'welcome_new',
        type: 'ai',
        content: settings.aiSettings.welcomeMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      sessionPersistence.createNewSession(welcomeMessage, isExpanded);
    }
  };

  // Handle FAQ selection
  const handleFAQSelect = (question: string, answer: string) => {
    const faqMessage: Message = {
      id: `faq_${Date.now()}`,
      type: 'ai',
      content: `**${question}**\n\n${answer}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, faqMessage]);
    sessionPersistence.addMessage(faqMessage, isExpanded);
    setShowFAQBrowser(false);
  };

  // Handle post-chat feedback submission
  const handlePostChatFeedbackSubmit = async (feedback: { rating: number; comment: string }) => {
    try {
      await fetch('/mocks/post-chat-feedback.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: sessionPersistence.currentSession?.conversationId,
          ...feedback,
          timestamp: new Date().toISOString()
        })
      });
      setShowPostChatFeedback(false);
    } catch (error) {
      console.error('Failed to submit post-chat feedback:', error);
      throw error;
    }
  };

  // Handle Moodle re-login
  const handleMoodleReLogin = async (): Promise<boolean> => {
    try {
      const success = await moodleAutoIdentification.attemptAutoIdentification();
      if (success) {
        setShowMoodleReLoginPrompt(false);
        // Merge chat history would happen here in real implementation
        toast({
          title: "Login Successful",
          description: "Your chat history has been merged"
        });
      }
      return success;
    } catch (error) {
      console.error('Moodle re-login failed:', error);
      return false;
    }
  };

  // Test function for manual auto-identification trigger (demo purposes)
  const handleTestAutoIdentification = async () => {
    try {
      // Clear existing identification
      userIdentification.clearIdentification();
      moodleAutoIdentification.resetAutoIdentification();
      
      // Attempt auto-identification
      const success = await moodleAutoIdentification.attemptAutoIdentification();
      
      if (!success) {
        toast({
          title: "Auto-identification Test",
          description: "Auto-identification failed - would show manual form",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Auto-identification test failed:', error);
    }
  };

  if (!isExpanded) {
    return (
      <div 
        className="fixed z-50" 
        style={getPositionClasses()}
      >
        <Button
          onClick={() => {
            console.log('🔵 User clicked to expand widget');
            setIsExpanded(true);
            sessionPersistence.updateWidgetState(true);
          }}
          className="h-14 w-14 rounded-full shadow-lg text-white hover:scale-105 transition-transform"
          style={{ backgroundColor: appearance.primaryColor }}
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        {appearance.minimizedText && (
          <div 
            className="absolute -top-12 right-0 bg-white text-gray-800 px-3 py-1 rounded-lg shadow-lg text-sm whitespace-nowrap"
            style={{ 
              backgroundColor: appearance.highlightColor,
              color: appearance.primaryColor 
            }}
          >
            {appearance.minimizedText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="fixed z-50 bg-background border rounded-lg shadow-xl" 
      style={getExpandedPositionClasses()}
    >
      <Card className="h-full flex flex-col">
        <CardHeader 
          className="flex flex-row items-center justify-between py-3 text-white rounded-t-lg shrink-0"
          style={{ backgroundColor: appearance.primaryColor }}
        >
          <div>
            <CardTitle className="text-sm font-medium">{appearance.headerText}</CardTitle>
            {appearance.subheaderText && (
              <p className="text-xs opacity-90 mt-1">{appearance.subheaderText}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Session Timer Countdown Badge */}
            {sessionTimer.timerState.isActive && sessionTimer.getRemainingMinutes() <= 5 && (
              <CountdownBadge
                remainingMinutes={sessionTimer.getRemainingMinutes()}
                showCountdown={true}
                variant={sessionTimer.getRemainingMinutes() <= 2 ? 'danger' : 'warning'}
              />
            )}
            
            {/* Quota Badges */}
            {aiSettings.enableDailyQuota && messageQuota.quotaState.remainingDaily <= (aiSettings.quotaWarningThreshold || 5) && (
              <QuotaBadge
                remaining={messageQuota.quotaState.remainingDaily}
                total={aiSettings.maxDailyMessages || 50}
                type="daily"
                showBadge={true}
                variant={messageQuota.quotaState.remainingDaily <= 2 ? 'danger' : 'warning'}
              />
            )}
            
            {aiSettings.enableHourlyQuota && messageQuota.quotaState.remainingHourly <= (aiSettings.quotaWarningThreshold || 5) && (
              <QuotaBadge
                remaining={messageQuota.quotaState.remainingHourly}
                total={aiSettings.maxHourlyMessages || 10}
                type="hourly"
                showBadge={true}
                variant={messageQuota.quotaState.remainingHourly <= 2 ? 'danger' : 'warning'}
              />
            )}
            
            {voice.enableVoiceCalls && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={handleVoiceCall}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            
            {/* Demo: Test Auto-identification Button (only show on widget settings page) */}
            {window.location.pathname.includes('/settings/widget') && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={handleTestAutoIdentification}
                title="Test Moodle Auto-identification (Demo)"
              >
                <User className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white hover:bg-white/20"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white hover:bg-white/20"
              onClick={() => {
                console.log('❌ User clicked to minimize widget');
                setIsExpanded(false);
                sessionPersistence.updateWidgetState(false);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Session Warning Banner */}
          {sessionTimer.timerState.showMaxDurationBanner && (
            <MaxDurationBanner
              remainingMinutes={sessionTimer.getRemainingMinutes()}
              onTalkToHuman={handleTalkToHuman}
              onExtendSession={sessionTimer.extendSession}
              onDismiss={() => sessionTimer.extendSession()}
              showTalkToHumanButton={aiSettings.showTalkToHumanButton}
            />
          )}

          {/* Quota Warning Banner */}
          {showQuotaWarning && (
            <QuotaWarningBanner
              quotaState={messageQuota.quotaState}
              onTalkToHuman={handleTalkToHuman}
              onDismiss={() => setShowQuotaWarning(false)}
              showTalkToHumanButton={aiSettings.showTalkToHumanButton || false}
              quotaWarningThreshold={aiSettings.quotaWarningThreshold || 5}
            />
          )}


          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <MessageRenderer
                key={message.id}
                message={message}
                appearance={appearance}
                aiSettings={aiSettings}
                conversationStatus={conversationState.status}
                onFeedback={handleFeedback}
                settings={settings}
                formData={userIdentification.formData}
                validationResult={userIdentification.validationResult}
                onUpdateFormData={userIdentification.updateFormData}
                onSubmitIdentification={async () => {
                  const success = await userIdentification.submitManualIdentification();
                  if (success && userIdentification.session) {
                    handleIdentificationComplete(userIdentification.session);
                  }
                  return success;
                }}
                onMoodleAuth={(session) => {
                  userIdentification.setIdentificationSession(session);
                  handleIdentificationComplete(session);
                }}
                isSubmittingIdentification={false}
                getIdentificationMethodPriority={() => {
                  const priority = userIdentification.getIdentificationMethodPriority();
                  if (priority.prioritizeMoodle) return 'moodle';
                  return priority.methods.includes('manual_form_submission') ? 'manual' : 'moodle';
                }}
              />
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: appearance.secondaryColor }}
                  >
                    AI
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Action Buttons Area */}
          {conversationState.status === 'active' && messages.length > 1 && (
            <div className="border-t px-4 py-2 bg-muted/30 space-y-2">
              {/* Talk to Human Button */}
              {aiSettings.showTalkToHumanButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTalkToHuman}
                  className="w-full text-xs"
                >
                  <User className="h-3 w-3 mr-1" />
                  {aiSettings.talkToHumanButtonText || 'Talk to Human Agent'}
                </Button>
              )}
              
              {/* End Conversation Button */}
              {aiSettings.showEndConversationButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={confirmEndConversation}
                  className="w-full text-xs"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  {aiSettings.endConversationButtonText || 'End Conversation'}
                </Button>
              )}
            </div>
          )}

          {/* Conversation Status Indicators */}
          {conversationState.status === 'waiting_human' && (
            <div className="border-t px-4 py-3 bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-center text-sm text-yellow-800">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                Waiting for human agent...
              </div>
            </div>
          )}

          {conversationState.status === 'idle_timeout' && (
            <div className="border-t px-4 py-3 bg-orange-50 border-orange-200">
              <div className="text-center text-sm text-orange-800">
                Session ended due to inactivity
              </div>
            </div>
          )}

          {conversationState.status === 'max_session' && (
            <div className="border-t px-4 py-3 bg-red-50 border-red-200">
              <div className="text-center text-sm text-red-800 space-y-2">
                <div>Session limit reached</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTalkToHuman}
                  className="text-xs"
                >
                  <User className="h-3 w-3 mr-1" />
                  Talk to Human Agent
                </Button>
              </div>
            </div>
          )}

          {conversationState.status === 'quota_exceeded' && (
            <div className="border-t px-4 py-3 bg-red-50 border-red-200">
              <div className="text-center text-sm text-red-800 space-y-2">
                <div>Message limit reached</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTalkToHuman}
                  className="text-xs"
                >
                  <User className="h-3 w-3 mr-1" />
                  Talk to Human Agent
                </Button>
              </div>
            </div>
          )}

          {conversationState.status === 'ended' && (
            <div className="border-t px-4 py-3 bg-gray-50 border-gray-200">
              <div className="text-center text-sm text-gray-800">
                Conversation ended
              </div>
            </div>
          )}

          {/* Input Area */}
          {conversationState.status === 'active' || conversationState.status === 'waiting_human' ? (
            <div className="border-t p-4 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleFileUpload}
                    disabled={conversationState.status !== 'active'}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  {voice.enableVoiceCalls && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${isRecording ? 'text-red-500' : ''}`}
                      onClick={handleVoiceRecording}
                      disabled={conversationState.status !== 'active'}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
                
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    conversationState.status === 'waiting_human' 
                      ? "Waiting for human agent..." 
                      : "Type your message..."
                  }
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={conversationState.status !== 'active'}
                />
                
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="h-8 w-8 text-white relative"
                  style={{ backgroundColor: appearance.highlightColor }}
                  disabled={
                    !inputValue.trim() || 
                    conversationState.status !== 'active' || 
                    !messageQuota.canSendMessage ||
                    !spamPrevention.canSendMessage
                  }
                >
                  <Send className="h-4 w-4" />
                  {spamPrevention.spamState.isInCooldown && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {spamPrevention.formatCooldownTime()}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* New Components for Enhanced Features */}
      {showFAQBrowser && (
        <div className="absolute inset-0 bg-background z-10">
          <FAQBrowser
            onClose={() => setShowFAQBrowser(false)}
            onSelectFAQ={handleFAQSelect}
          />
        </div>
      )}

      {isConversationClosed && (
        <div className="absolute inset-0 bg-background z-10">
          <ChatClosedState
            onStartNewChat={handleStartNewChat}
            primaryColor={appearance.primaryColor}
            assistantName={aiSettings.assistantName}
          />
        </div>
      )}

      {showPostChatFeedback && (
        <div className="absolute inset-0 bg-background z-10">
          <PostChatFeedback
            conversationId={sessionPersistence.currentSession?.conversationId || ''}
            onSubmit={handlePostChatFeedbackSubmit}
            onSkip={() => setShowPostChatFeedback(false)}
          />
        </div>
      )}

      {showMoodleReLoginPrompt && (
        <div className="absolute inset-4 bg-background z-10 rounded-lg border shadow-lg">
          <MoodleReLoginPrompt
            onReLogin={handleMoodleReLogin}
            onDismiss={() => setShowMoodleReLoginPrompt(false)}
            previousSessionData={{
              username: userIdentification.session?.userData?.studentId,
              lastActive: sessionPersistence.currentSession?.timestamp.toISOString()
            }}
          />
        </div>
      )}


      {/* Conversation End Modal */}
      <ConversationEndModal
        isOpen={showEndConfirmation}
        onClose={cancelEndConversation}
        onConfirm={handleEndConversationWithFeedback}
        appearance={appearance}
      />
    </div>
  );
}