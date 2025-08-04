/**
 * Component displayed when chat is closed with option to start new chat
 */

import { MessageCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ChatClosedStateProps {
  onStartNewChat: () => void;
  primaryColor: string;
  assistantName: string;
}

export function ChatClosedState({ onStartNewChat, primaryColor, assistantName }: ChatClosedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <MessageCircle 
              className="h-8 w-8" 
              style={{ color: primaryColor }}
            />
          </div>
          
          <h3 className="font-medium text-lg mb-2">Chat Ended</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Your conversation with {assistantName} has ended. You can start a new conversation anytime.
          </p>
          
          <Button 
            onClick={onStartNewChat}
            className="w-full text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Start New Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}