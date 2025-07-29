import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/common/SearchInput";
import { Document } from "@/types";
import { Upload, FileText, Trash2, Download, Archive } from "lucide-react";
import { useDocuments } from "@/hooks/useApiQuery";
import { DocumentUploadModal } from "@/components/modals/DocumentUploadModal";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const documentColumns: Column<Document>[] = [
  { 
    key: "title", 
    label: "Document",
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span>{value}</span>
      </div>
    )
  },
  { key: "fileType", label: "Type", sortable: true },
  { key: "fileSizeKb", label: "Size (KB)", sortable: true, render: (value) => `${value} KB` },
  { key: "uploadedAt", label: "Uploaded", sortable: true, render: (value) => new Date(value).toLocaleDateString() },
];

export default function Documents() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { data: documentsResponse, isLoading, error } = useDocuments();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const documents = documentsResponse?.data || [];

  const handleDelete = (document: Document) => {
    toast({
      title: "Document Deleted",
      description: `${document.title} has been deleted successfully.`,
    });
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['documents'] });
  };

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['documents'] });
  };

  const handleBulkExport = () => {
    toast({
      title: "Export started",
      description: "Exporting selected documents...",
    });
  };

  const handleBulkArchive = () => {
    toast({
      title: "Archive completed",
      description: "Selected documents archived.",
    });
  };

  const handleBulkDelete = () => {
    toast({
      title: "Delete completed",
      description: "Selected documents deleted.",
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
    return <div>Loading documents...</div>;
  }

  if (error) {
    return <div>Error loading documents: {error.message}</div>;
  }

  return (
    <div className="space-y-space-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Manage knowledge base documents</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />Upload
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={documents} 
            columns={documentColumns} 
            loading={isLoading}
            searchable
            selectable
            pagination
            onDelete={handleDelete}
            bulkActions={bulkActions}
            emptyMessage="No documents found"
            emptyDescription="Upload your first document to get started."
          />
        </CardContent>
      </Card>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}