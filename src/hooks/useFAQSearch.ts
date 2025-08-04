/**
 * Hook for searching and managing FAQ data
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface FAQResponse {
  data: FAQ[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useFAQSearch() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const { toast } = useToast();

  // Load FAQs from mock data
  const loadFAQs = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/mocks/faqs.json');
      const data: FAQResponse = await response.json();
      
      let filteredFAQs = data.data;
      
      // Filter by search query if provided
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase();
        filteredFAQs = data.data.filter(faq => 
          faq.question.toLowerCase().includes(searchTerm) ||
          faq.answer.toLowerCase().includes(searchTerm) ||
          faq.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      setFaqs(filteredFAQs);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to load FAQ data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    loadFAQs();
  }, [loadFAQs]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        loadFAQs(searchQuery);
      } else {
        loadFAQs();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadFAQs]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const selectFAQ = useCallback((faq: FAQ) => {
    setSelectedFAQ(faq);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFAQ(null);
  }, []);

  return {
    faqs,
    searchQuery,
    isLoading,
    selectedFAQ,
    handleSearch,
    selectFAQ,
    clearSelection
  };
}