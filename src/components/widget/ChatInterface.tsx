/**
 * Chat Interface Component
 * Handles the main chat display and interaction logic
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Phone, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageFeedback } from './MessageFeedback';
import { Message } from '@/types';

interface ChatInterfaceProps {
  messages: Message[];
  inputValue: string;
  isTyping: boolean;
  canSendMessage: boolean;
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    highlightColor: string;
    textColor: string;
  };
  onSendMessage: (message: string) => void;
  onInputChange: (value: string) => void;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative', comment?: string) => void;
}

export function ChatInterface({
  messages,
  inputValue,
  isTyping,
  canSendMessage,
  appearance,
  onSendMessage,
  onInputChange,
  onFeedback
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !canSendMessage) return;
    onSendMessage(inputValue.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'ai' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                {message.type === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              {/* Message Feedback for AI messages */}
              {message.type === 'ai' && onFeedback && (
                <MessageFeedback
                  messageId={message.id}
                  onFeedback={onFeedback}
                  appearance={{
                    primaryColor: appearance.primaryColor,
                    secondaryColor: appearance.secondaryColor,
                    highlightColor: appearance.highlightColor
                  }}
                />
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground p-3 rounded-lg max-w-[80%]">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
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

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={canSendMessage ? "Type your message..." : "Complete identification to send messages"}
                className="min-h-[40px] max-h-[120px] resize-none pr-24"
                disabled={!canSendMessage}
                rows={1}
              />
              <div className="absolute right-2 top-2 flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={!canSendMessage}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={!canSendMessage}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!inputValue.trim() || !canSendMessage}
              style={{ backgroundColor: appearance.primaryColor, color: appearance.textColor }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canSendMessage}
            >
              <Phone className="h-4 w-4 mr-2" />
              Voice Call
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}