import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Maximize2, Minimize2, Send, Paperclip, Mic, MicOff, Phone, User, LogOut, Book, Home, MessageSquare, FileText, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoodleLoginButton } from "@/components/widget/MoodleLoginButton";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { useToast } from "@/hooks/use-toast";
import { useConversationLifecycle } from "@/hooks/useConversationLifecycle";
import { useMessageQuota } from "@/hooks/useMessageQuota";
import { useSpamPrevention } from "@/hooks/useSpamPrevention";
import { useUserIdentification } from "@/hooks/useUserIdentification";
import { useMoodleAutoIdentification } from "@/hooks/useMoodleAutoIdentification";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { useTenant } from "@/contexts/TenantContext";
import { ConversationEndModal } from "./ConversationEndModal";
import { CountdownBadge } from "@/components/widget/CountdownBadge";
import { MaxDurationBanner } from "@/components/widget/MaxDurationBanner";
import { QuotaBadge } from "@/components/widget/QuotaBadge";
import { QuotaWarningBanner } from "@/components/widget/QuotaWarningBanner";
import { MessageRenderer } from "@/components/widget/messages/MessageRenderer";
import { FAQBrowser } from "@/components/widget/FAQBrowser";
import { ResourceBrowser } from "@/components/widget/ResourceBrowser";
import { ChatClosedState } from "@/components/widget/ChatClosedState";
import { PostChatFeedback } from "@/components/widget/PostChatFeedback";
import { MoodleReLoginPrompt } from "@/components/widget/MoodleReLoginPrompt";
import { useResources } from "@/hooks/useResources";
import { useChats } from "@/hooks/useChats";
import { useFAQSearch } from "@/hooks/useFAQSearch";
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
  const [showResourceBrowser, setShowResourceBrowser] = useState(false);
  const [showPostChatFeedback, setShowPostChatFeedback] = useState(false);
  const [showMoodleReLoginPrompt, setShowMoodleReLoginPrompt] = useState(false);
  const [isConversationClosed, setIsConversationClosed] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'messages' | 'resources'>('home');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPanel, setCurrentPanel] = useState<'main' | 'chat' | 'faq-detail' | 'resource-detail' | 'message-detail'>('main');
  const [selectedFAQ, setSelectedFAQ] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [hasActiveChat, setHasActiveChat] = useState(false);
  const [lastDetailPanel, setLastDetailPanel] = useState<'faq-detail' | 'resource-detail' | 'message-detail' | null>(null);
  const [hasUserSentFirstMessage, setHasUserSentFirstMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { settings } = useWidgetSettings();
  const { currentOrg } = useTenant();
  const { toast } = useToast();
  const { resources, loading: resourcesLoading, searchResources } = useResources();
  const { chats, loading: chatsLoading } = useChats();
  const { faqs, searchQuery: faqQuery, handleSearch, isLoading: faqLoading } = useFAQSearch();
  
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

  // Track if there's an active chat session
  useEffect(() => {
    setHasActiveChat(messages.length > 0 && conversationState.status === 'active');
  }, [messages.length, conversationState.status]);

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
    
    const baseStyle = { width: '384px', height: '625px' };
    
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

    // Check if user identification is required (only for subsequent messages, not the first)
    const isFirstMessage = !hasUserSentFirstMessage;
    if (!isFirstMessage && !userIdentification.canSendMessage()) {
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

    // Mark that user has sent their first message
    if (isFirstMessage) {
      setHasUserSentFirstMessage(true);
    }

    // Simulate AI response with user context (only for non-welcome messages)
    setTimeout(() => {
      const isWelcomeMessage = messages.length === 0 || 
        (messages.length === 1 && messages[0].type === 'ai' && messages[0].content.includes(settings?.aiSettings?.welcomeMessage || ''));
      
      const userContext = userIdentification.getUserContext();
      const contextSuffix = !isWelcomeMessage && userContext ? ` (${userContext})` : '';
      
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

      // After AI responds to first message, check if identification is needed
      if (isFirstMessage && userIdentification.isRequired && !userIdentification.isCompleted) {
        // Show identification form after AI response (auto-identification happens on widget load)
        setTimeout(() => {
          const identificationMessage: Message = {
            id: `identification_${Date.now()}`,
            type: 'identification',
            timestamp: new Date(),
            isCompleted: false
          };
          setMessages(prev => [...prev, identificationMessage]);
          sessionPersistence.addMessage(identificationMessage, isExpanded);
        }, 500);
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
    // When FAQ is selected, we want to enable messaging mode as well
    setActiveTab('home');
  };

  const handleResourceSelect = (title: string, content: string) => {
    const resourceMessage: Message = {
      id: `resource_${Date.now()}`,
      type: 'ai',
      content: `**${title}**\n\n${content}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, resourceMessage]);
    sessionPersistence.addMessage(resourceMessage, isExpanded);
    setShowResourceBrowser(false);
    setActiveTab('home');
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

  // Panel navigation handlers
  const handleStartChat = () => {
    setCurrentPanel('chat');
    
    // Initialize welcome message if no messages exist
    if (messages.length === 0 && settings?.aiSettings?.welcomeMessage) {
      console.log('📝 Creating welcome message for new chat');
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: settings.aiSettings.welcomeMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      sessionPersistence.createNewSession(welcomeMessage, isExpanded);
      startAISession(); // Start the conversation lifecycle
    }
  };

  const handleContinueChat = () => {
    setCurrentPanel('chat');
    
    // If no messages but we have an active session, restore or create welcome message
    if (messages.length === 0 && settings?.aiSettings?.welcomeMessage) {
      console.log('📝 Restoring/creating welcome message for existing chat session');
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: settings.aiSettings.welcomeMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      if (!sessionPersistence.currentSession) {
        sessionPersistence.createNewSession(welcomeMessage, isExpanded);
      }
    }
  };

  const handleBackToMain = () => {
    setCurrentPanel('main');
    // Remember which tab to return to when going back to detail
    if (currentPanel === 'faq-detail' || currentPanel === 'resource-detail' || currentPanel === 'message-detail') {
      setLastDetailPanel(currentPanel);
    }
  };

  const handleFAQDetail = (faq: any) => {
    setSelectedFAQ(faq);
    setCurrentPanel('faq-detail');
    setLastDetailPanel('faq-detail');
  };

  const handleResourceDetail = (resource: any) => {
    setSelectedResource(resource);
    setCurrentPanel('resource-detail');
    setLastDetailPanel('resource-detail');
  };

  const handleMessageDetail = (chat: any) => {
    setSelectedChat(chat);
    setCurrentPanel('message-detail');
    setLastDetailPanel('message-detail');
  };

  const handleUseFAQInChat = (faq: any) => {
    // Add FAQ to chat
    const faqMessage: Message = {
      id: `faq_${Date.now()}`,
      type: 'ai',
      content: `**${faq.question}**\n\n${faq.answer}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, faqMessage]);
    sessionPersistence.addMessage(faqMessage, isExpanded);
    
    // Navigate to chat panel
    setCurrentPanel('chat');
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

  const renderPanelContent = () => {
    switch (currentPanel) {
      case 'main':
        return renderMainPanel();
      case 'chat':
        return renderChatPanel();
      case 'faq-detail':
        return renderFAQDetailPanel();
      case 'resource-detail':
        return renderResourceDetailPanel();
      case 'message-detail':
        return renderMessageDetailPanel();
      default:
        return renderMainPanel();
    }
  };

  const renderMainPanel = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-4">
            {/* Welcome Greeting */}
            <div className="text-center py-4">
              <h2 className="text-lg font-semibold text-foreground">
                {aiSettings.welcomeMessage || "How can we help you today?"}
              </h2>
            </div>

            {/* Chat Button */}
            <div className="space-y-3">
              <Button
                onClick={hasActiveChat ? handleContinueChat : handleStartChat}
                className="w-full text-white py-3 text-base font-medium"
                style={{ backgroundColor: appearance.primaryColor }}
              >
                Chat With Us
              </Button>
            </div>

            {/* FAQ Search */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={faqQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search frequently asked questions..."
                  className="pl-10"
                />
              </div>
              
              {faqLoading ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Loading FAQs...
                </div>
              ) : faqs.length > 0 ? (
                <div className="space-y-2">
                  {faqs.slice(0, 5).map((faq) => (
                    <div
                      key={faq.id}
                      className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleFAQDetail(faq)}
                    >
                      <h3 className="font-medium text-sm text-foreground">{faq.question}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              ) : faqQuery ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No FAQs found matching "{faqQuery}"
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Type above to search FAQs
                </div>
              )}
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-4">
            {userIdentification.session ? (
              <div>
                {chatsLoading ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Loading chat history...
                  </div>
                ) : chats.length > 0 ? (
                  <div className="space-y-3">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleMessageDetail(chat)}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-sm text-foreground">
                            {new Date(chat.timestamp).toLocaleDateString()}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            chat.status === 'active' ? 'bg-green-100 text-green-800' :
                            chat.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {chat.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {chat.messages.length} messages
                        </p>
                        {chat.messages.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            Last: {chat.messages[chat.messages.length - 1]?.content}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No previous conversations</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground mb-2">Sign in to view messages</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to access your chat history and previous conversations.
                </p>
                <p className="text-sm text-muted-foreground">
                  Start a chat to complete your identification and access message history.
                </p>
              </div>
            )}
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-4">

            {resourcesLoading ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Loading resources...
              </div>
            ) : (
              <div className="space-y-3">
                {searchResources(searchQuery).map((resource) => (
                  <div
                    key={resource.id}
                    className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleResourceDetail(resource)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {resource.type === 'document' && <FileText className="h-5 w-5 text-blue-500" />}
                        {resource.type === 'video' && <FileText className="h-5 w-5 text-red-500" />}
                        {resource.type === 'link' && <FileText className="h-5 w-5 text-green-500" />}
                        {resource.type === 'template' && <FileText className="h-5 w-5 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {resource.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {resource.aiInstructions}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {searchResources(searchQuery).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchQuery ? `No resources found for "${searchQuery}"` : 'No resources available'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderChatPanel = () => {
    return (
      <div className="h-full flex flex-col">
        {/* Chat Messages - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageRenderer
              key={message.id}
              message={message}
              appearance={{
                primaryColor: appearance.primaryColor,
                secondaryColor: appearance.secondaryColor,
                highlightColor: appearance.highlightColor
              }}
              aiSettings={{
                assistantName: aiSettings.assistantName,
                enableFeedback: aiSettings.enableFeedback
              }}
              conversationStatus={conversationState.status}
              onFeedback={handleFeedback}
              settings={settings}
              formData={userIdentification.formData}
              validationResult={userIdentification.validationResult}
              onUpdateFormData={userIdentification.updateFormData}
              onSubmitIdentification={userIdentification.submitManualIdentification}
              onMoodleAuth={(session: any) => userIdentification.setIdentificationSession(session)}
              getIdentificationMethodPriority={() => {
                const priority = userIdentification.getIdentificationMethodPriority();
                return priority.prioritizeMoodle ? 'moodle' : 'manual';
              }}
            />
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground p-3 rounded-lg max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Input Area */}
        <div className="border-t border-border bg-background pt-4 px-4 pb-4 shrink-0">
          {/* User identification form if required */}
          {hasUserSentFirstMessage && !userIdentification.canSendMessage() && (
            <div className="mb-4 p-4 bg-muted rounded-lg space-y-3">
              <div className="text-sm font-medium">Complete your identification to continue:</div>
              
              {/* Manual identification form */}
              {settings?.userInfo?.enableManualForm && (
                <div className="space-y-3">
                  {settings.userInfo.requiredFields.name && (
                    <div className="space-y-1">
                      <Label htmlFor="id-name" className="text-xs">Name</Label>
                      <Input
                        id="id-name"
                        type="text"
                        value={userIdentification.formData.name}
                        onChange={(e) => userIdentification.updateFormData('name', e.target.value)}
                        className="text-sm h-8"
                      />
                      {userIdentification.validationResult?.errors.name && (
                        <p className="text-xs text-destructive">{userIdentification.validationResult.errors.name}</p>
                      )}
                    </div>
                  )}

                  {settings.userInfo.requiredFields.email && (
                    <div className="space-y-1">
                      <Label htmlFor="id-email" className="text-xs">Email</Label>
                      <Input
                        id="id-email"
                        type="email"
                        value={userIdentification.formData.email}
                        onChange={(e) => userIdentification.updateFormData('email', e.target.value)}
                        className="text-sm h-8"
                      />
                      {userIdentification.validationResult?.errors.email && (
                        <p className="text-xs text-destructive">{userIdentification.validationResult.errors.email}</p>
                      )}
                    </div>
                  )}

                  {settings.userInfo.requiredFields.mobile && (
                    <div className="space-y-1">
                      <Label htmlFor="id-mobile" className="text-xs">Mobile</Label>
                      <Input
                        id="id-mobile"
                        type="tel"
                        value={userIdentification.formData.mobile}
                        onChange={(e) => userIdentification.updateFormData('mobile', e.target.value)}
                        className="text-sm h-8"
                      />
                      {userIdentification.validationResult?.errors.mobile && (
                        <p className="text-xs text-destructive">{userIdentification.validationResult.errors.mobile}</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={userIdentification.submitManualIdentification}
                      className="flex-1 text-sm h-8"
                      style={{ 
                        backgroundColor: appearance.primaryColor,
                        color: '#ffffff'
                      }}
                    >
                      Continue
                    </Button>
                    
                    {/* Moodle login button if enabled */}
                    {settings?.userInfo?.enableMoodleAuth && settings?.integrations?.moodle?.enabled && (
                      <MoodleLoginButton
                        config={settings.integrations.moodle}
                        onAuthSuccess={(session) => userIdentification.setIdentificationSession(session)}
                        onAuthError={(error) => console.error('Moodle auth error:', error)}
                        appearance={{
                          primaryColor: appearance.primaryColor,
                          textColor: '#ffffff'
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    !hasUserSentFirstMessage || userIdentification.canSendMessage() 
                      ? "Type your message..." 
                      : "Complete identification to send messages"
                  }
                  className="min-h-[40px] pr-24"
                  disabled={hasUserSentFirstMessage && !userIdentification.canSendMessage()}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={handleFileUpload}
                    disabled={!userIdentification.canSendMessage()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={handleVoiceRecording}
                    disabled={!userIdentification.canSendMessage()}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={!inputValue.trim() || (hasUserSentFirstMessage && !userIdentification.canSendMessage())}
                style={{ backgroundColor: appearance.primaryColor, color: '#ffffff' }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleVoiceCall}
                disabled={!userIdentification.canSendMessage()}
              >
                <Phone className="h-4 w-4 mr-2" />
                Voice Call
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleTalkToHuman}
                disabled={!userIdentification.canSendMessage()}
              >
                <User className="h-4 w-4 mr-2" />
                Talk to Human
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderFAQDetailPanel = () => {
    if (!selectedFAQ) return null;
    
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{selectedFAQ.question}</CardTitle>
              <div className="flex gap-1 flex-wrap">
                {selectedFAQ.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {selectedFAQ.answer}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderResourceDetailPanel = () => {
    if (!selectedResource) return null;
    
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{selectedResource.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Type</h4>
                <p className="text-sm text-muted-foreground capitalize">{selectedResource.type}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedResource.aiInstructions}</p>
              </div>

              {selectedResource.contentPreview && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Preview</h4>
                  <p className="text-sm text-muted-foreground">{selectedResource.contentPreview}</p>
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  size="sm" 
                  onClick={() => window.open(selectedResource.url, '_blank')}
                  className="w-full"
                  style={{ backgroundColor: appearance.primaryColor }}
                >
                  View Resource
                  <FileText className="h-3 w-3 ml-1" />
                </Button>
                
                {selectedResource.fileName && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(selectedResource.url, '_blank')}
                    className="w-full"
                  >
                    Download ({selectedResource.fileSize ? `${Math.round(selectedResource.fileSize / 1024)}KB` : 'Unknown size'})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderMessageDetailPanel = () => {
    if (!selectedChat) return null;
    
    return (
      <div className="space-y-4">
        {/* Header with date and AI summary */}
        <div className="bg-muted/30 p-3 rounded-lg border">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-foreground">
              {new Date(selectedChat.timestamp).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              selectedChat.status === 'active' ? 'bg-green-100 text-green-800' :
              selectedChat.status === 'ended' ? 'bg-gray-100 text-gray-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {selectedChat.status}
            </span>
          </div>
          <div className="bg-primary/5 p-2 rounded border-l-2 border-primary/20">
            <p className="text-xs font-medium text-primary mb-1">AI Summary</p>
            <p className="text-xs text-muted-foreground">
              {selectedChat.summary || `Conversation with ${selectedChat.messages.length} messages. Topics discussed include customer support inquiries and general assistance.`}
            </p>
          </div>
        </div>
        
        {/* Messages */}
        {selectedChat.messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      className="fixed z-50 bg-background border rounded-lg shadow-xl max-w-sm sm:max-w-md lg:max-w-lg" 
      style={getExpandedPositionClasses()}
    >
      <Card className="h-full flex flex-col">
        <CardHeader 
          className="flex flex-row items-center justify-between py-3 text-white rounded-t-lg shrink-0"
          style={{ backgroundColor: appearance.primaryColor }}
        >
          <div className="flex items-center gap-2 flex-1">
            {/* Conditional content based on current panel */}
            {currentPanel === 'main' && activeTab === 'home' && (
              <div className="flex items-center gap-3">
                {currentOrg?.logoUrl && (
                  <img 
                    src={currentOrg.logoUrl} 
                    alt="Organization Logo" 
                    className="h-8 w-8 rounded object-contain bg-white/10 p-1"
                  />
                )}
                <div>
                  <CardTitle className="text-sm font-medium">{appearance.headerText}</CardTitle>
                  {appearance.subheaderText && (
                    <p className="text-xs opacity-90 mt-1">{appearance.subheaderText}</p>
                  )}
                </div>
              </div>
            )}
            {currentPanel === 'main' && activeTab === 'messages' && (
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
            )}
            {currentPanel === 'main' && activeTab === 'resources' && (
              <div className="flex items-center gap-3 flex-1">
                <CardTitle className="text-sm font-medium">Resources</CardTitle>
                <div className="flex-1 max-w-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-white/70" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search resources..."
                      className="pl-9 h-7 text-xs bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                    />
                  </div>
                </div>
              </div>
            )}
            {currentPanel === 'resource-detail' && selectedResource && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleBackToMain} className="p-0 h-auto text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-sm font-medium">{selectedResource.title}</CardTitle>
              </div>
            )}
            {currentPanel === 'faq-detail' && selectedFAQ && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleBackToMain} className="p-0 h-auto text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-sm font-medium">FAQ</CardTitle>
              </div>
            )}
            {currentPanel === 'message-detail' && selectedChat && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleBackToMain} className="p-0 h-auto text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
              </div>
            )}
            {currentPanel === 'chat' && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleBackToMain} className="p-0 h-auto text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-sm font-medium">Chat</CardTitle>
              </div>
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
          {/* Main Content Area */}
          {currentPanel === 'chat' ? (
            // For chat panel, render directly without extra padding/scrolling
            renderPanelContent()
          ) : (
            // For other panels, use scrollable container with padding
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {renderPanelContent()}
              </div>
            </div>
          )}

          {/* Bottom Navigation - Fixed at bottom, only show on main panel */}
          {currentPanel === 'main' && (
            <div className="border-t bg-background p-1 shrink-0">
              <div className="flex justify-around">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('home')}
                  className={`flex-1 flex-col h-auto py-1 space-y-0.5 text-xs ${
                    activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Home className="h-3 w-3" />
                  <span>Home</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveTab('messages');
                    // If we have a last detail panel and we're coming back to messages, restore that panel
                    if (currentPanel === 'main' && lastDetailPanel === 'message-detail' && selectedChat) {
                      setCurrentPanel('message-detail');
                    }
                  }}
                  className={`flex-1 flex-col h-auto py-1 space-y-0.5 text-xs ${
                    activeTab === 'messages' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Messages</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('resources')}
                  className={`flex-1 flex-col h-auto py-1 space-y-0.5 text-xs ${
                    activeTab === 'resources' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  <span>Resources</span>
                </Button>
              </div>
            </div>
          )}
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

      {showResourceBrowser && (
        <div className="absolute inset-0 bg-background z-10">
          <ResourceBrowser
            onClose={() => setShowResourceBrowser(false)}
            onSelectResource={handleResourceSelect}
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