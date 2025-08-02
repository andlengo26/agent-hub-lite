import React from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chat } from '@/types';
import { useAgentConsole } from '@/contexts/AgentConsoleContext';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { isActiveAIChat, migrateLegacyChat, shouldAITimeout } from '@/utils/chatFilters';
import { MapPin, Clock, Phone, Brain, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AIQueueProps {
  chats: Chat[];
  isLoading?: boolean;
}

export function AIQueue({ chats, isLoading }: AIQueueProps) {
  const { acceptAIHandoff, selectedAIChat, setSelectedAIChat, escalateChat } = useAgentConsole();
  const { settings: widgetSettings } = useWidgetSettings();
  
  // Filter and migrate chats for AI handling
  const processedChats = React.useMemo(() => {
    return chats
      .map(migrateLegacyChat)
      .filter(chat => isActiveAIChat(chat, widgetSettings));
  }, [chats, widgetSettings]);

  const getAIStatusBadgeVariant = (chat: Chat) => {
    if (shouldAITimeout(chat, widgetSettings)) {
      return 'destructive';
    }
    return 'default';
  };

  const getAIStatusText = (chat: Chat) => {
    if (shouldAITimeout(chat, widgetSettings)) {
      return 'Timeout';
    }
    return 'AI Active';
  };

  if (isLoading) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-lg">AI Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
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
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI Queue
          </div>
          <Badge variant="secondary" className="ml-2">
            {processedChats.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(50vh-8rem)]">
          <div className="space-y-2 p-4">
            {processedChats.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No AI chats active</p>
              </div>
            ) : (
              processedChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-muted ${
                    selectedAIChat?.id === chat.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => setSelectedAIChat(chat)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">
                            {chat.requesterName || 'Anonymous User'}
                          </h4>
                          {shouldAITimeout(chat, widgetSettings) && (
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.requesterEmail || chat.anonymousUserId || 'No email provided'}
                        </p>
                      </div>
                      <Badge 
                        variant={getAIStatusBadgeVariant(chat)}
                        className="text-xs ml-2 flex-shrink-0"
                      >
                        {getAIStatusText(chat)}
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
                      AI started: {chat.aiStartedAt 
                        ? formatDistanceToNow(new Date(chat.aiStartedAt), { addSuffix: true })
                        : formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })
                      }
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {chat.summary}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptAIHandoff(chat);
                        }}
                        className="flex-1"
                        variant="default"
                      >
                        Takeover Conversation
                      </Button>
                      {shouldAITimeout(chat, widgetSettings) && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            escalateChat(chat.id, 'AI timeout - escalated to human agent');
                          }}
                          variant="destructive"
                          className="flex-1"
                        >
                          Escalate
                        </Button>
                      )}
                    </div>
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