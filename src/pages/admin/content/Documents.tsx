import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/common/SearchInput";
import { Document } from "@/types";
import { Upload, FileText, Trash2 } from "lucide-react";
import { useDocuments } from "@/hooks/useApiQuery";
import { DocumentUploadModal } from "@/components/modals/DocumentUploadModal";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const documentColumns: Column<Document>[] = [
  { 
    key: "title", 
    label: "Document",
    render: (value) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span>{value}</span>
      </div>
    )
  },
  { key: "fileType", label: "Type" },
  { key: "fileSizeKb", label: "Size (KB)", render: (value) => `${value} KB` },
  { key: "uploadedAt", label: "Uploaded", render: (value) => new Date(value).toLocaleDateString() },
];

export default function Documents() {
  const [search, setSearch] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { data: documentsResponse, isLoading, error } = useDocuments();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const documents = documentsResponse?.data || [];
  
  // Filter documents based on search
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.fileType.toLowerCase().includes(search.toLowerCase())
  );

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
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search documents..."
            className="mt-space-4"
          />
        </CardHeader>
        <CardContent>
          <DataTable 
            data={filteredDocuments} 
            columns={documentColumns} 
            onDelete={handleDelete}
            customActions={[
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

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}