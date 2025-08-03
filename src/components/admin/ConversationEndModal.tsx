/**
 * Modal for confirming conversation end with feedback options
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare, X } from 'lucide-react';

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
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmitFeedback = () => {
    onConfirm({ rating: rating.toString(), comment });
  };

  const handleCancel = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-lg">
            How was your experience?
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
          <p className="text-sm text-muted-foreground">
            Please rate your experience and help us improve our service.
          </p>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">
                How would you rate your experience?
              </Label>
              {renderStarRating()}
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
              disabled={rating === 0}
            >
              Submit & End
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}