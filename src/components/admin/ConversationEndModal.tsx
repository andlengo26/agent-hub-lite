/**
 * Modal for confirming conversation end with feedback options
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react';

interface ConversationEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (feedback?: { rating: string; comment: string }) => void;
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    highlightColor: string;
  };
}

export function ConversationEndModal({ isOpen, onClose, onConfirm, appearance }: ConversationEndModalProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState<string>('');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleEndWithoutFeedback = () => {
    onConfirm();
  };

  const handleEndWithFeedback = () => {
    setShowFeedback(true);
  };

  const handleSubmitFeedback = () => {
    onConfirm({ rating, comment });
  };

  const handleCancel = () => {
    setShowFeedback(false);
    setRating('');
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-lg">
            {showFeedback ? 'How was your experience?' : 'End Conversation'}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!showFeedback ? (
            <>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to end this conversation?
              </p>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleEndWithFeedback}
                  className="w-full text-white"
                  style={{ backgroundColor: appearance.primaryColor }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  End & Give Feedback
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleEndWithoutFeedback}
                  className="w-full"
                >
                  End Without Feedback
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">
                    How would you rate your experience?
                  </Label>
                  <RadioGroup value={rating} onValueChange={setRating} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="satisfied" id="satisfied" />
                      <Label htmlFor="satisfied" className="flex items-center cursor-pointer">
                        <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                        Satisfied
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="neutral" id="neutral" />
                      <Label htmlFor="neutral" className="cursor-pointer">
                        Neutral
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unsatisfied" id="unsatisfied" />
                      <Label htmlFor="unsatisfied" className="flex items-center cursor-pointer">
                        <ThumbsDown className="h-4 w-4 mr-1 text-red-500" />
                        Unsatisfied
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label htmlFor="comment" className="text-sm font-medium">
                    Comments (optional)
                  </Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us how we can improve..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitFeedback}
                  className="flex-1 text-white"
                  style={{ backgroundColor: appearance.primaryColor }}
                  disabled={!rating}
                >
                  Submit & End
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFeedback(false)}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}