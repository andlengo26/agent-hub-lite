import React from 'react';
import { CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/types';
import { useAgentConsole } from '@/contexts/AgentConsoleContext';
import { ChatTabs } from './ChatTabs';
import { Send, Paperclip, Smile, MoreHorizontal, Phone, Video, Archive } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface ActiveChatPaneProps {
  currentChat?: Chat;
}

export function ActiveChatPane({ currentChat }: ActiveChatPaneProps) {
  const { activeChats, closeChat } = useAgentConsole();

  if (!currentChat) {
    return (
      <>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">No Active Chat</h3>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-4">💬</div>
            <p>Select a chat from the queue to start helping customers</p>
          </div>
        </CardContent>
      </>
    );
  }

  // Mock messages for demonstration
  const mockMessages = [
    {
      id: 1,
      type: 'customer',
      content: 'Hi, I need help with my recent order',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: 2,
      type: 'agent',
      content: 'Hello! I\'d be happy to help you with your order. Could you please provide your order number?',
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
    },
    {
      id: 3,
      type: 'customer',
      content: 'Sure, it\'s #12345. I ordered it 3 days ago but haven\'t received any tracking information.',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
    },
    {
      id: 4,
      type: 'system',
      content: 'Order #12345 details loaded - Status: Shipped, Tracking: ABC123456789',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
  ];

  return (
    <>
      <CardHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-medium">{currentChat.requesterName}</h3>
              <p className="text-sm text-muted-foreground">{currentChat.requesterEmail}</p>
            </div>
            <Badge variant="secondary">
              {currentChat.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => closeChat(currentChat.id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Close Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Chat Tabs */}
        {activeChats.length > 1 && (
          <div className="mt-3">
            <ChatTabs />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'agent' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-md ${
                    message.type === 'agent'
                      ? 'bg-primary text-white'
                      : message.type === 'system'
                      ? 'bg-muted text-muted-foreground border text-center'
                      : 'bg-muted border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'agent' ? 'text-white/70' : 'text-muted-foreground'
                  }`}>
                    {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Input
                  placeholder="Type your message..."
                  className="pr-12"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
}