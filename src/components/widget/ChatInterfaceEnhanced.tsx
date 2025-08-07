/**
 * Enhanced ChatInterface with session termination handling
 */

import React from 'react';
import { Message } from '@/types/message';
import { MessageRenderer } from './messages/MessageRenderer';
import { TypingIndicator } from './messages/TypingIndicator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Mic, Paperclip, Phone } from 'lucide-react';
import { TerminatedSessionBanner } from './TerminatedSessionBanner';
import { useChatSessions } from '../../hooks/useChatSessions';

interface ChatInterfaceProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onVoiceRecording: () => void;
  onFileUpload: () => void;
  onVoiceCall: () => void;
  onFeedback: (messageId: string, feedback: 'positive' | 'negative', comment?: string) => void;
  isTyping: boolean;
  isRecording: boolean;
  conversationId?: string;
  currentConversationId?: string;
  onStartNewChat?: () => void;
  appearance: {
    primaryColor: string;
  };
}

export function ChatInterface({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  onVoiceRecording,
  onFileUpload,
  onVoiceCall,
  onFeedback,
  isTyping,
  isRecording,
  conversationId,
  currentConversationId,
  onStartNewChat,
  appearance
}: ChatInterfaceProps) {
  const { getSessionByConversationId } = useChatSessions();
  
  // Check if current conversation is terminated
  const currentSession = conversationId ? getSessionByConversationId(conversationId) : null;
  const isTerminated = currentSession && currentSession.status !== 'active';

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTerminated) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Terminated Session Banner */}
      {isTerminated && currentSession && (
        <TerminatedSessionBanner 
          session={currentSession}
          onStartNewChat={onStartNewChat}
        />
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageRenderer
            key={message.id}
            message={message}
            onFeedback={onFeedback}
            appearance={{
              primaryColor: appearance.primaryColor,
              secondaryColor: appearance.primaryColor,
              highlightColor: appearance.primaryColor
            }}
            aiSettings={{ assistantName: "AI Assistant" }}
            conversationStatus="active"
          />
        ))}
        
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input Area - Disabled for terminated sessions */}
      <div className={`border-t border-border p-4 ${isTerminated ? 'opacity-50' : ''}`}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isTerminated 
                  ? "This conversation has ended. Start a new chat to continue."
                  : "Type your message..."
              }
              disabled={isTerminated}
              className="pr-12"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onFileUpload}
              disabled={isTerminated}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={onVoiceRecording}
            disabled={isTerminated}
            className={`h-10 w-10 p-0 ${isRecording ? 'bg-red-100 text-red-600' : ''}`}
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onVoiceCall}
            disabled={isTerminated}
            className="h-10 w-10 p-0"
          >
            <Phone className="h-4 w-4" />
          </Button>

          <Button
            onClick={onSendMessage}
            disabled={!inputValue.trim() || isTerminated}
            className="h-10 px-4 text-white"
            style={{ backgroundColor: appearance.primaryColor }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {isTerminated && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This conversation has ended. Use "Start New Chat" to begin a new conversation.
          </p>
        )}
      </div>
    </div>
  );
}