import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/common/SearchInput";
import { ScraperJob } from "@/types";
import { Plus, Play, Edit, Trash2 } from "lucide-react";
import { useScraperJobs } from "@/hooks/useApiQuery";
import { ScraperJobModal } from "@/components/modals/ScraperJobModal";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const scraperColumns: Column<ScraperJob>[] = [
  { key: "url", label: "URL" },
  { key: "linkDepth", label: "Depth" },
  { key: "frequency", label: "Frequency" },
  { 
    key: "status", 
    label: "Status",
    render: (value) => (
      <Badge variant={value === "completed" ? "default" : value === "failed" ? "destructive" : "secondary"}>
        {value}
      </Badge>
    )
  },
  { key: "lastScrapedAt", label: "Last Run", render: (value) => new Date(value).toLocaleDateString() },
];

export default function URLScraper() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<ScraperJob | null>(null);
  const { data: scraperJobsResponse, isLoading, error } = useScraperJobs();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const scraperJobs = scraperJobsResponse?.data || [];
  
  // Filter jobs based on search
  const filteredJobs = scraperJobs.filter(job =>
    job.url.toLowerCase().includes(search.toLowerCase()) ||
    job.frequency.toLowerCase().includes(search.toLowerCase()) ||
    job.status.toLowerCase().includes(search.toLowerCase())
  );

  const handleRunNow = (job: ScraperJob) => {
    toast({
      title: "Scraper Job Started",
      description: `Scraping job for "${job.url}" has been started.`,
    });
    queryClient.invalidateQueries({ queryKey: ['scraperJobs'] });
  };

  const handleEdit = (job: ScraperJob) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDelete = (job: ScraperJob) => {
    toast({
      title: "Scraper Job Deleted",
      description: `Scraper job for "${job.url}" has been deleted successfully.`,
    });
    queryClient.invalidateQueries({ queryKey: ['scraperJobs'] });
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['scraperJobs'] });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  if (isLoading) {
    return <div>Loading scraper jobs...</div>;
  }

  if (error) {
    return <div>Error loading scraper jobs: {error.message}</div>;
  }

  return (
    <div className="space-y-space-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">URL Scraper</h1>
          <p className="text-muted-foreground">Manage website scraping jobs</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />Add Job
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Scraper Jobs</CardTitle>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search scraper jobs..."
            className="mt-space-4"
          />
        </CardHeader>
        <CardContent>
          <DataTable 
            data={filteredJobs} 
            columns={scraperColumns} 
            onEdit={handleEdit}
            customActions={[
              {
                id: 'run',
                label: 'Run Now',
                icon: <Play className="h-4 w-4" />,
                onClick: handleRunNow,
              },
              {
                id: 'edit',
                label: 'Edit',
                icon: <Edit className="h-4 w-4" />,
                onClick: handleEdit,
              },
              {
                id: 'delete',
                label: 'Delete',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: handleDelete,
                variant: 'destructive',
              },
            ]}
          />
        </CardContent>
      </Card>

      <ScraperJobModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        scraperJob={editingJob}
      />
    </div>
  );
}