import React from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Chat } from '@/types';
import { MapPin, Globe, Smartphone, Clock, User, FileText, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContextPanelProps {
  currentChat?: Chat;
  users: any[];
}

export function ContextPanel({ currentChat, users }: ContextPanelProps) {
  if (!currentChat) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-lg">Engagements</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Select a chat to view details</p>
          </div>
        </CardContent>
      </>
    );
  }

  const assignedAgent = users.find(user => user.id === currentChat.assignedAgentId);

  // Mock data for history and notes
  const mockHistory = [
    {
      id: 1,
      date: '2024-01-20',
      agent: 'Alice Johnson',
      summary: 'Helped with shipping inquiry, provided tracking number',
      status: 'resolved'
    },
    {
      id: 2,
      date: '2024-01-15',
      agent: 'Bob Smith',
      summary: 'Product return request, processed refund',
      status: 'resolved'
    }
  ];

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg">Engagements</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-8rem)] [&>div>div]:!block">
          <Accordion type="single" collapsible defaultValue="details" className="w-full">
            <AccordionItem value="details" className="bg-surface/30">
              <AccordionTrigger>
                <div className="flex items-center gap-space-2">
                  <User className="h-4 w-4 text-text-secondary" />
                  <span>Details</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-background"    >
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div>
                    <div className="flex items-center gap-space-2 mb-space-3">
                      <User className="h-3 w-3 text-text-secondary" />
                      <h4 className="font-medium text-text-secondary">Customer Information</h4>
                    </div>
                    <div className="space-y-space-2 text-sm ml-space-5">
                      <p className="font-medium text-text-primary">{currentChat.requesterName}</p>
                      <div className="flex items-center gap-space-2 text-text-secondary">
                        <span>Email:</span>
                        <span>{currentChat.requesterEmail}</span>
                      </div>
                      {currentChat.requesterPhone && (
                        <div className="flex items-center gap-space-2 text-text-secondary">
                          <Smartphone className="h-3 w-3" />
                          <span>{currentChat.requesterPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Session Info */}
                  <div>
                    <div className="flex items-center gap-space-2 mb-space-3">
                      <Globe className="h-3 w-3 text-text-secondary" />
                      <h4 className="font-medium text-text-secondary">Session Details</h4>
                    </div>
                    <div className="space-y-space-2 text-sm ml-space-5">
                      <div className="flex items-center gap-space-2">
                        <MapPin className="h-3 w-3 text-text-secondary" />
                        <span className="text-text-primary">{currentChat.geo}</span>
                      </div>
                      <div>
                        <p className="text-text-secondary mb-space-1">Page URL:</p>
                        <p className="text-text-primary font-mono text-xs break-all">{currentChat.pageUrl}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary mb-space-1">Browser:</p>
                        <p className="text-text-primary">{currentChat.browser}</p>
                      </div>
                      <div className="flex items-center gap-space-2">
                        <Clock className="h-3 w-3 text-text-secondary" />
                        <span className="text-text-primary">{formatDistanceToNow(new Date(currentChat.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Agent */}
                  {assignedAgent && (
                    <div>
                      <div className="flex items-center gap-space-2 mb-space-3">
                        <User className="h-3 w-3 text-text-secondary" />
                        <h4 className="font-medium text-text-secondary">Assigned Agent</h4>
                      </div>
                      <div className="flex items-center gap-space-3 ml-space-5">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={assignedAgent.avatarUrl} />
                          <AvatarFallback>
                            {assignedAgent.firstName[0]}{assignedAgent.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-text-primary">
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
                  )}

                  {/* Chat Summary */}
                  <div>
                    <div className="flex items-center gap-space-2 mb-space-3">
                      <FileText className="h-3 w-3 text-text-secondary" />
                      <h4 className="font-medium text-text-secondary">Summary</h4>
                    </div>
                    <p className="text-sm text-text-primary ml-space-5 leading-relaxed">
                      {currentChat.summary}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="history" className="bg-surface/30">
              <AccordionTrigger>
                <div className="flex items-center gap-space-2">
                  <History className="h-4 w-4 text-text-secondary" />
                  <span>History</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-background">
                <div className="space-y-space-3">
                  {mockHistory.length === 0 ? (
                    <div className="text-center py-space-6 text-text-secondary">
                      <History className="h-8 w-8 mx-auto mb-space-3 opacity-50" />
                      <p className="text-sm">No previous interactions</p>
                    </div>
                  ) : (
                    mockHistory.map((item) => (
                      <div key={item.id} className="p-space-3 border border-border rounded-radius-md bg-surface hover:bg-surface/80 transition-colors">
                        <div className="flex items-center justify-between mb-space-2">
                          <span className="text-sm font-medium text-text-primary">{item.date}</span>
                          <Badge variant={item.status === 'resolved' ? 'default' : 'secondary'} className="text-xs">
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary mb-space-2">
                          Agent: {item.agent}
                        </p>
                        <p className="text-sm text-text-primary leading-relaxed">{item.summary}</p>
                        <div className="flex justify-end mt-space-2">
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary">
                            View details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="notes" className="bg-surface/30">
              <AccordionTrigger>
                <div className="flex items-center gap-space-2">
                  <FileText className="h-4 w-4 text-text-secondary" />
                  <span>Notes</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-background">
                <div className="space-y-space-3">
                  <Textarea
                    placeholder="Add notes about this customer or conversation..."
                    className="min-h-32 resize-none"
                  />
                  <Button variant="highlight" size="sm" className="gap-space-1">
                    <FileText className="h-3 w-3" />
                    Add Note
                  </Button>
                  
                  <div className="mt-space-4">
                    <h5 className="text-sm font-medium mb-space-3 text-text-secondary">Previous Notes</h5>
                    <div className="text-center py-space-6 text-text-secondary">
                      <FileText className="h-8 w-8 mx-auto mb-space-3 opacity-50" />
                      <p className="text-sm">No notes yet</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </CardContent>
    </>
  );
}