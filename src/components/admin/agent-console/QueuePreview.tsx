/**
 * Queue Preview component for the Agent Console
 * Shows categorized chats with date filtering and simplified UI
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkActionsToolbar } from '@/components/common/BulkActionsToolbar';
import { AgentAvatar } from './AgentAvatar';
import { SectionVisibilityDropdown } from './SectionVisibilityDropdown';
import { Chat, User } from '@/types';
import { formatDistanceToNow, format, isToday, isSameDay, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { Clock, MessageCircle, ChevronDown, CalendarIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { categorizeChats } from '@/lib/chat-utils';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { 
  SectionVisibility, 
  getSectionVisibility, 
  setSectionVisibility 
} from '@/lib/section-visibility';

interface QueuePreviewProps {
  chats: Chat[];
  users: User[];
  isLoading?: boolean;
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
  onChatAccept: (chatId: string) => void;
  selectionMode?: boolean;
  selectedChats?: string[];
  onChatSelectionChange?: (chatIds: string[]) => void;
}

type DateFilterOption = 'today' | 'yesterday' | 'this-week' | 'this-month' | 'all' | 'custom';

export function QueuePreview({
  chats,
  users,
  isLoading,
  selectedChatId,
  onChatSelect,
  onChatAccept,
  selectionMode = false,
  selectedChats = [],
  onChatSelectionChange,
}: QueuePreviewProps) {
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [customDate, setCustomDate] = useState<Date>(new Date());
  const [sectionVisibility, setSectionVisibilityState] = useState<SectionVisibility>(getSectionVisibility);
  const [openSections, setOpenSections] = useState({
    waiting: true,
    aiActive: false,
    active: false,
    missed: false,
    closed: false,
  });
  const { settings } = useWidgetSettings();

  // Update localStorage when visibility changes
  useEffect(() => {
    setSectionVisibility(sectionVisibility);
  }, [sectionVisibility]);

  // Bulk selection handlers
  const handleChatSelection = (chatId: string, checked: boolean) => {
    if (!onChatSelectionChange) return;
    
    if (checked) {
      onChatSelectionChange([...selectedChats, chatId]);
    } else {
      onChatSelectionChange(selectedChats.filter(id => id !== chatId));
    }
  };

  const handleSectionSelectAll = (sectionChats: Chat[], checked: boolean) => {
    if (!onChatSelectionChange) return;
    
    const sectionChatIds = sectionChats.map(chat => chat.id);
    
    if (checked) {
      // Add all section chats to selection
      const newSelection = [...selectedChats, ...sectionChatIds.filter(id => !selectedChats.includes(id))];
      onChatSelectionChange(newSelection);
    } else {
      // Remove all section chats from selection
      onChatSelectionChange(selectedChats.filter(id => !sectionChatIds.includes(id)));
    }
  };

  const handleBulkExport = () => {
    // Export functionality simplified - could be implemented later
    console.log('Export selected chats:', selectedChats);
  };

  const clearSelection = () => {
    if (onChatSelectionChange) {
      onChatSelectionChange([]);
    }
  };

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

  // Categorize chats using the new AI-first routing logic
  const categorizedChats = categorizeChats(filteredChats);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => {
      // Close all sections first, then open the clicked one
      const newState = {
        waiting: false,
        aiActive: false,
        active: false,
        missed: false,
        closed: false,
      };
      newState[section] = !prev[section];
      return newState;
    });
  };

  const renderChatItem = (chat: Chat) => (
    <div
      key={chat.id}
      className={cn(
        "p-3 transition-colors hover:bg-surface/50 border-b border-border last:border-b-0 cursor-pointer relative",
        selectedChatId === chat.id && "bg-surface border-l-4 border-l-primary"
      )}
      onClick={() => onChatSelect(chat.id)}
    >
      <div className="flex items-center gap-3">
        {selectionMode && (
          <Checkbox
            checked={selectedChats.includes(chat.id)}
            onCheckedChange={(checked) => handleChatSelection(chat.id, checked as boolean)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
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
        
        {/* Agent Avatar in upper right corner */}
        <div className="absolute top-2 right-2">
          <AgentAvatar 
            assignedAgentId={chat.assignedAgentId}
            handledBy={chat.handledBy}
            users={users}
            size="sm"
          />
        </div>
      </div>
    </div>
  );

  const renderSection = (
    title: string,
    key: keyof typeof openSections,
    chats: Chat[],
    variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary'
  ) => {
    const sectionChatIds = chats.map(chat => chat.id);
    const selectedInSection = sectionChatIds.filter(id => selectedChats.includes(id));
    const allSectionSelected = chats.length > 0 && selectedInSection.length === chats.length;
    const someSelected = selectedInSection.length > 0 && selectedInSection.length < chats.length;

    return (
      <Collapsible
        open={openSections[key]}
        onOpenChange={() => toggleSection(key)}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-surface/50 transition-colors">
          <div className="flex items-center gap-2">
            {selectionMode && (
              <Checkbox
                checked={chats.length > 0 ? allSectionSelected : false}
                disabled={chats.length === 0}
                ref={(el) => {
                  if (el) {
                    const element = el as unknown as HTMLInputElement;
                    element.indeterminate = someSelected;
                  }
                }}
                onCheckedChange={(checked) => handleSectionSelectAll(chats, checked as boolean)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <span className="font-medium text-text-primary">{title}</span>
            <Badge variant={variant} className="text-xs">
              {chats.length}
              {selectionMode && selectedInSection.length > 0 && (
                <span className="ml-1">({selectedInSection.length} selected)</span>
              )}
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
  };

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
      {/* Bulk Actions Toolbar */}
      {selectionMode && (
        <BulkActionsToolbar
          selectedCount={selectedChats.length}
          onClearSelection={clearSelection}
          actions={[
            {
              id: 'export',
              label: 'Export as CSV',
              icon: <Download className="h-4 w-4" />,
              variant: 'outline',
              onClick: handleBulkExport,
            },
          ]}
        />
      )}

        {/* Header with section visibility and date filters */}
      <div className="p-4 border-b border-border">
        <h3 className="font-medium text-text-primary mb-3">Queue</h3>
        
        {/* Section visibility dropdown */}
        <div className="mb-3">
          <SectionVisibilityDropdown
            visibility={sectionVisibility}
            onChange={setSectionVisibilityState}
          />
        </div>
        
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
          {sectionVisibility.waiting && renderSection("Waiting", "waiting", categorizedChats.humanQueue, "outline")}
          {sectionVisibility.aiActive && renderSection("AI Assisted (Active)", "aiActive", categorizedChats.aiActive, "default")}
          {sectionVisibility.active && renderSection("Human Agent (Active)", "active", categorizedChats.active, "default")}
          {sectionVisibility.missed && renderSection("Missed", "missed", categorizedChats.missed, "destructive")}
          {sectionVisibility.closed && renderSection("Closed", "closed", categorizedChats.closed, "secondary")}
        </div>
      </ScrollArea>
    </div>
  );
}