import React, { useState, useEffect } from 'react';
import { FormModal } from '@/components/common/FormModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Resource } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resource?: Resource | null;
}

export function ResourceModal({ isOpen, onClose, onSuccess, resource }: ResourceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: '' as 'document' | 'video' | 'link' | 'template' | '',
    url: '',
    aiInstructions: '',
    tags: [] as string[],
    newTag: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        type: resource.type,
        url: resource.url,
        aiInstructions: resource.aiInstructions,
        tags: resource.tags,
        newTag: '',
      });
    } else {
      setFormData({
        title: '',
        type: '',
        url: '',
        aiInstructions: '',
        tags: [],
        newTag: '',
      });
    }
  }, [resource, isOpen]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.type || !formData.url || !formData.aiInstructions) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      toast({
        title: resource ? "Resource Updated" : "Resource Created",
        description: `Resource "${formData.title}" has been ${resource ? 'updated' : 'created'} successfully.`,
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
      title={resource ? "Edit Resource" : "Add Resource"}
      description={resource ? "Update the resource information" : "Create a new AI training resource"}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitLabel={resource ? "Update" : "Create"}
      size="lg"
    >
      <div className="space-y-space-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter resource title"
            className="mt-space-1"
          />
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="mt-space-1">
              <SelectValue placeholder="Select resource type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="link">Link</SelectItem>
              <SelectItem value="template">Template</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="Enter resource URL"
            className="mt-space-1"
          />
        </div>

        <div>
          <Label htmlFor="aiInstructions">AI Instructions</Label>
          <Textarea
            id="aiInstructions"
            value={formData.aiInstructions}
            onChange={(e) => setFormData(prev => ({ ...prev, aiInstructions: e.target.value }))}
            placeholder="Instructions for AI on how to use this resource"
            rows={3}
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