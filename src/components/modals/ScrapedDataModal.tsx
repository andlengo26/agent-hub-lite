import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Calendar } from 'lucide-react';
import { ScraperJob } from '@/types';

interface ScrapedDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  scraperJob: ScraperJob;
}

export function ScrapedDataModal({ isOpen, onClose, scraperJob }: ScrapedDataModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const scrapedData = scraperJob.scrapedData || {
    pages: [],
    totalPages: 0,
    lastUpdated: new Date().toISOString()
  };

  // Filter pages based on search query
  const filteredPages = scrapedData.pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scraped Data"
      description={`Content from ${scraperJob.url}`}
      size="xl"
    >
      <div className="space-y-space-4">
        {/* Header Stats */}
        <div className="flex items-center justify-between p-space-4 bg-surface rounded-lg">
          <div className="flex items-center gap-space-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{scrapedData.totalPages}</div>
              <div className="text-sm text-muted-foreground">Total Pages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{filteredPages.length}</div>
              <div className="text-sm text-muted-foreground">Filtered Results</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-space-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Last Updated: {new Date(scrapedData.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scraped content..."
            className="pl-10"
          />
        </div>

        {/* Content */}
        <ScrollArea className="h-[400px] border rounded-lg">
          <div className="p-space-4 space-y-space-4">
            {filteredPages.length === 0 ? (
              <div className="text-center py-space-8 text-muted-foreground">
                {searchQuery ? 'No results found for your search.' : 'No scraped data available.'}
              </div>
            ) : (
              filteredPages.map((page, index) => (
                <div key={index} className="border border-border rounded-lg p-space-4 space-y-space-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{page.title}</h3>
                      <div className="flex items-center gap-space-2 mt-space-1">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={page.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {page.url}
                        </a>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(page.lastScraped).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="text-sm text-text-secondary line-clamp-3">
                    {page.content.substring(0, 200)}
                    {page.content.length > 200 && '...'}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}