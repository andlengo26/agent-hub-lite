import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Maximize2, Minimize2, Send, Paperclip, Mic, MicOff, Phone, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { useToast } from "@/hooks/use-toast";
import { useConversationLifecycle } from "@/hooks/useConversationLifecycle";
import { ConversationEndModal } from "./ConversationEndModal";
import { conversationService } from "@/services/conversationService";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export function InteractiveWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });
  const [showUserForm, setShowUserForm] = useState(false);
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
    handleConfirmedEnd
  } = useConversationLifecycle(settings);

  useEffect(() => {
    if (settings?.appearance.autoOpenWidget && !isExpanded && messages.length === 0) {
      setTimeout(() => setIsExpanded(true), 2000);
    }
  }, [settings, isExpanded, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isExpanded && messages.length === 0 && settings?.aiSettings.welcomeMessage) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: settings.aiSettings.welcomeMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isExpanded, messages.length, settings?.aiSettings.welcomeMessage]);

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

    // Check if user info is required and not provided
    if (!userInfo.anonymousChat && !userData.name && (
      userInfo.requiredFields.name || 
      userInfo.requiredFields.email || 
      userInfo.requiredFields.mobile
    )) {
      setShowUserForm(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    incrementMessageCount();
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Thank you for your message: "${userMessage.content}". This is a demo response from the ${aiSettings.assistantName}. In production, this would connect to your configured AI model (${settings.integrations.aiModel}) to provide intelligent responses.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      incrementMessageCount();
      setIsTyping(false);
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

  const handleUserFormSubmit = () => {
    setShowUserForm(false);
    handleSendMessage();
  };

  const handleTalkToHuman = async () => {
    requestHumanAgent('User clicked Talk to Human button');
    
    try {
      // Create a new chat request with human handoff using the service
      const handoffRequest = {
        conversationId: `conv_${Date.now()}`,
        reason: 'User requested human agent',
        userData: {
          name: userData.name || 'Anonymous User',
          email: userData.email || '',
          phone: userData.phone || ''
        },
        context: {
          pageUrl: window.location.href,
          browser: navigator.userAgent,
          ipAddress: '127.0.0.1' // In real app, would be actual IP
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

  if (!isExpanded) {
    return (
      <div 
        className="fixed z-50" 
        style={getPositionClasses()}
      >
        <Button
          onClick={() => setIsExpanded(true)}
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
              onClick={() => setIsExpanded(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* User Form Modal */}
          {showUserForm && (
            <div className="absolute inset-0 bg-background z-10 p-4 flex flex-col">
              <h3 className="font-medium mb-4">Please provide your information</h3>
              <div className="space-y-3 flex-1">
                {userInfo.requiredFields.name && (
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      value={userData.name}
                      onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                )}
                {userInfo.requiredFields.email && (
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                )}
                {userInfo.requiredFields.mobile && (
                  <div>
                    <label className="text-sm font-medium">Phone *</label>
                    <Input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Your phone number"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowUserForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUserFormSubmit} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                  {message.type === 'ai' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: appearance.secondaryColor }}
                      >
                        AI
                      </div>
                      <span className="text-xs text-muted-foreground">{aiSettings.assistantName}</span>
                    </div>
                  )}
                  <div 
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.type === 'user' 
                        ? 'text-white ml-auto' 
                        : 'bg-muted'
                    }`}
                    style={message.type === 'user' ? { backgroundColor: appearance.primaryColor } : {}}
                  >
                    {message.content}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
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
                  className="h-8 w-8 text-white"
                  style={{ backgroundColor: appearance.highlightColor }}
                  disabled={!inputValue.trim() || conversationState.status !== 'active'}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

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