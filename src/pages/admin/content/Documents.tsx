import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/admin/DataTable";
import { mockDocuments, Document } from "@/lib/mock-data";
import { Upload, FileText } from "lucide-react";

const documentColumns: Column<Document>[] = [
  { 
    key: "title", 
    header: "Document",
    cell: (value) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span>{value}</span>
      </div>
    )
  },
  { key: "fileType", header: "Type" },
  { key: "fileSizeKb", header: "Size (KB)" },
  { key: "uploadedAt", header: "Uploaded" },
];

export default function Documents() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Manage knowledge base documents</p>
        </div>
        <Button className="gap-2"><Upload className="h-4 w-4" />Upload</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={mockDocuments} columns={documentColumns} onView={() => {}} onDelete={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
}