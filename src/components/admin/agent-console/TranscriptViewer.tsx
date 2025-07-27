/**
 * Transcript Viewer component
 * Displays chat messages with proper formatting and timestamps
 */

import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'customer' | 'agent' | 'system';
  timestamp: string;
  senderName?: string;
}

interface TranscriptViewerProps {
  chatId: string;
}

// Mock messages for demo
const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hi, I need help with my order',
    sender: 'customer',
    timestamp: '2025-01-27T10:00:00Z',
    senderName: 'John Doe'
  },
  {
    id: '2',
    content: 'Hello! I\'d be happy to help you with your order. Can you please provide your order number?',
    sender: 'agent',
    timestamp: '2025-01-27T10:01:00Z',
    senderName: 'Sarah Agent'
  },
  {
    id: '3',
    content: 'Sure, it\'s ORDER-12345',
    sender: 'customer',
    timestamp: '2025-01-27T10:02:00Z',
    senderName: 'John Doe'
  },
  {
    id: '4',
    content: 'Chat transferred to billing department',
    sender: 'system',
    timestamp: '2025-01-27T10:03:00Z'
  },
  {
    id: '5',
    content: 'Thank you for waiting. I can see your order here. It looks like there was a shipping delay. Let me check the current status.',
    sender: 'agent',
    timestamp: '2025-01-27T10:04:00Z',
    senderName: 'Sarah Agent'
  }
];

export function TranscriptViewer({ chatId }: TranscriptViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mockMessages]);

  return (
    <ScrollArea className="h-full p-space-4">
      <div className="space-y-space-4">
        {mockMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-space-3",
              message.sender === 'agent' && "flex-row-reverse",
              message.sender === 'system' && "justify-center"
            )}
          >
            {message.sender !== 'system' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">
                  {message.senderName?.split(' ').map(n => n[0]).join('') || '?'}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={cn(
              "max-w-[80%] space-y-space-1",
              message.sender === 'agent' && "items-end",
              message.sender === 'system' && "max-w-none text-center"
            )}>
              {message.sender === 'system' ? (
                <Badge variant="secondary" className="text-xs">
                  {message.content}
                </Badge>
              ) : (
                <>
                  <div className={cn(
                    "p-space-3 rounded-radius-md",
                    message.sender === 'customer' 
                      ? "bg-surface text-text-primary" 
                      : "bg-primary text-white",
                    message.sender === 'agent' && "ml-auto"
                  )}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-space-2 text-xs text-text-secondary",
                    message.sender === 'agent' && "justify-end"
                  )}>
                    <span>{message.senderName}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        {/* Invisible element for auto-scroll */}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}