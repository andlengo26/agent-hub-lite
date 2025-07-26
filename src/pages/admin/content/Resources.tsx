import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FileText, Video, Link, File, Plus } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  type: string;
  tags: string[];
  updatedAt: string;
}

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
    header: "Resource",
    cell: (value, row) => (
      <div className="flex items-center gap-2">
        {getTypeIcon(row.type)}
        <span>{value}</span>
      </div>
    )
  },
  { 
    key: "type", 
    header: "Type",
    cell: (value) => <Badge variant="outline">{value}</Badge>
  },
  { 
    key: "tags", 
    header: "Tags",
    cell: (value) => (
      <div className="flex gap-1">
        {value.slice(0, 2).map((tag: string) => (
          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
        ))}
      </div>
    )
  },
  { key: "updatedAt", header: "Updated" },
];

export default function Resources() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">Manage shareable resources for customer support</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Resource Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-6">
              No resources yet. Upload documents, videos, or links to get started.
            </p>
            <DataTable 
              data={[]} 
              columns={resourceColumns}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}