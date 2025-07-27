import React from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Chat } from '@/types';
import { MapPin, Globe, Smartphone, Clock, User, FileText, History, Mail } from 'lucide-react';
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
      status: 'resolved',
      type: 'chat'
    },
    {
      id: 2,
      date: '2024-01-18',
      agent: 'System',
      summary: `Follow-up email sent for missed chat. Subject: "Follow-up regarding your recent inquiry - ${currentChat.requesterName}"`,
      status: 'email_sent',
      type: 'email'
    },
    {
      id: 3,
      date: '2024-01-15',
      agent: 'Bob Smith',
      summary: 'Product return request, processed refund',
      status: 'resolved',
      type: 'chat'
    }
  ];

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg">Engagements</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <Accordion type="single" collapsible defaultValue="details" className="w-full">
            <AccordionItem value="details">
              <AccordionTrigger className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Details</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{currentChat.requesterName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{currentChat.requesterEmail}</span>
                      </div>
                      {currentChat.requesterPhone && (
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span>{currentChat.requesterPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Session Info */}
                  <div>
                    <h4 className="font-medium mb-2">Session Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{currentChat.geo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{currentChat.pageUrl}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Browser:</span>
                        <span>{currentChat.browser}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDistanceToNow(new Date(currentChat.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Agent */}
                  {assignedAgent && (
                    <div>
                      <h4 className="font-medium mb-2">Assigned Agent</h4>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={assignedAgent.avatarUrl} />
                          <AvatarFallback>
                            {assignedAgent.firstName[0]}{assignedAgent.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {assignedAgent.firstName} {assignedAgent.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {assignedAgent.role}
                          </div>
                        </div>
                        <Badge 
                          variant={assignedAgent.onlineStatus === 'online' ? 'default' : 'secondary'}
                          className="ml-auto"
                        >
                          {assignedAgent.onlineStatus}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Chat Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentChat.summary}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="history">
              <AccordionTrigger className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Previous Interactions</h4>
                  {mockHistory.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <History className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No previous interactions</p>
                    </div>
                  ) : (
                    mockHistory.map((item) => (
                      <div 
                        key={item.id} 
                        className={`border rounded-md p-3 ${
                          item.type === 'email' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {item.type === 'email' && <Mail className="h-4 w-4 text-blue-600" />}
                            <span className="text-sm font-medium">{item.date}</span>
                          </div>
                          <Badge variant={
                            item.status === 'resolved' ? 'default' : 
                            item.status === 'email_sent' ? 'outline' : 
                            'secondary'
                          }>
                            {item.status === 'email_sent' ? 'Email Sent' : item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {item.type === 'email' ? 'Email Follow-up' : `Agent: ${item.agent}`}
                        </p>
                        <p className="text-sm">{item.summary}</p>
                      </div>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="notes">
              <AccordionTrigger className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Notes</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Internal Notes</h4>
                  <Textarea
                    placeholder="Add notes about this customer or conversation..."
                    className="min-h-32"
                  />
                  <Button size="sm" className="w-full">
                    Save Note
                  </Button>
                  
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-2">Previous Notes</h5>
                    <div className="text-center py-4 text-muted-foreground">
                      <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
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