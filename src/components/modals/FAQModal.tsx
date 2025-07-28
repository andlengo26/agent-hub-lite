import React, { useState, useEffect } from 'react';
import { FormModal } from '@/components/common/FormModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { FAQ } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  faq?: FAQ | null;
}

export function FAQModal({ isOpen, onClose, onSuccess, faq }: FAQModalProps) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    tags: [] as string[],
    newTag: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question,
        answer: faq.answer,
        tags: faq.tags,
        newTag: '',
      });
    } else {
      setFormData({
        question: '',
        answer: '',
        tags: [],
        newTag: '',
      });
    }
  }, [faq, isOpen]);

  const handleSubmit = async () => {
    if (!formData.question || !formData.answer) {
      toast({
        title: "Validation Error",
        description: "Please fill in both question and answer fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      toast({
        title: faq ? "FAQ Updated" : "FAQ Created",
        description: `FAQ "${formData.question}" has been ${faq ? 'updated' : 'created'} successfully.`,
      });
      setIsLoading(false);
      onSuccess();
      onClose();
    }, 1000);
  };

  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: '',
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={faq ? "Edit FAQ" : "Add FAQ"}
      description={faq ? "Update the FAQ information" : "Create a new frequently asked question"}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitLabel={faq ? "Update" : "Create"}
      size="lg"
    >
      <div className="space-y-space-4">
        <div>
          <Label htmlFor="question">Question</Label>
          <Input
            id="question"
            value={formData.question}
            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
            placeholder="Enter the question"
            className="mt-space-1"
          />
        </div>

        <div>
          <Label htmlFor="answer">Answer</Label>
          <Textarea
            id="answer"
            value={formData.answer}
            onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
            placeholder="Enter the answer"
            rows={4}
            className="mt-space-1"
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <div className="mt-space-1 space-y-space-2">
            <div className="flex gap-space-2">
              <Input
                id="tags"
                value={formData.newTag}
                onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                placeholder="Enter a tag and press Enter"
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-space-1">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-space-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </FormModal>
  );
}