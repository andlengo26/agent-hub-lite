import React, { useState, useEffect, useRef } from 'react';
import { FormModal } from '@/components/common/FormModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Resource } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Eye, EyeOff } from 'lucide-react';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resource?: Resource | null;
}

export function ResourceModal({ isOpen, onClose, onSuccess, resource }: ResourceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    url: '',
    fileName: '',
    fileContent: '',
    fileSize: 0,
    aiInstructions: '',
    tags: [] as string[],
    newTag: '',
    contentPreview: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        type: resource.type,
        url: resource.url || '',
        fileName: resource.fileName || '',
        fileContent: resource.fileContent || '',
        fileSize: resource.fileSize || 0,
        aiInstructions: resource.aiInstructions,
        tags: resource.tags,
        newTag: '',
        contentPreview: resource.contentPreview || '',
      });
    } else {
      setFormData({
        title: '',
        type: '',
        url: '',
        fileName: '',
        fileContent: '',
        fileSize: 0,
        aiInstructions: '',
        tags: [],
        newTag: '',
        contentPreview: '',
      });
    }
  }, [resource, isOpen]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileContent: content,
        fileSize: file.size,
        url: '', // Clear URL when file is uploaded
        contentPreview: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
      }));
    };
    reader.readAsText(file);
  };

  const generatePreview = async () => {
    if (!formData.url) return;
    
    setPreviewLoading(true);
    // Simulate fetching URL content
    setTimeout(() => {
      const mockContent = `Preview content from ${formData.url}. This would contain the actual content fetched from the URL in a real implementation.`;
      setFormData(prev => ({
        ...prev,
        contentPreview: mockContent,
      }));
      setPreviewLoading(false);
      setShowPreview(true);
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.type) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and type fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.fileContent && !formData.url) {
      toast({
        title: "Validation Error",
        description: "Please either upload a file or provide a URL.",
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
    if (formData.newTag && !formData.tags.includes(formData.newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag],
        newTag: '',
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
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
      <div className="space-y-space-6">
        {/* Basic Information */}
        <div className="space-y-space-4">
          <div>
            <Label htmlFor="title">Resource Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter resource title"
              className="mt-space-1"
            />
          </div>

          <div>
            <Label htmlFor="type">Resource Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
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
        </div>

        {/* Content Source */}
        <div className="space-y-space-4">
          <Label>Content Source</Label>
          
          {/* File Upload */}
          <div className="border border-dashed border-border rounded-lg p-space-4">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-space-2" />
              <div className="text-sm text-muted-foreground mb-space-2">
                Upload a file or drag and drop
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".txt,.md,.pdf,.doc,.docx"
              />
              {formData.fileName && (
                <div className="mt-space-2 flex items-center justify-center gap-space-2">
                  <span className="text-sm font-medium">{formData.fileName}</span>
                  <span className="text-sm text-muted-foreground">
                    ({(formData.fileSize / 1024).toFixed(1)} KB)
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      fileName: '', 
                      fileContent: '', 
                      fileSize: 0,
                      contentPreview: '',
                    }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* URL Alternative */}
          <div className="text-center text-sm text-muted-foreground">
            — OR —
          </div>

          <div>
            <Label htmlFor="url">URL</Label>
            <div className="flex gap-space-2 mt-space-1">
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com/resource"
                disabled={!!formData.fileName}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generatePreview}
                disabled={!formData.url || previewLoading || !!formData.fileName}
              >
                {previewLoading ? 'Loading...' : 'Preview'}
              </Button>
            </div>
            {formData.fileName && (
              <p className="text-sm text-muted-foreground mt-space-1">
                URL input is disabled when a file is uploaded
              </p>
            )}
          </div>
        </div>

        {/* Content Preview */}
        {(formData.contentPreview || showPreview) && (
          <div className="space-y-space-2">
            <div className="flex items-center justify-between">
              <Label>Content Preview</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {showPreview && (
              <ScrollArea className="h-32 border rounded-md">
                <div className="p-space-3 text-sm text-text-secondary">
                  {formData.contentPreview || 'No preview available'}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* AI Instructions */}
        <div>
          <Label htmlFor="aiInstructions">AI Instructions</Label>
          <Textarea
            id="aiInstructions"
            value={formData.aiInstructions}
            onChange={(e) => setFormData(prev => ({ ...prev, aiInstructions: e.target.value }))}
            placeholder="Instructions for how AI should use this resource..."
            className="mt-space-1"
            rows={3}
          />
        </div>

        {/* Tags */}
        <div className="space-y-space-2">
          <Label>Tags</Label>
          <div className="flex gap-space-2">
            <Input
              value={formData.newTag}
              onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
              placeholder="Add a tag"
              onKeyPress={handleKeyPress}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-space-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-space-1">
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
    </FormModal>
  );
}