import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/admin/DataTable";
import { mockResources, Resource } from "@/lib/mock-data";
import { Share, FileText, Video, Link, File } from "lucide-react";

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
      <div>
        <h1 className="text-3xl font-bold">Resources</h1>
        <p className="text-muted-foreground">Manage shareable resources for customer support</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Resource Library</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={mockResources} 
            columns={resourceColumns} 
            onView={(resource) => console.log("Share in Chat", resource)}
          />
        </CardContent>
      </Card>
    </div>
  );
}