import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FloatingPreview } from "@/components/admin/FloatingPreview";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Loader2 } from "lucide-react";
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization } from "@/hooks/useApiQuery";
import { createOrganizationSchema, updateOrganizationSchema, type CreateOrganizationInput, type UpdateOrganizationInput } from "@/lib/validations";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Organization } from "@/lib/mock-data";

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const multiTenant = useFeatureFlag('multiTenant');
  const { data: orgsResponse, isLoading } = useOrganizations();
  const createOrgMutation = useCreateOrganization();
  const updateOrgMutation = useUpdateOrganization();
  const deleteOrgMutation = useDeleteOrganization();

  const organizations = orgsResponse?.data || [];

  const createForm = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      logoUrl: '',
    },
  });

  const editForm = useForm<UpdateOrganizationInput>({
    resolver: zodResolver(updateOrganizationSchema),
  });

  const handleCreateOrg = async (data: CreateOrganizationInput) => {
    try {
      await createOrgMutation.mutateAsync(data);
      createForm.reset();
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEditOrg = (org: Organization) => {
    setEditingOrg(org);
    editForm.reset({
      name: org.name,
      logoUrl: org.logoUrl,
      status: org.status,
    });
  };

  const handleUpdateOrg = async (data: UpdateOrganizationInput) => {
    if (!editingOrg) return;

    try {
      await updateOrgMutation.mutateAsync({
        orgId: editingOrg.id,
        data,
      });
      editForm.reset();
      setEditingOrg(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteOrg = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"?`)) return;
    
    try {
      await deleteOrgMutation.mutateAsync(org.id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Organization Management</h1>
            <p className="text-muted-foreground">
              Manage organizations and their configurations
            </p>
          </div>
          {multiTenant && (
            <Badge variant="secondary" className="text-xs">
              Multi-Tenant
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Organizations ({organizations.length})</CardTitle>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Organization
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <DataTable
                columns={orgColumns}
                data={organizations}
                onEdit={handleEditOrg}
                onDelete={handleDeleteOrg}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Organization Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          createForm.reset();
        }}
        title="Add New Organization"
        description="Create a new organization to manage teams and settings."
      >
        <form onSubmit={createForm.handleSubmit(handleCreateOrg)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              {...createForm.register('name')}
              placeholder="Enter organization name"
            />
            {createForm.formState.errors.name && (
              <p className="text-sm text-destructive">{createForm.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              {...createForm.register('logoUrl')}
              placeholder="https://example.com/logo.png"
            />
            {createForm.formState.errors.logoUrl && (
              <p className="text-sm text-destructive">{createForm.formState.errors.logoUrl.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              size="sm"
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                createForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              type="submit"
              disabled={createOrgMutation.isPending}
            >
              {createOrgMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Organization
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Organization Modal */}
      <Modal
        isOpen={!!editingOrg}
        onClose={() => {
          setEditingOrg(null);
          editForm.reset();
        }}
        title="Edit Organization"
        description="Update organization information and settings."
      >
        <form onSubmit={editForm.handleSubmit(handleUpdateOrg)} className="space-y-4">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input {...editForm.register('name')} placeholder="Enter organization name" />
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input {...editForm.register('logoUrl')} placeholder="https://example.com/logo.png" />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              size="sm"
              type="button"
              onClick={() => {
                setEditingOrg(null);
                editForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              type="submit"
              disabled={updateOrgMutation.isPending}
            >
              {updateOrgMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Update Organization
            </Button>
          </div>
        </form>
      </Modal>

      <FloatingPreview />
    </>
  );
}