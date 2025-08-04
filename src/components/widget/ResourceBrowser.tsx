/**
 * Resource Browser component for the chat widget
 */

import { useState } from 'react';
import { Search, FileText, ArrowLeft, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResources } from '@/hooks/useResources';

interface ResourceBrowserProps {
  onClose: () => void;
  onSelectResource: (title: string, content: string) => void;
}

export function ResourceBrowser({ onClose, onSelectResource }: ResourceBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const { resources, loading, searchResources } = useResources();

  const filteredResources = searchQuery ? searchResources(searchQuery) : resources;

  const handleResourceSelect = (resource: any) => {
    onSelectResource(resource.title, resource.contentPreview || resource.aiInstructions);
    onClose();
  };

  if (selectedResource) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => setSelectedResource(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium text-sm">Resource Details</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{selectedResource.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedResource.contentPreview || selectedResource.aiInstructions}
              </p>
              <Button 
                size="sm" 
                onClick={() => handleResourceSelect(selectedResource)}
                className="w-full"
              >
                Use This Resource
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b">
        <FileText className="h-4 w-4" />
        <h3 className="font-medium text-sm">Browse Resources</h3>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={onClose}>
          ×
        </Button>
      </div>
      
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading resources...</div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              {searchQuery ? 'No resources found for your search' : 'No resources available'}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredResources.map((resource) => (
              <Card 
                key={resource.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedResource(resource)}
              >
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-1">{resource.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {resource.contentPreview || resource.aiInstructions}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}