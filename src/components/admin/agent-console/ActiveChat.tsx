/**
 * Active Chat component for the Agent Console
 * Displays the current chat conversation with transcript viewer
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Section } from '@/components/common/Section';
import { TranscriptViewer } from './TranscriptViewer';
import { EmailComposer } from './EmailComposer';
import { Chat, EmailMessage } from '@/types';
import { 
  CheckCircle, 
  XCircle, 
  X, 
  Send, 
  Paperclip, 
  Smile,
  Mail,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveChatProps {
  currentChat?: Chat;
  onCloseChat?: (chatId: string) => void;
  onSendMessage?: (message: string) => void;
  onAcceptChat?: (chatId: string) => void;
  onCancelChat?: (chatId: string) => void;
  onEmailTranscript?: (chatId: string) => void;
  onSendFollowUpEmail?: (emailData: Omit<EmailMessage, 'id' | 'sentAt' | 'sentById'>) => Promise<void>;
}

export function ActiveChat({
  currentChat,
  onCloseChat,
  onSendMessage,
  onAcceptChat,
  onCancelChat,
  onEmailTranscript,
  onSendFollowUpEmail,
}: ActiveChatProps) {
  const [message, setMessage] = useState('');
  const [isAcceptingChat, setIsAcceptingChat] = useState(false);
  const [isCancellingChat, setIsCancellingChat] = useState(false);
  const [isClosingChat, setIsClosingChat] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isEmailingTranscript, setIsEmailingTranscript] = useState(false);
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus textarea when chat is accepted
  useEffect(() => {
    if (currentChat?.assignedAgentId && currentChat.status === 'active') {
      textareaRef.current?.focus();
    }
  }, [currentChat?.assignedAgentId, currentChat?.status]);
  
  // Check if chat is in read-only mode
  const isReadOnlyMode = currentChat?.status === 'missed' || currentChat?.status === 'closed';

  if (!currentChat) {
    return (
      <Section padding="lg">
        <div className="text-center py-space-12">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-space-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-space-2">
            No Active Chat
          </h3>
          <p className="text-text-secondary">
            Select a chat from the queue to start assisting customers
          </p>
        </div>
      </Section>
    );
  }

  const handleSendMessage = async () => {
    if (message.trim() && onSendMessage && !isReadOnlyMode) {
      setIsSendingMessage(true);
      try {
        await onSendMessage(message);
        setMessage('');
      } finally {
        setIsSendingMessage(false);
      }
    }
  };

  const handleAcceptChat = async () => {
    if (onAcceptChat) {
      setIsAcceptingChat(true);
      try {
        await onAcceptChat(currentChat.id);
      } finally {
        setIsAcceptingChat(false);
      }
    }
  };

  const handleCancelChat = async () => {
    if (onCancelChat) {
      setIsCancellingChat(true);
      try {
        await onCancelChat(currentChat.id);
      } finally {
        setIsCancellingChat(false);
      }
    }
  };

  const handleCloseChat = async () => {
    if (onCloseChat) {
      setIsClosingChat(true);
      try {
        await onCloseChat(currentChat.id);
      } finally {
        setIsClosingChat(false);
      }
    }
  };

  const handleEmailTranscript = async () => {
    if (onEmailTranscript) {
      setIsEmailingTranscript(true);
      try {
        await onEmailTranscript(currentChat.id);
      } finally {
        setIsEmailingTranscript(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-space-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback>
                {currentChat.requesterName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-text-primary">
                {currentChat.requesterName}
              </h3>
              <p className="text-sm text-text-secondary">
                {currentChat.requesterEmail}
              </p>
            </div>
            <Badge 
              variant={currentChat.status === 'active' ? 'default' : 'secondary'}
              className="ml-space-2"
            >
              {currentChat.status}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-space-2">
            {/* Status-specific actions */}
            {!currentChat.assignedAgentId && currentChat.status !== 'closed' && (
              <>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleAcceptChat}
                  disabled={isAcceptingChat}
                  aria-label="Accept chat request"
                >
                  {isAcceptingChat ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Accept Chat
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancelChat}
                  disabled={isCancellingChat}
                  aria-label="Cancel chat request"
                >
                  {isCancellingChat ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  Cancel
                </Button>
              </>
            )}
            
            {currentChat.assignedAgentId && currentChat.status === 'active' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCloseChat}
                disabled={isClosingChat}
                aria-label="Close active chat"
              >
                {isClosingChat ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                Close Chat
              </Button>
            )}
            
            {currentChat.status === 'closed' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEmailTranscript}
                disabled={isEmailingTranscript}
                aria-label="Email chat transcript"
              >
                {isEmailingTranscript ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-1" />
                )}
                Email Transcript
              </Button>
            )}
            
            {currentChat.status === 'missed' && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsEmailComposerOpen(true)}
                aria-label="Reply via email for missed chat"
              >
                <Mail className="h-4 w-4 mr-1" />
                Reply via Email
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Read-only Banner */}
      {isReadOnlyMode && (
        <div className="bg-warning/10 border-b border-warning/20 px-space-4 py-space-2">
          <p className="text-sm text-warning-foreground">
            {currentChat.status === 'missed' 
              ? '⚠️ This chat was missed - viewing in read-only mode'
              : '📋 This chat is closed - viewing in read-only mode'
            }
          </p>
        </div>
      )}

      {/* Chat Content */}
      <div className={cn("flex-1 min-h-0", isReadOnlyMode && "opacity-70")}>
        <TranscriptViewer chatId={currentChat.id} />
      </div>

      {/* Message Input - Sticky Footer */}
      <div className={cn(
        "sticky bottom-0 bg-background border-t border-border p-space-4",
        isReadOnlyMode && "opacity-50 pointer-events-none"
      )}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-space-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-space-2 p-space-3 border border-border rounded-radius-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isReadOnlyMode ? "Chat is read-only" : "Type your message..."}
                className="border-0 shadow-none focus-visible:ring-0 p-0 min-h-[60px] resize-none"
                disabled={isReadOnlyMode}
                aria-label="Message input"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*,.pdf,.doc,.docx,.txt';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          console.log('File selected:', file.name);
                          // TODO: Handle file upload
                        }
                      };
                      input.click();
                    }}
                    disabled={isReadOnlyMode}
                    aria-label="Attach file"
                    title="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      // Simple emoji insertion
                      const emojis = ['😊', '👍', '❤️', '😢', '😮', '😡'];
                      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                      setMessage(prev => prev + randomEmoji);
                    }}
                    disabled={isReadOnlyMode}
                    aria-label="Add emoji"
                    title="Add emoji"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs text-text-secondary">
                  {isReadOnlyMode ? "Read-only mode" : "Press Enter to send"}
                </span>
              </div>
            </div>
          </div>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleSendMessage}
            disabled={!message.trim() || isReadOnlyMode || isSendingMessage}
            aria-label="Send message"
            className="shrink-0 sm:h-auto"
          >
            {isSendingMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Email Composer Drawer */}
      {currentChat && (
        <EmailComposer
          isOpen={isEmailComposerOpen}
          onClose={() => setIsEmailComposerOpen(false)}
          chat={currentChat}
          onSendEmail={onSendFollowUpEmail}
        />
      )}
    </div>
  );
}