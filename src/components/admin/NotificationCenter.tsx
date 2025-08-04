import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  MessageCircle,
  AlertTriangle,
  Info,
  UserPlus,
  TrendingUp,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface NotificationAction {
  type: 'accept' | 'reject' | 'reply' | 'review';
  label: string;
}

interface Notification {
  id: string;
  type: 'new_chat' | 'chat_message' | 'escalation' | 'quota_alert' | 'system_alert';
  title: string;
  message: string;
  chatId?: string;
  customerId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  actions: NotificationAction[];
}

interface NotificationCenterProps {
  notifications?: Notification[];
  unreadCount?: number;
}

const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    type: 'new_chat',
    title: 'New Chat Assignment',
    message: 'You have been assigned a new chat from customer Sarah Johnson',
    chatId: 'chat_001',
    customerId: 'customer_001',
    priority: 'normal',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    actions: [
      { type: 'accept', label: 'Accept Chat' },
      { type: 'reject', label: 'Decline' }
    ]
  },
  {
    id: 'notif_002',
    type: 'chat_message',
    title: 'New Message',
    message: 'Customer has sent a new message in active chat',
    chatId: 'chat_002',
    customerId: 'customer_002',
    priority: 'high',
    read: true,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    actions: [
      { type: 'reply', label: 'Reply Now' }
    ]
  },
  {
    id: 'notif_003',
    type: 'escalation',
    title: 'Chat Escalated',
    message: 'Chat has been escalated to manager review',
    chatId: 'chat_003',
    customerId: 'customer_003',
    priority: 'urgent',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    actions: [
      { type: 'review', label: 'Review Chat' }
    ]
  }
];

export function NotificationCenter({ 
  notifications = mockNotifications,
  unreadCount = 2
}: NotificationCenterProps) {
  const [notificationList, setNotificationList] = useState(notifications);
  const [unread, setUnread] = useState(unreadCount);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_chat':
        return <UserPlus className="w-4 h-4 text-primary" />;
      case 'chat_message':
        return <MessageCircle className="w-4 h-4 text-secondary" />;
      case 'escalation':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'quota_alert':
        return <TrendingUp className="w-4 h-4 text-highlight" />;
      case 'system_alert':
        return <Info className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-destructive bg-destructive/5';
      case 'high':
        return 'border-l-highlight bg-highlight/5';
      case 'normal':
        return 'border-l-primary bg-primary/5';
      case 'low':
        return 'border-l-muted-foreground bg-muted/5';
      default:
        return 'border-l-border';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotificationList(prev => 
      prev.map(notif => {
        if (notif.id === notificationId && !notif.read) {
          setUnread(count => Math.max(0, count - 1));
          return { ...notif, read: true };
        }
        return notif;
      })
    );
  };

  const markAllAsRead = () => {
    setNotificationList(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnread(0);
    toast({ title: 'All notifications marked as read' });
  };

  const handleAction = (notification: Notification, action: NotificationAction) => {
    markAsRead(notification.id);
    toast({
      title: `${action.label} clicked`,
      description: `Action for: ${notification.title}`
    });
  };

  const dismissNotification = (notificationId: string) => {
    setNotificationList(prev => prev.filter(notif => notif.id !== notificationId));
    toast({ title: 'Notification dismissed' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unread > 9 ? '9+' : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-space-3">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <div className="flex items-center gap-space-2">
            {unread > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-6 px-2"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-80">
          {notificationList.length === 0 ? (
            <div className="p-space-4 text-center text-muted-foreground">
              <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notificationList.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    relative p-space-3 border-l-2 cursor-pointer hover:bg-muted/50 transition-colors
                    ${getPriorityColor(notification.priority)}
                    ${!notification.read ? 'bg-muted/20' : ''}
                  `}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-space-2">
                    <div className="flex items-start gap-space-2 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-space-2">
                          <h4 className="text-sm font-medium truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                        
                        {notification.actions.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {notification.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant={action.type === 'accept' ? 'default' : 'outline'}
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(notification, action);
                                }}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notification.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}