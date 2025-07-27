import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { FileText, Video, Link, File, Plus } from "lucide-react";
import { Resource } from "@/types";
import { useResources } from "@/hooks/useApiQuery";

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
  const { data: resourcesResponse, isLoading, error } = useResources();
  const resources = resourcesResponse?.data || [];

  if (isLoading) {
    return <div>Loading resources...</div>;
  }

  if (error) {
    return <div>Error loading resources: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">Manage AI training resources and content</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />Add Resource</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Resource Library</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={resources} columns={resourceColumns} onEdit={() => {}} onDelete={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
}