import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/common/SearchInput";
import { FAQ } from "@/types";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useFAQs } from "@/hooks/useApiQuery";
import { FAQModal } from "@/components/modals/FAQModal";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const faqColumns: Column<FAQ>[] = [
  { key: "question", label: "Question" },
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
  { key: "updatedAt", label: "Updated", render: (value) => new Date(value).toLocaleDateString() },
];

export default function FAQs() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const { data: faqsResponse, isLoading, error } = useFAQs();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const faqs = faqsResponse?.data || [];
  
  // Filter FAQs based on search
  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase()) ||
    faq.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

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
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search FAQs..."
            className="mt-space-4"
          />
        </CardHeader>
        <CardContent>
          <DataTable 
            data={filteredFAQs} 
            columns={faqColumns} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            customActions={[
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

      <FAQModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        faq={editingFAQ}
      />
    </div>
  );
}