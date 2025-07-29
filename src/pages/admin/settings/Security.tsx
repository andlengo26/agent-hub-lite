import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/data-table";
import { Domain } from "@/types";
import { Plus } from "lucide-react";
import { FloatingPreview } from "@/components/admin/FloatingPreview";
import { useDomains } from "@/hooks/useApiQuery";

const domainColumns: Column<Domain>[] = [
  { key: "domain", label: "Domain", sortable: true },
  { key: "addedAt", label: "Added", sortable: true },
];

export default function Security() {
  const { data: domainsResponse, isLoading, error } = useDomains();
  const domains = domainsResponse?.data || [];

  if (isLoading) {
    return <div>Loading domains...</div>;
  }

  if (error) {
    return <div>Error loading domains: {error.message}</div>;
  }

  return (
    <>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security</h1>
        <p className="text-muted-foreground">Manage security settings and allowed domains</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Allowed Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input placeholder="example.com" />
            <Button className="gap-2"><Plus className="h-4 w-4" />Add</Button>
          </div>
          <DataTable 
            data={domains} 
            columns={domainColumns} 
            pagination={true}
            onDelete={() => {}} 
          />
        </CardContent>
      </Card>
    </div>
    <FloatingPreview />
  </>
  );
}