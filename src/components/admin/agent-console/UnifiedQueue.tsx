import React from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chat } from '@/types';
import { useAgentConsole } from '@/contexts/AgentConsoleContext';
import { migrateLegacyChat } from '@/utils/chatFilters';
import { MapPin, Clock, Phone, Brain, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UnifiedQueueProps {
  chats: Chat[];
  isLoading?: boolean;
  users: any[]; // User list to get agent names
}

export function UnifiedQueue({ chats, isLoading, users }: UnifiedQueueProps) {
  const { acceptChat, selectedQueueChat, setSelectedQueueChat } = useAgentConsole();
  
  // Process and filter chats to show all waiting chats
  const processedChats = React.useMemo(() => {
    return chats
      .map(migrateLegacyChat)
      .filter(chat => chat.status === 'waiting' || chat.status === 'active');
  }, [chats]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'waiting': return 'outline';
      case 'missed': return 'destructive';
      case 'closed': return 'secondary';
      case 'escalated': return 'destructive';
      case 'ai-timeout': return 'destructive';
      default: return 'outline';
    }
  };

  const getChatTypeIcon = (chat: Chat) => {
    if (chat.handledBy === 'ai' || chat.aiStartedAt) {
      return (
        <div title="AI handled">
          <Brain className="h-3 w-3 text-blue-500" />
        </div>
      );
    }
    return (
      <div title="Human handled">
        <User className="h-3 w-3 text-green-500" />
      </div>
    );
  };

  const getAgentName = (chat: Chat) => {
    if (!chat.assignedAgentId) return null;
    const agent = users.find(user => user.id === chat.assignedAgentId);
    return agent?.name || agent?.email || 'Unknown Agent';
  };

  if (isLoading) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-lg">Chat Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Chat Queue
          <Badge variant="secondary" className="ml-2">
            {processedChats.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-2 p-4">
            {processedChats.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No chats in queue</p>
              </div>
            ) : (
              processedChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-muted ${
                    selectedQueueChat?.id === chat.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => setSelectedQueueChat(chat)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">
                            {chat.requesterName || 'Anonymous User'}
                          </h4>
                          {getChatTypeIcon(chat)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.requesterEmail || chat.anonymousUserId || 'No email provided'}
                        </p>
                        {/* Show assigned agent name */}
                        {getAgentName(chat) && (
                          <p className="text-xs text-blue-600 font-medium">
                            Assigned to: {getAgentName(chat)}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant={getStatusBadgeVariant((chat as any).status)}
                        className="text-xs ml-2 flex-shrink-0"
                      >
                        {(chat as any).status === 'ai-timeout' ? 'AI Timeout' : 
                         (chat as any).status === 'escalated' ? 'Escalated' : 
                         chat.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{chat.geo}</span>
                      </div>
                      {chat.requesterPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{chat.requesterPhone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {chat.summary}
                    </p>

                    {chat.status === 'waiting' && !chat.assignedAgentId && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptChat(chat);
                        }}
                        className="w-full"
                        variant="default"
                      >
                        Accept Chat
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </>
  );
}