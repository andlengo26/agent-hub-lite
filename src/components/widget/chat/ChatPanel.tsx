/**
 * Chat Panel Component
 * Handles the main chat interface with messages and input
 */

import React, { useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageRenderer } from '@/components/widget/messages/MessageRenderer';
import { MoodleLoginButton } from '@/modules/moodle/components/MoodleLoginButton';
import { Message } from '@/types/message';
import { IdentificationFormData, IdentificationValidationResult, IdentificationSession } from '@/types/user-identification';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface ChatPanelProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onFileUpload: () => void;
  onVoiceRecording: () => void;
  onVoiceCall: () => void;
  onTalkToHuman: () => void;
  onFeedback: (messageId: string, feedback: 'positive' | 'negative', comment?: string) => void;
  isTyping: boolean;
  isRecording: boolean;
  hasUserSentFirstMessage: boolean;
  canSendMessage: boolean;
  settings: WidgetSettings;
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    highlightColor: string;
  };
  aiSettings: {
    assistantName: string;
    enableFeedback: boolean;
  };
  conversationStatus: string;
  userIdentification: {
    formData: IdentificationFormData;
    validationResult: IdentificationValidationResult | null;
    updateFormData: (field: keyof IdentificationFormData, value: string) => void;
    submitManualIdentification: () => Promise<boolean>;
    setIdentificationSession: (session: IdentificationSession) => void;
    getIdentificationMethodPriority: () => { prioritizeMoodle: boolean };
  };
}

export function ChatPanel({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  onFileUpload,
  onVoiceRecording,
  onVoiceCall,
  onTalkToHuman,
  onFeedback,
  isTyping,
  isRecording,
  hasUserSentFirstMessage,
  canSendMessage,
  settings,
  appearance,
  aiSettings,
  conversationStatus,
  userIdentification
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages - Scrollable area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageRenderer
            key={message.id}
            message={message}
            appearance={appearance}
            aiSettings={aiSettings}
            conversationStatus={conversationStatus}
            onFeedback={onFeedback}
            settings={settings}
            formData={userIdentification.formData}
            validationResult={userIdentification.validationResult}
            onUpdateFormData={userIdentification.updateFormData}
            onSubmitIdentification={userIdentification.submitManualIdentification}
            onMoodleAuth={userIdentification.setIdentificationSession}
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
        {hasUserSentFirstMessage && !canSendMessage && (
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
                      onAuthSuccess={userIdentification.setIdentificationSession}
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={
                  !hasUserSentFirstMessage || canSendMessage 
                    ? "Type your message..." 
                    : "Complete identification to send messages"
                }
                className="min-h-[40px] pr-24"
                disabled={hasUserSentFirstMessage && !canSendMessage}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={onFileUpload}
                  disabled={!canSendMessage}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={onVoiceRecording}
                  disabled={!canSendMessage}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!inputValue.trim() || (hasUserSentFirstMessage && !canSendMessage)}
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
              onClick={onVoiceCall}
              disabled={!canSendMessage}
            >
              <Phone className="h-4 w-4 mr-2" />
              Voice Call
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onTalkToHuman}
              disabled={!canSendMessage}
            >
              <User className="h-4 w-4 mr-2" />
              Talk to Human
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}