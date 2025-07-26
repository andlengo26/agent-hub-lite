import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/admin/DataTable";
import { mockDomains, Domain } from "@/lib/mock-data";
import { Plus } from "lucide-react";
import { FloatingPreview } from "@/components/admin/FloatingPreview";

const domainColumns: Column<Domain>[] = [
  { key: "domain", header: "Domain" },
  { key: "addedAt", header: "Added" },
];

export default function Security() {
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
          <DataTable data={mockDomains} columns={domainColumns} onDelete={() => {}} />
        </CardContent>
      </Card>
    </div>
    <FloatingPreview />
  </>
  );
}