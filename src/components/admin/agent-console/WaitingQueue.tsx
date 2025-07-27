import React from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chat } from '@/types';
import { useAgentConsole } from '@/contexts/AgentConsoleContext';
import { MapPin, Clock, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WaitingQueueProps {
  chats: Chat[];
  isLoading?: boolean;
}

export function WaitingQueue({ chats, isLoading }: WaitingQueueProps) {
  const { acceptChat, selectedQueueChat, setSelectedQueueChat } = useAgentConsole();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'missed': return 'destructive';
      case 'closed': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-lg">Waiting Queue</CardTitle>
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
          Waiting Queue
          <Badge variant="secondary" className="ml-2">
            {chats.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-2 p-4">
            {chats.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No chats waiting</p>
              </div>
            ) : (
              chats.map((chat) => (
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
                        <h4 className="font-medium text-sm truncate">
                          {chat.requesterName}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.requesterEmail}
                        </p>
                      </div>
                      <Badge 
                        variant={getStatusBadgeVariant(chat.status)}
                        className="text-xs ml-2 flex-shrink-0"
                      >
                        {chat.status}
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