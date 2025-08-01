import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FAQ } from "@/types";
import { Plus } from "lucide-react";
import { useFAQs } from "@/hooks/useApiQuery";

const faqColumns: Column<FAQ>[] = [
  { key: "question", header: "Question" },
  { key: "answer", header: "Answer", cell: (value) => value.substring(0, 100) + "..." },
  { 
    key: "tags", 
    header: "Tags",
    cell: (value) => (
      <div className="flex gap-1">
        {value.slice(0, 2).map((tag: string) => (
          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
        ))}
        {value.length > 2 && <span className="text-xs text-muted-foreground">+{value.length - 2}</span>}
      </div>
    )
  },
  { key: "updatedAt", header: "Updated" },
];

export default function FAQs() {
  const { data: faqsResponse, isLoading, error } = useFAQs();
  const faqs = faqsResponse?.data || [];

  if (isLoading) {
    return <div>Loading FAQs...</div>;
  }

  if (error) {
    return <div>Error loading FAQs: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">FAQs</h1>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />Add FAQ</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>FAQ Database</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={faqs} columns={faqColumns} onEdit={() => {}} onDelete={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
}