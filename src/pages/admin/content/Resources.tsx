import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/common/SearchInput";
import { FileText, Video, Link, File, Plus, Edit, Trash2 } from "lucide-react";
import { Resource } from "@/types";
import { useResources } from "@/hooks/useApiQuery";
import { ResourceModal } from "@/components/modals/ResourceModal";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const getTypeIcon = (type: string) => {
  switch (type) {
    case "document": return <FileText className="h-4 w-4" />;
    case "video": return <Video className="h-4 w-4" />;
    case "link": return <Link className="h-4 w-4" />;
    default: return <File className="h-4 w-4" />;
  }
};

const resourceColumns: Column<Resource>[] = [
  { 
    key: "title", 
    label: "Resource",
    render: (value, row) => (
      <div className="flex items-center gap-2">
        {getTypeIcon(row.type)}
        <span>{value}</span>
      </div>
    )
  },
  { 
    key: "type", 
    label: "Type",
    render: (value) => <Badge variant="outline">{value}</Badge>
  },
  { 
    key: "tags", 
    label: "Tags",
    render: (value) => (
      <div className="flex gap-1">
        {value.slice(0, 2).map((tag: string) => (
          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
        ))}
      </div>
    )
  },
  { key: "updatedAt", label: "Updated" },
];

export default function Resources() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const { data: resourcesResponse, isLoading, error } = useResources();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const resources = resourcesResponse?.data || [];
  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setIsModalOpen(true);
  };

  const handleDelete = (resource: Resource) => {
    toast({ title: "Resource Deleted", description: `"${resource.title}" deleted.` });
    queryClient.invalidateQueries({ queryKey: ['resources'] });
  };

  if (isLoading) return <div>Loading resources...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">Manage AI training resources</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />Add Resource
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Resource Library</CardTitle>
          <SearchInput value={search} onChange={setSearch} placeholder="Search resources..." className="mt-4" />
        </CardHeader>
        <CardContent>
          <DataTable data={filteredResources} columns={resourceColumns} onEdit={handleEdit} onDelete={handleDelete} />
        </CardContent>
      </Card>
      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingResource(null); }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['resources'] })}
        resource={editingResource}
      />
    </div>
  );
}