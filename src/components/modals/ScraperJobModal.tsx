import React, { useState, useEffect } from 'react';
import { FormModal } from '@/components/common/FormModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScraperJob } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ScraperJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scraperJob?: ScraperJob | null;
}

export function ScraperJobModal({ isOpen, onClose, onSuccess, scraperJob }: ScraperJobModalProps) {
  const [formData, setFormData] = useState({
    url: '',
    linkDepth: 1,
    frequency: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (scraperJob) {
      setFormData({
        url: scraperJob.url,
        linkDepth: scraperJob.linkDepth,
        frequency: scraperJob.frequency,
      });
    } else {
      setFormData({
        url: '',
        linkDepth: 1,
        frequency: '',
      });
    }
  }, [scraperJob, isOpen]);

  const handleSubmit = async () => {
    if (!formData.url || !formData.frequency) {
      toast({
        title: "Validation Error",
        description: "Please fill in URL and frequency fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.linkDepth < 1 || formData.linkDepth > 10) {
      toast({
        title: "Validation Error",
        description: "Link depth must be between 1 and 10.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      toast({
        title: scraperJob ? "Scraper Job Updated" : "Scraper Job Created",
        description: `Scraper job for "${formData.url}" has been ${scraperJob ? 'updated' : 'created'} successfully.`,
      });
      setIsLoading(false);
      onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={scraperJob ? "Edit Scraper Job" : "Add Scraper Job"}
      description={scraperJob ? "Update the scraper job configuration" : "Create a new website scraping job"}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitLabel={scraperJob ? "Update" : "Create"}
    >
      <div className="space-y-space-4">
        <div>
          <Label htmlFor="url">Website URL</Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://example.com"
            className="mt-space-1"
          />
        </div>

        <div>
          <Label htmlFor="linkDepth">Link Depth</Label>
          <Input
            id="linkDepth"
            type="number"
            min="1"
            max="10"
            value={formData.linkDepth}
            onChange={(e) => setFormData(prev => ({ ...prev, linkDepth: parseInt(e.target.value) || 1 }))}
            placeholder="1"
            className="mt-space-1"
          />
          <p className="text-sm text-muted-foreground mt-space-1">
            How many levels deep to follow links (1-10)
          </p>
        </div>

        <div>
          <Label htmlFor="frequency">Scraping Frequency</Label>
          <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
            <SelectTrigger className="mt-space-1">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Manual only)</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </FormModal>
  );
}