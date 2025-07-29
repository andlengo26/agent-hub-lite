import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/common/SearchInput";
import { FAQ } from "@/types";
import { Plus, Edit, Trash2, Download, Archive } from "lucide-react";
import { useFAQs } from "@/hooks/useApiQuery";
import { FAQModal } from "@/components/modals/FAQModal";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const faqColumns: Column<FAQ>[] = [
  { key: "question", label: "Question", sortable: true },
  { key: "answer", label: "Answer", render: (value) => value.substring(0, 100) + "..." },
  { 
    key: "tags", 
    label: "Tags",
    render: (value) => (
      <div className="flex gap-1">
        {value.slice(0, 2).map((tag: string) => (
          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
        ))}
        {value.length > 2 && <span className="text-xs text-muted-foreground">+{value.length - 2}</span>}
      </div>
    )
  },
  { key: "updatedAt", label: "Updated", sortable: true, render: (value) => new Date(value).toLocaleDateString() },
];

export default function FAQs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const { data: faqsResponse, isLoading, error } = useFAQs();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const faqs = faqsResponse?.data || [];

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setIsModalOpen(true);
  };

  const handleDelete = (faq: FAQ) => {
    toast({
      title: "FAQ Deleted",
      description: `FAQ "${faq.question}" has been deleted successfully.`,
    });
    queryClient.invalidateQueries({ queryKey: ['faqs'] });
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['faqs'] });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFAQ(null);
  };

  const handleBulkExport = () => {
    toast({
      title: "Export started",
      description: "Exporting selected FAQs...",
    });
  };

  const handleBulkArchive = () => {
    toast({
      title: "Archive completed",
      description: "Selected FAQs archived.",
    });
  };

  const handleBulkDelete = () => {
    toast({
      title: "Delete completed",
      description: "Selected FAQs deleted.",
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
    return <div>Loading FAQs...</div>;
  }

  if (error) {
    return <div>Error loading FAQs: {error.message}</div>;
  }

  return (
    <div className="space-y-space-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">FAQs</h1>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />Add FAQ
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>FAQ Database</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={faqs} 
            columns={faqColumns} 
            loading={isLoading}
            searchable
            selectable
            pagination
            onEdit={handleEdit} 
            onDelete={handleDelete}
            bulkActions={bulkActions}
            emptyMessage="No FAQs found"
            emptyDescription="Add your first FAQ to get started."
          />
        </CardContent>
      </Card>

      <FAQModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        faq={editingFAQ}
      />
    </div>
  );
}