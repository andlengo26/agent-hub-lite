import { useState, useEffect } from 'react';

export interface Resource {
  id: string;
  title: string;
  tags: string[];
  type: 'document' | 'video' | 'link' | 'template';
  url: string;
  fileName?: string;
  fileSize?: number;
  aiInstructions: string;
  contentPreview?: string;
  uploadedById: string;
  uploadedAt: string;
  updatedAt: string;
  displayInChat: boolean;
}

interface ResourcesResponse {
  data: Resource[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/mocks/resources.json');
      const data: ResourcesResponse = await response.json();
      
      // Filter resources that should be displayed in chat
      const chatResources = data.data.filter(resource => resource.displayInChat);
      setResources(chatResources);
      setError(null);
    } catch (err) {
      setError('Failed to load resources');
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const searchResources = (query: string) => {
    if (!query.trim()) return resources;
    
    const searchLower = query.toLowerCase();
    return resources.filter(resource =>
      resource.title.toLowerCase().includes(searchLower) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      resource.aiInstructions.toLowerCase().includes(searchLower)
    );
  };

  return {
    resources,
    loading,
    error,
    searchResources,
    refetch: loadResources
  };
}