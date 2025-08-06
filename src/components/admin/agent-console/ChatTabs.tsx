
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAgentConsole } from '@/contexts/AgentConsoleContext';
import { X } from 'lucide-react';

export function ChatTabs() {
  const { activeChats, currentChatId, switchToChat, closeChat } = useAgentConsole();

  if (activeChats.length <= 1) return null;

  return (
    <Tabs value={currentChatId || ''} onValueChange={switchToChat}>
      <TabsList className="w-full justify-start overflow-x-auto">
        {activeChats.map((chat) => (
          <TabsTrigger
            key={chat.id}
            value={chat.id}
            className="relative group flex items-center gap-2 min-w-0"
          >
            <span className="truncate max-w-24">
              {chat.requesterName}
            </span>
            {chat.unreadCount && chat.unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs h-4 w-4 p-0 flex items-center justify-center">
                {chat.unreadCount}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                closeChat(chat.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}