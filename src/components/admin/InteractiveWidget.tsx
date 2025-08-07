/**
 * Refactored Interactive Widget Component
 * Now uses modular components and custom hooks for better maintainability
 */

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChatWidgetHeader } from "@/components/widget/chat/ChatWidgetHeader";
import { ChatPanel } from "@/components/widget/chat/ChatPanel";
import { NavigationTabs } from "@/components/widget/chat/NavigationTabs";
import { MainPanel } from "@/components/widget/chat/MainPanel";
import { FAQDetailPanel, ResourceDetailPanel, MessageDetailPanel } from "@/components/widget/chat/DetailPanels";
import { useWidgetState } from "@/hooks/widget/useWidgetState";
import { useWidgetActions } from "@/hooks/widget/useWidgetActions";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { useWelcomeMessage } from "@/hooks/widget/useWelcomeMessage";
import { useWidgetInteractionHandler } from "@/hooks/widget/useWidgetInteractionHandler";
import { useWidgetStabilization } from "@/hooks/widget/useWidgetStabilization";
import { useWidgetDOMCleaner } from "@/hooks/widget/useWidgetDOMCleaner";
import { useToast } from "@/hooks/use-toast";
import { useConversationLifecycle } from "@/hooks/useConversationLifecycle";
import { useMessageQuota } from "@/hooks/useMessageQuota";
import { useSpamPrevention } from "@/hooks/useSpamPrevention";
import { useUserIdentification } from "@/hooks/useUserIdentification";
import { useMoodleAutoIdentification } from "@/modules/moodle/hooks/useMoodleAutoIdentification";
import { useConversationPersistence } from "@/hooks/useConversationPersistence";
import { useMessageRecoveryEnhanced } from "@/hooks/useMessageRecoveryEnhanced";
import { useTenant } from "@/contexts/TenantContext";
import { ConversationEndModal } from "./ConversationEndModal";
import { ConversationDebugPanel } from "./ConversationDebugPanel";
import { FAQBrowser } from "@/components/widget/FAQBrowser";
import { ResourceBrowser } from "@/components/widget/ResourceBrowser";
import { ChatClosedState } from "@/components/widget/ChatClosedState";
import { PostChatFeedback } from "@/components/widget/PostChatFeedback";

import { useResources } from "@/hooks/useResources";
import { useChats } from "@/hooks/useChats";
import { useFAQSearch } from "@/hooks/useFAQSearch";
import { CustomerService } from "@/services/customerService";
import { IdentificationSession } from "@/types/user-identification";
import { LoadingOverlay } from "@/components/widget/LoadingOverlay";

