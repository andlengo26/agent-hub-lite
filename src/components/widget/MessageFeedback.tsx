/**
 * Message feedback component with thumbs up/down buttons
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageFeedbackProps {
  messageId: string;
  onFeedback: (messageId: string, feedback: 'positive' | 'negative', comment?: string) => void;
  disabled?: boolean;
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    highlightColor: string;
  };
}

export function MessageFeedback({ messageId, onFeedback, disabled = false, appearance }: MessageFeedbackProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFeedback = async (type: 'positive' | 'negative') => {
    if (disabled || isSubmitting || feedback) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFeedback(type);
      onFeedback(messageId, type);
      
      toast({
        title: "Thank you!",
        description: type === 'positive' ? "We're glad this was helpful!" : "We'll use your feedback to improve.",
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (feedback) {
    return (
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <span>Thank you for your feedback!</span>
        {feedback === 'positive' ? (
          <ThumbsUp className="h-3 w-3 text-green-600" />
        ) : (
          <ThumbsDown className="h-3 w-3 text-red-600" />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-xs text-muted-foreground mr-2">Was this helpful?</span>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-700"
        onClick={() => handleFeedback('positive')}
        disabled={disabled || isSubmitting}
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
        onClick={() => handleFeedback('negative')}
        disabled={disabled || isSubmitting}
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
    </div>
  );
}