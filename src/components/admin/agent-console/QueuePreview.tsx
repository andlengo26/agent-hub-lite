/**
 * Queue Preview component for the Agent Console
 * Shows categorized chats with date filtering and simplified UI
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Chat } from '@/types';
import { formatDistanceToNow, format, isToday, isSameDay } from 'date-fns';
import { Clock, MessageCircle, ChevronDown, CalendarIcon } from 'lucide-react';
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [openSections, setOpenSections] = useState({
    waiting: true,
    active: true,
    missed: false,
    closed: false,
  });

  // Filter chats by selected date
  const filteredChats = chats.filter(chat => 
    isSameDay(new Date(chat.createdAt), selectedDate)
  );

  // Categorize chats by status
  const categorizedChats = {
    waiting: filteredChats.filter(chat => !chat.assignedAgentId && chat.status !== 'closed'),
    active: filteredChats.filter(chat => chat.assignedAgentId && chat.status === 'active'),
    missed: filteredChats.filter(chat => chat.status === 'missed'),
    closed: filteredChats.filter(chat => chat.status === 'closed'),
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderChatItem = (chat: Chat) => (
    <div
      key={chat.id}
      className={cn(
        "p-3 cursor-pointer transition-colors hover:bg-surface/50 border-b border-border last:border-b-0",
        selectedChatId === chat.id && "bg-surface border-l-4 border-l-primary"
      )}
      onClick={() => onChatSelect(chat.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-text-primary truncate text-sm">
            {chat.requesterName}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}</span>
            </div>
            {!chat.assignedAgentId && (
              <Badge variant="outline" className="text-xs">
                New
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = (
    title: string,
    key: keyof typeof openSections,
    chats: Chat[],
    variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary'
  ) => (
    <Collapsible
      open={openSections[key]}
      onOpenChange={() => toggleSection(key)}
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-surface/50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary">{title}</span>
          <Badge variant={variant} className="text-xs">
            {chats.length}
          </Badge>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-text-secondary transition-transform",
          openSections[key] && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {chats.length === 0 ? (
          <div className="p-6 text-center text-text-secondary text-sm">
            No {title.toLowerCase()} chats
          </div>
        ) : (
          <div className="border-t border-border">
            {chats.map(renderChatItem)}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="font-medium text-text-primary mb-3">Queue</h3>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with date picker */}
      <div className="p-4 border-b border-border">
        <h3 className="font-medium text-text-primary mb-3">Queue</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-text-secondary"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                isToday(selectedDate) ? "Today" : format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Queue sections */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {renderSection("Waiting", "waiting", categorizedChats.waiting, "outline")}
          {renderSection("Active", "active", categorizedChats.active, "default")}
          {renderSection("Missed", "missed", categorizedChats.missed, "destructive")}
          {renderSection("Closed", "closed", categorizedChats.closed, "secondary")}
        </div>
      </ScrollArea>
    </div>
  );
}