/**
 * FAQ Browser component for the chat widget
 */

import { useState } from 'react';
import { Search, Book, ArrowLeft, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFAQSearch } from '@/hooks/useFAQSearch';

interface FAQBrowserProps {
  onClose: () => void;
  onSelectFAQ: (question: string, answer: string) => void;
}

export function FAQBrowser({ onClose, onSelectFAQ }: FAQBrowserProps) {
  const { faqs, searchQuery, isLoading, selectedFAQ, handleSearch, selectFAQ, clearSelection } = useFAQSearch();

  const handleFAQSelect = (faq: any) => {
    onSelectFAQ(faq.question, faq.answer);
    onClose();
  };

  if (selectedFAQ) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 p-4 border-b">
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium text-sm">FAQ Details</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{selectedFAQ.question}</CardTitle>
              <div className="flex gap-1 flex-wrap">
                {selectedFAQ.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedFAQ.answer}
              </p>
              <Button 
                size="sm" 
                onClick={() => handleFAQSelect(selectedFAQ)}
                className="w-full"
              >
                Use This FAQ
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
        <Book className="h-4 w-4" />
        <h3 className="font-medium text-sm">Browse FAQs</h3>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={onClose}>
          ×
        </Button>
      </div>
      
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading FAQs...</div>
          </div>
        ) : faqs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              {searchQuery ? 'No FAQs found for your search' : 'No FAQs available'}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {faqs.map((faq) => (
              <Card 
                key={faq.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => selectFAQ(faq)}
              >
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-1">{faq.question}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {faq.answer}
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {faq.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {faq.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{faq.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}