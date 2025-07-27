/**
 * Queue Preview component for the Agent Console
 * Shows waiting chats with improved UX and animations
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Section } from '@/components/common/Section';
import { Chat } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Clock, MapPin, Mail, Phone, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueuePreviewProps {
  chats: Chat[];
  isLoading?: boolean;
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
  onChatAccept: (chatId: string) => void;
}

export function QueuePreview({
  chats,
  isLoading,
  selectedChatId,
  onChatSelect,
  onChatAccept,
}: QueuePreviewProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (isLoading) {
    return (
      <Section title="Waiting Queue" padding="md">
        <div className="space-y-space-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Section>
    );
  }

  if (chats.length === 0) {
    return (
      <Section title="Waiting Queue" padding="md">
        <div className="text-center py-space-6">
          <MessageCircle className="h-12 w-12 text-text-secondary mx-auto mb-space-3" />
          <p className="text-text-secondary">No chats waiting</p>
        </div>
      </Section>
    );
  }

  const handleAccordionChange = (value: string[]) => {
    setExpandedItems(value);
  };

  return (
    <Section 
      title={`Waiting Queue (${chats.length})`}
      padding="sm"
    >
      <ScrollArea className="h-[calc(100vh-200px)]">
        <Accordion 
          type="multiple" 
          value={expandedItems}
          onValueChange={handleAccordionChange}
          className="space-y-space-2"
        >
          {chats.map((chat) => (
            <AccordionItem
              key={chat.id}
              value={chat.id}
              className={cn(
                "border border-border rounded-radius-md transition-all duration-200",
                selectedChatId === chat.id && "ring-2 ring-primary ring-offset-2",
                "hover:bg-surface/50 cursor-pointer"
              )}
              onClick={() => onChatSelect(chat.id)}
            >
              <AccordionTrigger className="p-space-3 hover:no-underline">
                <div className="flex items-start justify-between w-full text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-space-2 mb-space-1">
                      <h4 className="font-medium text-text-primary truncate">
                        {chat.requesterName}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        New
                      </Badge>
                    </div>
                    <div className="flex items-center gap-space-4 text-xs text-text-secondary">
                      <div className="flex items-center gap-space-1">
                        <MapPin className="h-3 w-3" />
                        <span>{chat.geo}</span>
                      </div>
                      <div className="flex items-center gap-space-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="p-space-3 pt-0">
                <div className="space-y-space-3">
                  <div className="grid grid-cols-1 gap-space-2 text-sm">
                    <div className="flex items-center gap-space-2">
                      <Mail className="h-4 w-4 text-text-secondary" />
                      <span className="text-text-primary">{chat.requesterEmail}</span>
                    </div>
                    {chat.requesterPhone && (
                      <div className="flex items-center gap-space-2">
                        <Phone className="h-4 w-4 text-text-secondary" />
                        <span className="text-text-primary">{chat.requesterPhone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-text-secondary mb-space-1">Current Page:</p>
                    <p className="text-text-primary font-mono text-xs truncate">
                      {chat.pageUrl}
                    </p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-text-secondary mb-space-1">Summary:</p>
                    <p className="text-text-primary">{chat.summary}</p>
                  </div>
                  
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatAccept(chat.id);
                    }}
                  >
                    Accept Chat
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </Section>
  );
}