/**
 * Expandable Context Panel for Agent Console
 * Configurable width with mobile overlay support
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Section } from '@/components/common/Section';
import { DetailModal } from './DetailModal';
import { NotesSection } from './NotesSection';
import { Chat, User } from '@/types';
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
  MapPin
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

export function ExpandableContextPanel({
  currentChat,
  users,
  width = 320,
  isExpanded = true,
  onToggleExpanded,
  isLoading = false,
}: ExpandableContextPanelProps) {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['customer', 'session', 'notes']);
  const isMobile = useIsMobile();

  if (!currentChat) {
    return (
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
              {isExpanded ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center p-space-4">
          <div className="text-center text-text-secondary">
            <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select a chat to view context</p>
          </div>
        </div>
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
            {isExpanded ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
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
            {/* Customer Information */}
            <AccordionItem value="customer">
              <AccordionTrigger className="px-space-4 py-space-3">
                <div className="flex items-center gap-space-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Customer</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-space-4 pb-space-4">
                <div className="space-y-space-3">
                  <div>
                    <p className="font-medium text-text-primary">{currentChat.requesterName}</p>
                    <div className="flex items-center gap-space-2 mt-space-1">
                      <Mail className="h-3 w-3 text-text-secondary" />
                      <p className="text-sm text-text-secondary">{currentChat.requesterEmail}</p>
                    </div>
                    {currentChat.requesterPhone && (
                      <div className="flex items-center gap-space-2 mt-space-1">
                        <Phone className="h-3 w-3 text-text-secondary" />
                        <p className="text-sm text-text-secondary">{currentChat.requesterPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Session Information */}
            <AccordionItem value="session">
              <AccordionTrigger className="px-space-4 py-space-3">
                <div className="flex items-center gap-space-2">
                  <Globe className="h-4 w-4" />
                  <span>Session</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-space-4 pb-space-4">
                <div className="space-y-space-3 text-sm">
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
              </AccordionContent>
            </AccordionItem>

            {/* Assigned Agent */}
            {assignedAgent && (
              <AccordionItem value="agent">
                <AccordionTrigger className="px-space-4 py-space-3">
                  <div className="flex items-center gap-space-2">
                    <UserIcon className="h-4 w-4" />
                    <span>Assigned Agent</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-space-4 pb-space-4">
                  <div className="flex items-center gap-space-3">
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
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Notes Section with Continuous Scroll */}
            <AccordionItem value="notes">
              <AccordionTrigger className="px-space-4 py-space-3">
                <div className="flex items-center gap-space-2">
                  <FileText className="h-4 w-4" />
                  <span>Notes</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-space-4 pb-space-4 max-h-64">
                <NotesSection chatId={currentChat.id} />
              </AccordionContent>
            </AccordionItem>

            {/* Quick Actions */}
            <AccordionItem value="actions">
              <AccordionTrigger className="px-space-4 py-space-3">
                <span>Actions</span>
              </AccordionTrigger>
              <AccordionContent className="px-space-4 pb-space-4">
                <div className="grid grid-cols-1 gap-space-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryModalOpen(true)}
                    className="justify-start"
                  >
                    <History className="h-4 w-4 mr-space-2" />
                    View History
                  </Button>
                </div>
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
          title="Chat History"
          mode="history"
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
          <div className="p-space-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
              className="w-full h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <DetailModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Chat History"
        mode="history"
        chatId={currentChat.id}
      />

    </>
  );
}