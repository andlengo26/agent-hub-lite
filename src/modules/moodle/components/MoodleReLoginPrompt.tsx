/**
 * Consolidated Moodle Re-Login Prompt
 * Moved from widget components to Moodle module
 */

import { useState } from 'react';
import { User, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface MoodleReLoginPromptProps {
  onReLogin: () => Promise<boolean>;
  onDismiss: () => void;
  previousSessionData?: {
    username?: string;
    lastActive?: string;
  };
}

export function MoodleReLoginPrompt({ onReLogin, onDismiss, previousSessionData }: MoodleReLoginPromptProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  const handleReLogin = async () => {
    setIsLoggingIn(true);
    try {
      const success = await onReLogin();
      if (success) {
        toast({
          title: "Login Successful",
          description: "Your chat history has been merged with your Moodle account"
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Unable to connect to your Moodle account. You can continue without logging in.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to Moodle. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="p-4">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Moodle Account Detected</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {previousSessionData?.username ? (
              <>
                We found a previous session for <strong>{previousSessionData.username}</strong>
                {previousSessionData.lastActive && (
                  <> from {new Date(previousSessionData.lastActive).toLocaleDateString()}</>
                )}.
              </>
            ) : (
              'We detected you may have used this chat before with your Moodle account.'
            )}
          </div>
          
          <div className="text-sm">
            <strong>Re-login to:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
              <li>Access your previous chat history</li>
              <li>Continue where you left off</li>
              <li>Keep your conversation context</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleReLogin}
              disabled={isLoggingIn}
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoggingIn ? 'animate-spin' : ''}`} />
              {isLoggingIn ? 'Connecting...' : 'Re-login to Moodle'}
            </Button>
            <Button
              variant="outline"
              onClick={onDismiss}
              disabled={isLoggingIn}
            >
              Continue Without Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}