export function InteractiveWidget() {
  const { settings } = useWidgetSettings();
  const { currentOrg } = useTenant();
  const { toast } = useToast();
  
  // Data hooks
  const { resources, loading: resourcesLoading, searchResources } = useResources();
  const { chats, loading: chatsLoading } = useChats();
  const { faqs, searchQuery: faqQuery, handleSearch, isLoading: faqLoading } = useFAQSearch();
  
  // Conversation persistence - no callback to avoid circular dependency
  const conversationPersistence = useConversationPersistence();

  // Initialize widget state management
  const widgetState = useWidgetState({ settings, conversationPersistence });
  
  // Enhanced message recovery with bidirectional sync
  const messageRecovery = useMessageRecoveryEnhanced({
    messages: widgetState.messages,
    conversationPersistence,
    setMessages: widgetState.setMessages,
    debugMode: process.env.NODE_ENV === 'development'
  });

  // Conversation lifecycle
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
      } catch (error) {
        // Silent error handling - customer creation failures are logged internally
      }
      
      // Call the widget actions identification complete handler
      widgetActions.handleIdentificationComplete(session);
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
      } catch (error) {
        // Silent error handling - customer creation failures are logged internally
      }
      
      // Show auto-identification success message
      const autoWelcomeMessage = {
        id: `auto_welcome_${Date.now()}`,
        type: 'ai' as const,
        content: `Welcome back, ${session.userData.name || 'Student'}! I can see you're logged into Moodle. How can I assist you today?`,
        timestamp: new Date()
      };
      widgetState.setMessages(prev => [...prev, autoWelcomeMessage]);
      conversationPersistence.addMessage(autoWelcomeMessage, widgetState.isExpanded);
    },
    onAutoIdentificationError: (error) => {
      // Silent error handling - auto-identification failures are expected behavior
    }
  });

  // Initialize interaction handler
  const interactionHandler = useWidgetInteractionHandler(
    widgetState.loadingStateManager,
    process.env.NODE_ENV === 'development'
  );

  // Initialize stabilization system
  const stabilization = useWidgetStabilization(widgetState.loadingStateManager, {
    debugMode: process.env.NODE_ENV === 'development'
  });

  // Initialize DOM cleaner to fix stuck elements
  const domCleaner = useWidgetDOMCleaner({
    debugMode: process.env.NODE_ENV === 'development'
  });

  // Initialize widget actions
  const widgetActions = useWidgetActions({
    settings,
    conversationPersistence,
    conversationState,
    messageQuota,
    spamPrevention,
    userIdentification,
    isExpanded: widgetState.isExpanded,
    hasUserSentFirstMessage: widgetState.hasUserSentFirstMessage,
    messages: widgetState.messages,
    setMessages: widgetState.setMessages,
    setIsRecording: widgetState.setIsRecording,
    setInputValue: widgetState.setInputValue,
    setHasUserSentFirstMessage: widgetState.setHasUserSentFirstMessage,
    incrementMessageCount,
    startAISession,
    requestHumanAgent,
    handleConfirmedEnd,
    loadingStateManager: widgetState.loadingStateManager
  });


  // Restore widget state when conversation state and settings are both available
  useEffect(() => {
    if (conversationPersistence.isLoading || !conversationPersistence.conversationState || !settings) return;
    
    const determineWidgetExpandState = (state: any, settings: any): boolean => {
      if (!state || !settings) return false;
      
      // For pending_identification sessions, preserve the state's expand state
      if (state.status === 'pending_identification') {
        return state.isExpanded;
      }
      
      // Never auto-expand if conversation is completed
      if (state.status === 'completed') {
        return false;
      }
      
      // If state has explicit isExpanded state, use it
      if (typeof state.isExpanded === 'boolean') {
        return state.isExpanded;
      }
      
      // Fall back to autoOpenWidget setting for active conversations with messages
      return settings.appearance?.autoOpenWidget && state.messages?.length > 0;
    };

    const shouldExpand = determineWidgetExpandState(conversationPersistence.conversationState, settings);
    
    if (shouldExpand !== widgetState.isExpanded) {
      widgetState.handleExpand();
    }
  }, [conversationPersistence.isLoading, conversationPersistence.conversationState, settings]);

  // Welcome message management - isolated to prevent interaction conflicts
  const welcomeMessageConfig = {
    welcomeMessage: settings?.aiSettings?.welcomeMessage,
    enabled: !!settings?.aiSettings?.welcomeMessage
  };
  const welcomeMessage = useWelcomeMessage(widgetState, conversationPersistence, welcomeMessageConfig);

  // Reset session quota when conversation ends
  useEffect(() => {
    if (conversationState.status === 'ended') {
      messageQuota.resetSessionQuota();
      spamPrevention.resetCooldown();
      conversationPersistence.updateConversationState({ status: 'completed' });
      
      // Show post-chat feedback for human-handled conversations
      widgetState.setShowPostChatFeedback(false); // Disabled for now since property doesn't exist
    }
  }, [conversationState.status, messageQuota, spamPrevention, conversationPersistence]);

  // Handle post-chat feedback submission
  const handlePostChatFeedbackSubmit = async (feedback: { rating: number; comment: string }) => {
    try {
      await fetch('/mocks/post-chat-feedback.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationPersistence.conversationState?.conversationId,
          ...feedback,
          timestamp: new Date().toISOString()
        })
      });
      widgetState.setShowPostChatFeedback(false);
    } catch (error) {
      throw error;
    }
  };


  // Handle FAQ use in chat
  const handleUseFAQInChat = (faq: any) => {
    const faqMessage = {
      id: `faq_${Date.now()}`,
      type: 'ai' as const,
      content: `**${faq.question}**\n\n${faq.answer}`,
      timestamp: new Date()
    };
    widgetState.setMessages(prev => [...prev, faqMessage]);
    conversationPersistence.addMessage(faqMessage, widgetState.isExpanded);
    
    // Navigate to chat panel
    widgetState.setCurrentPanel('chat');
  };

  // Handle tab changes with special logic for messages tab
  const handleMessageTabClick = () => {
    widgetState.setActiveTab('messages');
    if (widgetState.currentPanel === 'main' && widgetState.lastDetailPanel === 'message-detail' && widgetState.selectedChat) {
      widgetState.setCurrentPanel('message-detail');
    }
  };

  if (!settings) return null;

  const { appearance, aiSettings, voice } = settings;

  // Render collapsed widget button
  if (!widgetState.isExpanded) {
    return (
      <div 
        className="fixed z-50" 
        style={widgetState.getPositionClasses()}
      >
        <Button
          onClick={widgetState.handleExpand}
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

  // Render panel content based on current panel
  const renderPanelContent = () => {
    switch (widgetState.currentPanel) {
      case 'main':
        return (
          <MainPanel
            activeTab={widgetState.activeTab}
            hasActiveChat={widgetState.hasActiveChat}
            onStartChat={widgetState.handleStartChat}
            onContinueChat={widgetState.handleContinueChat}
            onFAQDetail={widgetState.handleFAQDetail}
            onResourceDetail={widgetState.handleResourceDetail}
            onMessageDetail={widgetState.handleMessageDetail}
            appearance={appearance}
            aiSettings={aiSettings}
            searchQuery={widgetState.searchQuery}
            onSearchChange={widgetState.setSearchQuery}
            faqQuery={faqQuery}
            onFAQSearch={handleSearch}
            faqs={faqs}
            resources={resources}
            chats={chats as any}
            faqLoading={faqLoading}
            resourcesLoading={resourcesLoading}
            chatsLoading={chatsLoading}
            searchResources={searchResources}
            userIdentification={userIdentification as any}
          />
        );
      case 'chat':
        return (
          <ChatPanel
            messages={widgetState.messages}
            inputValue={widgetState.inputValue}
            onInputChange={widgetState.setInputValue}
            onSendMessage={() => widgetActions.handleSendMessage(widgetState.inputValue)}
            onFileUpload={widgetActions.handleFileUpload}
            onVoiceRecording={widgetActions.handleVoiceRecording}
            onVoiceCall={widgetActions.handleVoiceCall}
            onTalkToHuman={widgetActions.handleTalkToHuman}
            onFeedback={widgetActions.handleFeedback}
            isTyping={widgetState.isTyping}
            isRecording={widgetState.isRecording}
            hasUserSentFirstMessage={widgetState.hasUserSentFirstMessage}
            canSendMessage={userIdentification.canSendMessage()}
            settings={settings}
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
            userIdentification={userIdentification}
          />
        );
      case 'faq-detail':
        return <FAQDetailPanel selectedFAQ={widgetState.selectedFAQ} />;
      case 'resource-detail':
        return <ResourceDetailPanel selectedResource={widgetState.selectedResource} appearance={appearance} />;
      case 'message-detail':
        return <MessageDetailPanel selectedChat={widgetState.selectedChat} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed z-50 bg-background border rounded-lg shadow-xl max-w-sm sm:max-w-md lg:max-w-lg" 
      style={widgetState.getExpandedPositionClasses()}
      onClick={(e) => {
        // Only handle non-critical interactions
        const target = e.target as HTMLElement;
        const isCritical = target.closest('button, [role="button"], input, textarea, select');
        if (!isCritical) {
          interactionHandler.handleInteraction(e, 'click');
        }
      }}
    >
      <Card className="h-full flex flex-col relative">
        <ChatWidgetHeader
          currentPanel={widgetState.currentPanel}
          activeTab={widgetState.activeTab}
          appearance={appearance}
          currentOrg={currentOrg}
          selectedResource={widgetState.selectedResource}
          selectedFAQ={widgetState.selectedFAQ}
          selectedChat={widgetState.selectedChat}
          searchQuery={widgetState.searchQuery}
          onSearchChange={widgetState.setSearchQuery}
          onBackToMain={widgetState.handleBackToMain}
          onToggleMaximize={widgetState.handleToggleMaximize}
          onMinimize={widgetState.handleMinimize}
          onVoiceCall={widgetActions.handleVoiceCall}
          isMaximized={widgetState.isMaximized}
          enableVoiceCalls={voice.enableVoiceCalls}
          sessionTimer={sessionTimer}
        />

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Debug Panel - Show in development */}
          {messageRecovery.debugMode && (
            <ConversationDebugPanel
              messageRecovery={messageRecovery}
              conversationState={conversationPersistence.conversationState}
              currentMessages={widgetState.messages}
            />
          )}
          
          {/* Interaction Debug - Show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground p-2 border-b">
              Loading: {widgetState.loadingStateManager.activeOperations.length} ops | 
              Protected: {widgetState.loadingStateManager.hasBlockingOperation ? 'Yes' : 'No'}
            </div>
          )}
          
          {/* Main Content Area */}
          {widgetState.currentPanel === 'chat' ? (
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
          {widgetState.currentPanel === 'main' && (
            <NavigationTabs
              activeTab={widgetState.activeTab}
              onTabChange={widgetState.handleTabChange}
              onMessageTabClick={handleMessageTabClick}
            />
          )}
        </CardContent>

        {/* Loading Overlay */}
        <LoadingOverlay loadingStateManager={widgetState.loadingStateManager} />
      </Card>

      {/* Overlays and Modals */}
      {widgetState.showFAQBrowser && (
        <div className="absolute inset-0 bg-background z-10">
          <FAQBrowser
            onClose={() => widgetState.setShowFAQBrowser(false)}
            onSelectFAQ={widgetActions.handleFAQSelect}
          />
        </div>
      )}

      {widgetState.showResourceBrowser && (
        <div className="absolute inset-0 bg-background z-10">
          <ResourceBrowser
            onClose={() => widgetState.setShowResourceBrowser(false)}
            onSelectResource={widgetActions.handleResourceSelect}
          />
        </div>
      )}

      {widgetState.isConversationClosed && (
        <div className="absolute inset-0 bg-background z-10">
          <ChatClosedState
            onStartNewChat={widgetActions.handleStartNewChat}
            primaryColor={appearance.primaryColor}
            assistantName={aiSettings.assistantName}
          />
        </div>
      )}

      {widgetState.showPostChatFeedback && (
        <div className="absolute inset-0 bg-background z-10">
          <PostChatFeedback
            conversationId={conversationPersistence.conversationState?.conversationId || ''}
            onSubmit={handlePostChatFeedbackSubmit}
            onSkip={() => widgetState.setShowPostChatFeedback(false)}
          />
        </div>
      )}


      {/* Conversation End Modal */}
      <ConversationEndModal
        isOpen={showEndConfirmation}
        onClose={cancelEndConversation}
        onConfirm={widgetActions.handleEndConversationWithFeedback}
        appearance={appearance}
      />
    </div>
  );
}