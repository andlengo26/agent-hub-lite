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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Chat } from '@/types';
import { formatDistanceToNow, format, isToday, isSameDay, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { Clock, MessageCircle, ChevronDown, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueuePreviewProps {
  chats: Chat[];
  isLoading?: boolean;
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
  onChatAccept: (chatId: string) => void;
}

type DateFilterOption = 'today' | 'yesterday' | 'this-week' | 'this-month' | 'all' | 'custom';

export function QueuePreview({
  chats,
  isLoading,
  selectedChatId,
  onChatSelect,
  onChatAccept,
}: QueuePreviewProps) {
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [customDate, setCustomDate] = useState<Date>(new Date());
  const [openSections, setOpenSections] = useState({
    waiting: true,
    active: true,
    missed: true,
    closed: true,
  });

  // Filter chats by date filter option
  const filteredChats = chats.filter(chat => {
    const chatDate = new Date(chat.createdAt);
    
    switch (dateFilter) {
      case 'today':
        return isToday(chatDate);
      case 'yesterday':
        return isYesterday(chatDate);
      case 'this-week':
        return isThisWeek(chatDate);
      case 'this-month':
        return isThisMonth(chatDate);
      case 'all':
        return true;
      case 'custom':
        return isSameDay(chatDate, customDate);
      default:
        return isToday(chatDate);
    }
  });

  // Categorize chats by status
  const categorizedChats = {
    waiting: filteredChats.filter(chat => (chat.status === 'waiting' || (!chat.assignedAgentId && chat.status !== 'closed' && chat.status !== 'missed'))),
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
      {/* Header with simplified date filter */}
      <div className="p-4 border-b border-border">
        <h3 className="font-medium text-text-primary mb-3">Queue</h3>
        
        {/* Compact date filter dropdown */}
        <Select value={dateFilter} onValueChange={(value: DateFilterOption) => setDateFilter(value)}>
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent className="z-50">
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="custom">Custom Date</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Custom date picker - only show when custom is selected */}
        {dateFilter === 'custom' && (
          <div className="mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left font-normal text-xs"
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {format(customDate, "MMM dd, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={customDate}
                  onSelect={(date) => {
                    if (date) {
                      setCustomDate(date);
                    }
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
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