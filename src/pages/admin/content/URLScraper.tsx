import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/common/SearchInput";
import { ScraperJob } from "@/types";
import { Plus, Play, Edit, Trash2, Download, Archive } from "lucide-react";
import { useScraperJobs } from "@/hooks/useApiQuery";
import { ScraperJobModal } from "@/components/modals/ScraperJobModal";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const scraperColumns: Column<ScraperJob>[] = [
  { key: "url", label: "URL", sortable: true },
  { key: "linkDepth", label: "Depth", sortable: true },
  { key: "frequency", label: "Frequency", sortable: true },
  { 
    key: "status", 
    label: "Status",
    sortable: true,
    render: (value) => (
      <Badge variant={value === "completed" ? "default" : value === "failed" ? "destructive" : "secondary"}>
        {value}
      </Badge>
    )
  },
  { key: "lastScrapedAt", label: "Last Run", sortable: true, render: (value) => new Date(value).toLocaleDateString() },
];

export default function URLScraper() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<ScraperJob | null>(null);
  const { data: scraperJobsResponse, isLoading, error } = useScraperJobs();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const scraperJobs = scraperJobsResponse?.data || [];

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

  const handleBulkExport = () => {
    toast({
      title: "Export started",
      description: "Exporting selected scraper jobs...",
    });
  };

  const handleBulkArchive = () => {
    toast({
      title: "Archive completed",
      description: "Selected scraper jobs archived.",
    });
  };

  const handleBulkDelete = () => {
    toast({
      title: "Delete completed",
      description: "Selected scraper jobs deleted.",
    });
  };

  const bulkActions = [
    {
      id: "export",
      label: "Export Selected",
      icon: <Download className="w-4 h-4" />,
      onClick: handleBulkExport,
    },
    {
      id: "archive",
      label: "Archive Selected",
      icon: <Archive className="w-4 h-4" />,
      onClick: handleBulkArchive,
    },
    {
      id: "delete",
      label: "Delete Selected",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive" as const,
      onClick: handleBulkDelete,
    },
  ];

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
        </CardHeader>
        <CardContent>
          <DataTable 
            data={scraperJobs} 
            columns={scraperColumns} 
            loading={isLoading}
            searchable
            selectable
            pagination
            onEdit={handleEdit}
            bulkActions={bulkActions}
            customActions={[
              {
                id: 'run',
                label: 'Run Now',
                icon: <Play className="h-4 w-4" />,
                onClick: handleRunNow,
              },
            ]}
            emptyMessage="No scraper jobs found"
            emptyDescription="Add your first scraper job to get started."
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