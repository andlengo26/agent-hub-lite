import React from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Chat } from '@/types';
import { useAgentConsole } from '@/contexts/AgentConsoleContext';
import { MapPin, Globe, Smartphone, Clock, User, FileText, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContextPanelProps {
  currentChat?: Chat;
  users: any[];
}

export function ContextPanel({ currentChat, users }: ContextPanelProps) {
  const { contextPanelTab, setContextPanelTab } = useAgentConsole();

  if (!currentChat) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-lg">Context</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-text-secondary">
            <User className="h-8 w-8 mx-auto mb-space-2 opacity-50" />
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
        <CardTitle className="text-lg">Context</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={contextPanelTab} onValueChange={setContextPanelTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              Details
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="h-3 w-3 mr-1" />
              History
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="p-space-4 m-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-space-4">
                {/* Customer Info */}
                <div>
                  <h4 className="font-medium mb-space-2">Customer Information</h4>
                  <div className="space-y-space-2 text-sm">
                    <div className="flex items-center gap-space-2">
                      <User className="h-4 w-4 text-text-secondary" />
                      <span>{currentChat.requesterName}</span>
                    </div>
                    <div className="flex items-center gap-space-2">
                      <span className="text-text-secondary">Email:</span>
                      <span>{currentChat.requesterEmail}</span>
                    </div>
                    {currentChat.requesterPhone && (
                      <div className="flex items-center gap-space-2">
                        <Smartphone className="h-4 w-4 text-text-secondary" />
                        <span>{currentChat.requesterPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Session Info */}
                <div>
                  <h4 className="font-medium mb-space-2">Session Details</h4>
                  <div className="space-y-space-2 text-sm">
                    <div className="flex items-center gap-space-2">
                      <MapPin className="h-4 w-4 text-text-secondary" />
                      <span>{currentChat.geo}</span>
                    </div>
                    <div className="flex items-center gap-space-2">
                      <Globe className="h-4 w-4 text-text-secondary" />
                      <span className="truncate">{currentChat.pageUrl}</span>
                    </div>
                    <div className="flex items-center gap-space-2">
                      <span className="text-text-secondary">Browser:</span>
                      <span>{currentChat.browser}</span>
                    </div>
                    <div className="flex items-center gap-space-2">
                      <Clock className="h-4 w-4 text-text-secondary" />
                      <span>{formatDistanceToNow(new Date(currentChat.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>

                {/* Assigned Agent */}
                {assignedAgent && (
                  <div>
                    <h4 className="font-medium mb-space-2">Assigned Agent</h4>
                    <div className="flex items-center gap-space-2">
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
                        <div className="text-xs text-text-secondary">
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
                  <h4 className="font-medium mb-space-2">Summary</h4>
                  <p className="text-sm text-text-secondary">
                    {currentChat.summary}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="p-space-4 m-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-space-3">
                <h4 className="font-medium">Previous Interactions</h4>
                {mockHistory.length === 0 ? (
                  <div className="text-center py-space-4 text-text-secondary">
                    <History className="h-6 w-6 mx-auto mb-space-2 opacity-50" />
                    <p className="text-sm">No previous interactions</p>
                  </div>
                ) : (
                  mockHistory.map((item) => (
                    <div key={item.id} className="border rounded-radius-md p-space-3">
                      <div className="flex items-center justify-between mb-space-2">
                        <span className="text-sm font-medium">{item.date}</span>
                        <Badge variant={item.status === 'resolved' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary mb-space-1">
                        Agent: {item.agent}
                      </p>
                      <p className="text-sm">{item.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="notes" className="p-space-4 m-0">
            <div className="space-y-space-3">
              <h4 className="font-medium">Internal Notes</h4>
              <Textarea
                placeholder="Add notes about this customer or conversation..."
                className="min-h-32"
              />
              <Button size="sm" className="w-full">
                Save Note
              </Button>
              
              <div className="mt-space-4">
                <h5 className="text-sm font-medium mb-space-2">Previous Notes</h5>
                <div className="text-center py-space-4 text-text-secondary">
                  <FileText className="h-6 w-6 mx-auto mb-space-2 opacity-50" />
                  <p className="text-sm">No notes yet</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  );
}