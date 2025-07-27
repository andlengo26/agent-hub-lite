/**
 * Collapsible Context Panel for Agent Console
 * Features: Thin icon strip when collapsed, three main sections with count badges
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DetailModal } from './DetailModal';
import { NotesSection } from './NotesSection';
import { Chat, User, Engagement } from '@/types';
import { 
  ChevronLeft, 
  ChevronRight, 
  User as UserIcon, 
  Globe, 
  Clock, 
  History,
  FileText,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Video,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface ExpandableContextPanelProps {
  currentChat?: Chat;
  users: User[];
  width?: number;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  isLoading?: boolean;
}

// Channel icons mapping
const getChannelIcon = (type: string) => {
  switch (type) {
    case 'chat': return MessageCircle;
    case 'email': return Mail;
    case 'phone': return Phone;
    case 'video': return Video;
    default: return MessageCircle;
  }
};

// Mock channel types for engagements
const mockChannelTypes = ['chat', 'email', 'phone', 'video'];

// Mock notes count for demo
const mockNotesCount = 4;

export function ExpandableContextPanel({
  currentChat,
  users,
  width = 320,
  isExpanded = true,
  onToggleExpanded,
  isLoading = false,
}: ExpandableContextPanelProps) {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['details']);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [engagementsLoading, setEngagementsLoading] = useState(false);
  const isMobile = useIsMobile();

  // Load engagement data based on current chat
  useEffect(() => {
    if (currentChat) {
      setEngagementsLoading(true);
      // Simulate API call to fetch engagements for this customer
      fetch('/mocks/engagements.json')
        .then(res => res.json())
        .then(data => {
          // Filter engagements for current customer
          const customerEngagements = data.data.filter((eng: Engagement) => 
            eng.customerEmail === currentChat.requesterEmail
          );
          setEngagements(customerEngagements);
        })
        .catch(console.error)
        .finally(() => setEngagementsLoading(false));
    }
  }, [currentChat]);

  // Handle icon strip click to expand specific section
  const handleIconStripClick = (section: string) => {
    if (onToggleExpanded) {
      onToggleExpanded();
    }
    // Set the clicked section as expanded
    setExpandedSections([section]);
  };

  // Collapsed icon strip component
  const IconStrip = () => (
    <div className="w-12 h-full bg-surface border-l border-border flex flex-col">
      {/* Toggle Button */}
      <div className="p-space-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
          className="w-full h-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Section Icons */}
      <div className="flex-1 flex flex-col gap-space-1 p-space-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleIconStripClick('details')}
          className="w-full h-8 p-0"
          title="Details"
        >
          <UserIcon className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleIconStripClick('history')}
          className="w-full h-8 p-0"
          title="History"
        >
          <History className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleIconStripClick('notes')}
          className="w-full h-8 p-0"
          title="Notes"
        >
          <FileText className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (!currentChat) {
    return (
      <div className="h-full flex flex-col">
        {isExpanded ? (
          <>
            <div className="flex items-center justify-between p-space-4 border-b border-border">
              <h3 className="font-medium text-text-primary">Context</h3>
              {!isMobile && onToggleExpanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleExpanded}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center p-space-4">
              <div className="text-center text-text-secondary">
                <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a chat to view context</p>
              </div>
            </div>
          </>
        ) : (
          <IconStrip />
        )}
      </div>
    );
  }

  const assignedAgent = users.find(user => user.id === currentChat.assignedAgentId);

  const ContextContent = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-space-4 border-b border-border">
        <h3 className="font-medium text-text-primary">Context</h3>
        {!isMobile && onToggleExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpanded}
            className="h-6 w-6 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="p-space-4 space-y-space-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <Accordion
            type="multiple"
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="w-full"
          >
            {/* Details Section */}
            <AccordionItem value="details">
              <AccordionTrigger className="px-space-4 py-space-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-space-2">
                    <UserIcon className="h-4 w-4" />
                    <span>Details</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    3
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <ScrollArea className="h-80">
                  <div className="px-space-4 pb-space-4 space-y-space-4">
                    {/* Customer Information */}
                    <div>
                      <div className="flex items-center gap-space-2 mb-space-2">
                        <UserIcon className="h-3 w-3 text-text-secondary" />
                        <span className="text-sm font-medium text-text-secondary">Customer</span>
                      </div>
                      <div className="space-y-space-2 ml-space-5">
                        <p className="font-medium text-text-primary">{currentChat.requesterName}</p>
                        <div className="flex items-center gap-space-2">
                          <Mail className="h-3 w-3 text-text-secondary" />
                          <p className="text-sm text-text-secondary">{currentChat.requesterEmail}</p>
                        </div>
                        {currentChat.requesterPhone && (
                          <div className="flex items-center gap-space-2">
                            <Phone className="h-3 w-3 text-text-secondary" />
                            <p className="text-sm text-text-secondary">{currentChat.requesterPhone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Session Information */}
                    <div>
                      <div className="flex items-center gap-space-2 mb-space-2">
                        <Globe className="h-3 w-3 text-text-secondary" />
                        <span className="text-sm font-medium text-text-secondary">Session</span>
                      </div>
                      <div className="space-y-space-2 ml-space-5 text-sm">
                        <div className="flex items-center gap-space-2">
                          <MapPin className="h-3 w-3 text-text-secondary" />
                          <span className="text-text-primary">{currentChat.geo}</span>
                        </div>
                        <div>
                          <p className="text-text-secondary mb-space-1">Page URL:</p>
                          <p className="text-text-primary font-mono text-xs break-all">
                            {currentChat.pageUrl}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-secondary mb-space-1">Browser:</p>
                          <p className="text-text-primary">{currentChat.browser}</p>
                        </div>
                        <div className="flex items-center gap-space-2">
                          <Clock className="h-3 w-3 text-text-secondary" />
                          <span className="text-text-primary">
                            {formatDistanceToNow(new Date(currentChat.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Agent */}
                    {assignedAgent && (
                      <>
                        <Separator />
                        <div>
                          <div className="flex items-center gap-space-2 mb-space-2">
                            <UserIcon className="h-3 w-3 text-text-secondary" />
                            <span className="text-sm font-medium text-text-secondary">Assigned Agent</span>
                          </div>
                          <div className="flex items-center gap-space-3 ml-space-5">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={assignedAgent.avatarUrl} />
                              <AvatarFallback>
                                {assignedAgent.firstName[0]}{assignedAgent.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-text-primary">
                                {assignedAgent.firstName} {assignedAgent.lastName}
                              </p>
                              <div className="flex items-center gap-space-2">
                                <Badge variant="secondary" className="text-xs">
                                  {assignedAgent.role}
                                </Badge>
                                <Badge 
                                  variant={assignedAgent.onlineStatus === 'online' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {assignedAgent.onlineStatus}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>

            {/* History Section */}
            <AccordionItem value="history">
              <AccordionTrigger className="px-space-4 py-space-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-space-2">
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {engagements.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <ScrollArea className="h-64">
                  <div className="px-space-4 pb-space-4">
                    {engagementsLoading ? (
                      <div className="space-y-space-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : engagements.length > 0 ? (
                      <div className="space-y-space-3">
                        {engagements.map((engagement, index) => {
                          const channelType = mockChannelTypes[index % mockChannelTypes.length];
                          const ChannelIcon = getChannelIcon(channelType);
                          
                          return (
                            <div
                              key={engagement.id}
                              className="p-space-3 border border-border rounded-radius-md bg-surface"
                            >
                              <div className="flex items-start justify-between mb-space-2">
                                <div className="flex items-center gap-space-2">
                                  <ChannelIcon className="h-4 w-4 text-text-secondary" />
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {channelType}
                                  </Badge>
                                </div>
                                <span className="text-xs text-text-secondary">
                                  {engagement.engagementCount} interactions
                                </span>
                              </div>
                              
                              <p className="text-sm text-text-primary mb-space-2 leading-relaxed">
                                {engagement.aiSummary}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-text-secondary">
                                  {formatDistanceToNow(new Date(engagement.lastEngagedAt), { addSuffix: true })}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setHistoryModalOpen(true)}
                                  className="h-6 text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-space-1" />
                                  View details
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-space-6 text-text-secondary">
                        <History className="h-8 w-8 mx-auto mb-space-2 opacity-50" />
                        <p className="text-sm">No previous engagements</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>

            {/* Notes Section */}
            <AccordionItem value="notes">
              <AccordionTrigger className="px-space-4 py-space-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-space-2">
                    <FileText className="h-4 w-4" />
                    <span>Notes</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {mockNotesCount}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <ScrollArea className="h-64">
                  <div className="px-space-4 pb-space-4">
                    <NotesSection chatId={currentChat.id} />
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </div>
  );

  // Mobile version with sheet
  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              Context
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96">
            <SheetHeader>
              <SheetTitle>Chat Context</SheetTitle>
            </SheetHeader>
            <ContextContent />
          </SheetContent>
        </Sheet>

        <DetailModal
          isOpen={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          title="Engagement History"
          mode="history"
          chatId={currentChat.id}
          engagements={engagements}
        />

        <DetailModal
          isOpen={notesModalOpen}
          onClose={() => setNotesModalOpen(false)}
          title="Internal Notes"
          mode="notes"
          chatId={currentChat.id}
        />
      </>
    );
  }

  // Desktop version
  return (
    <>
      <div 
        className={cn(
          "border-l border-border bg-background transition-all duration-200",
          isExpanded ? `w-[${width}px]` : "w-12"
        )}
        style={{ width: isExpanded ? width : 48 }}
      >
        {isExpanded ? (
          <ContextContent />
        ) : (
          <IconStrip />
        )}
      </div>

      <DetailModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Engagement History"
        mode="history"
        chatId={currentChat.id}
        engagements={engagements}
      />

      <DetailModal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        title="Internal Notes"
        mode="notes"
        chatId={currentChat.id}
      />
    </>
  );
}