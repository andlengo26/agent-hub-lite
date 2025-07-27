import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Document } from "@/types";
import { Upload, FileText } from "lucide-react";
import { useDocuments } from "@/hooks/useApiQuery";

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
  { key: "fileSizeKb", label: "Size (KB)" },
  { key: "uploadedAt", label: "Uploaded" },
];

export default function Documents() {
  const { data: documentsResponse, isLoading, error } = useDocuments();
  const documents = documentsResponse?.data || [];

  if (isLoading) {
    return <div>Loading documents...</div>;
  }

  if (error) {
    return <div>Error loading documents: {error.message}</div>;
  }

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
          <DataTable data={documents} columns={documentColumns} onView={() => {}} onDelete={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
}