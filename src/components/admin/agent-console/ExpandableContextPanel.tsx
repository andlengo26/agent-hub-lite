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
  isExpanded = false,
  onToggleExpanded,
  isLoading = false,
}: ExpandableContextPanelProps) {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string | undefined>('details');
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
          // Filter engagements for current customer or show Sarah Lee's data for demo
          const customerEngagements = data.data.filter((eng: Engagement) => 
            eng.customerEmail === currentChat.requesterEmail || 
            (currentChat.requesterName === 'Sarah Lee' && eng.customerName === 'Sarah Lee')
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
    setExpandedSections(section);
  };

  // Collapsed icon strip component
  const IconStrip = () => (
    <div className="w-12 h-full bg-background border-l border-border flex flex-col">
      {/* Toggle Button */}
      <div className="p-4 border-b border-border">
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
      <div className="flex-1 flex flex-col gap-1 p-4">
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
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-text-primary mb-3">Engagements</h3>
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
            <div className="flex-1 flex items-center justify-center p-4">
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
      <div className="p-4 border-b border-border">
        <h3 className="font-medium text-text-primary mb-3">Engagements</h3>
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

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Accordion
            type="single"
            value={expandedSections}
            onValueChange={setExpandedSections}
            collapsible
            className="w-full"
          >
            {/* Details Section */}
            <AccordionItem value="details">
              <AccordionTrigger className="flex items-center justify-between w-full p-3 hover:bg-surface/50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">Details</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4 space-y-4">
                  {/* Customer Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserIcon className="h-3 w-3 text-text-secondary" />
                      <span className="text-sm font-medium text-text-secondary">Customer</span>
                    </div>
                    <div className="space-y-2 ml-5">
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
              </AccordionContent>
            </AccordionItem>

            {/* History Section */}
            <AccordionItem value="history">
              <AccordionTrigger className="flex items-center justify-between w-full p-3 hover:bg-surface/50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">History</span>
                  <Badge variant="secondary" className="text-xs">
                    {engagements.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4">
                  {engagementsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : engagements.length > 0 ? (
                    <div className="space-y-3">
                      {engagements.map((engagement, index) => {
                        const channelType = mockChannelTypes[index % mockChannelTypes.length];
                        const ChannelIcon = getChannelIcon(channelType);
                        
                        return (
                          <div
                            key={engagement.id}
                            className="p-space-3 border border-border rounded-radius-md bg-surface hover:bg-surface/80 transition-colors cursor-pointer"
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
                    <div className="text-center py-6 text-text-secondary">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No previous engagements</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Notes Section */}
            <AccordionItem value="notes">
              <AccordionTrigger className="flex items-center justify-between w-full p-3 hover:bg-surface/50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">Notes</span>
                  <Badge variant="secondary" className="text-xs">
                    {mockNotesCount}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4">
                  <NotesSection chatId={currentChat.id} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </ScrollArea>
    </div>
  );

  // Mobile version with sheet
  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              Engagements
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96">
          <SheetHeader>
            <SheetTitle>Engagements</SheetTitle>
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