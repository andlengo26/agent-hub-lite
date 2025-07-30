/**
 * Component to display customer indicators for consolidated chats
 */
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConsolidatedChat } from '@/services/chatDeduplicationService';

interface CustomerIndicatorProps {
  chat: ConsolidatedChat;
  showDetails?: boolean;
}

export function CustomerIndicator({ chat, showDetails = false }: CustomerIndicatorProps) {
  if (chat.totalChats <= 1) {
    return null;
  }

  const indicatorText = `+${chat.totalChats - 1}`;
  const tooltipText = `This customer has ${chat.totalChats} total chats. Other chats: ${chat.otherChatIds.join(', ')}`;

  const content = (
    <Badge 
      variant="secondary" 
      className="ml-2 text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
    >
      {indicatorText}
    </Badge>
  );

  if (!showDetails) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-sm">
            <p className="font-medium">Multiple Chats Detected</p>
            <p className="text-muted-foreground mt-1">{tooltipText}</p>
            <p className="text-muted-foreground mt-1">
              Last interaction: {new Date(chat.lastInteractionDate).toLocaleString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}