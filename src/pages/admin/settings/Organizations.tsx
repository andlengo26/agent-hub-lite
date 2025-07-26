import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { mockOrganizations, Organization } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FloatingPreview } from "@/components/admin/FloatingPreview";

const orgColumns: Column<Organization>[] = [
  { 
    key: "name", 
    header: "Organization",
    cell: (value, row) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.logoUrl} />
          <AvatarFallback>{value.charAt(0)}</AvatarFallback>
        </Avatar>
        <span>{value}</span>
      </div>
    )
  },
  { key: "activeAgents", header: "Active Agents" },
  { 
    key: "status", 
    header: "Status",
    cell: (value) => (
      <Badge variant={value === "active" ? "default" : "secondary"}>
        {value}
      </Badge>
    )
  },
  { key: "createdAt", header: "Created" },
];

export default function Organizations() {
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Organization Management</h1>
            <p className="text-muted-foreground">
              Manage organizations and their configurations
            </p>
          </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Organization</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" placeholder="Enter organization name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgLogo">Logo URL</Label>
                <Input id="orgLogo" placeholder="https://example.com/logo.png" />
              </div>
              <Button className="w-full">Create Organization</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organizations ({mockOrganizations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={mockOrganizations}
            columns={orgColumns}
            selectable
            onEdit={(org) => console.log("Edit", org)}
            onDelete={(org) => console.log("Delete", org)}
          />
        </CardContent>
      </Card>
    </div>
    <FloatingPreview />
  </>
  );
}