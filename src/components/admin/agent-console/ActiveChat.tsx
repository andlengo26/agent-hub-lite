/**
 * Active Chat component for the Agent Console
 * Displays the current chat conversation with transcript viewer
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Section } from '@/components/common/Section';
import { TranscriptViewer } from './TranscriptViewer';
import { Chat } from '@/types';
import { 
  CheckCircle, 
  XCircle, 
  X, 
  Send, 
  Paperclip, 
  Smile,
  Mail 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveChatProps {
  currentChat?: Chat;
  onCloseChat?: (chatId: string) => void;
  onSendMessage?: (message: string) => void;
  onAcceptChat?: (chatId: string) => void;
  onCancelChat?: (chatId: string) => void;
  onEmailTranscript?: (chatId: string) => void;
}

export function ActiveChat({
  currentChat,
  onCloseChat,
  onSendMessage,
  onAcceptChat,
  onCancelChat,
  onEmailTranscript,
}: ActiveChatProps) {
  const [message, setMessage] = useState('');

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

  const handleSendMessage = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage('');
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
          
          <div className="flex items-center gap-space-2">
            {/* Status-specific actions */}
            {!currentChat.assignedAgentId && currentChat.status !== 'closed' && (
              <>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onAcceptChat?.(currentChat.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept Chat
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onCancelChat?.(currentChat.id)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            )}
            
            {currentChat.assignedAgentId && currentChat.status === 'active' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onCloseChat?.(currentChat.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Close Chat
              </Button>
            )}
            
            {currentChat.status === 'closed' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEmailTranscript?.(currentChat.id)}
              >
                <Mail className="h-4 w-4 mr-1" />
                Email Transcript
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 min-h-0">
        <TranscriptViewer chatId={currentChat.id} />
      </div>

      {/* Message Input - Sticky Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-space-4">
        <div className="flex items-end gap-space-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-space-2 p-space-3 border border-border rounded-radius-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="border-0 shadow-none focus-visible:ring-0 p-0"
              />
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
                  title="Add emoji"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}