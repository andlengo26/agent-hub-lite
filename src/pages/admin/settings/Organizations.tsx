import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { EnhancedDataTable, Column } from "@/components/common/EnhancedDataTable";
import { FormModal } from "@/components/common/FormModal";
import { FloatingPreview } from "@/components/admin/FloatingPreview";
import { Plus, Download, Archive, Trash2 } from "lucide-react";
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization } from "@/hooks/useApiQuery";
import { createOrganizationSchema, updateOrganizationSchema, type CreateOrganizationInput, type UpdateOrganizationInput } from "@/lib/validations";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Organization } from "@/types";
import { toast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const orgColumns: Column<Organization>[] = [
  { 
    key: "name", 
    header: "Organization",
    width: "300px",
    cell: (value, row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.logoUrl} />
          <AvatarFallback>{value.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{value}</span>
      </div>
    )
  },
  { 
    key: "activeAgents", 
    header: "Active Agents",
    hideOnMobile: true,
    cell: (value) => (
      <span className="text-muted-foreground">{value || 0}</span>
    )
  },
  { 
    key: "status", 
    header: "Status",
    cell: (value) => (
      <Badge variant={value === "active" ? "default" : "secondary"}>
        {value}
      </Badge>
    )
  },
  { 
    key: "createdAt", 
    header: "Created",
    hideOnMobile: true,
    cell: (value) => (
      <span className="text-sm text-muted-foreground">
        {new Date(value).toLocaleDateString()}
      </span>
    )
  },
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
      toast({ title: "Success", description: "Organization created successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create organization", variant: "destructive" });
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
      toast({ title: "Success", description: "Organization updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update organization", variant: "destructive" });
    }
  };

  const handleDeleteOrg = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"?`)) return;
    
    try {
      await deleteOrgMutation.mutateAsync(org.id);
      toast({ title: "Success", description: "Organization deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete organization", variant: "destructive" });
    }
  };

  const handleBulkExport = (selectedOrgs: Organization[]) => {
    console.log('Exporting organizations:', selectedOrgs);
    toast({ title: "Export started", description: `Exporting ${selectedOrgs.length} organizations` });
  };

  const handleBulkArchive = (selectedOrgs: Organization[]) => {
    console.log('Archiving organizations:', selectedOrgs);
    toast({ title: "Archive started", description: `Archiving ${selectedOrgs.length} organizations` });
  };

  const handleBulkDelete = (selectedOrgs: Organization[]) => {
    if (!confirm(`Are you sure you want to delete ${selectedOrgs.length} organizations?`)) return;
    console.log('Deleting organizations:', selectedOrgs);
    toast({ title: "Delete started", description: `Deleting ${selectedOrgs.length} organizations` });
  };

  const bulkActions = [
    {
      id: 'export',
      label: 'Export',
      icon: <Download className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: handleBulkExport,
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: handleBulkArchive,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      onClick: handleBulkDelete,
    },
  ];

  return (
    <ErrorBoundary>
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
          <CardContent className="p-6">
            <EnhancedDataTable
              columns={orgColumns}
              data={organizations}
              onEdit={handleEditOrg}
              onDelete={handleDeleteOrg}
              selectable={true}
              searchable={true}
              searchPlaceholder="Search organizations..."
              bulkActions={bulkActions}
              loading={isLoading}
              emptyState={{
                title: "No organizations found",
                description: "Get started by creating your first organization to manage teams and settings.",
                illustration: "organizations",
                actionLabel: "Add Organization",
                onAction: () => setIsCreateModalOpen(true),
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Create Organization Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          createForm.reset();
        }}
        title="Add New Organization"
        description="Create a new organization to manage teams and settings."
        isLoading={createOrgMutation.isPending}
        submitLabel="Create Organization"
        onSubmit={createForm.handleSubmit(handleCreateOrg)}
        submitDisabled={!createForm.formState.isValid}
      >
        <form onSubmit={createForm.handleSubmit(handleCreateOrg)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              {...createForm.register('name')}
              placeholder="Enter organization name"
              aria-describedby={createForm.formState.errors.name ? 'name-error' : undefined}
            />
            {createForm.formState.errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {createForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              {...createForm.register('logoUrl')}
              placeholder="https://example.com/logo.png"
              aria-describedby={createForm.formState.errors.logoUrl ? 'logo-error' : undefined}
            />
            {createForm.formState.errors.logoUrl && (
              <p id="logo-error" className="text-sm text-destructive">
                {createForm.formState.errors.logoUrl.message}
              </p>
            )}
          </div>
        </form>
      </FormModal>

      {/* Edit Organization Modal */}
      <FormModal
        isOpen={!!editingOrg}
        onClose={() => {
          setEditingOrg(null);
          editForm.reset();
        }}
        title="Edit Organization"
        description="Update organization information and settings."
        isLoading={updateOrgMutation.isPending}
        submitLabel="Update Organization"
        onSubmit={editForm.handleSubmit(handleUpdateOrg)}
        submitDisabled={!editForm.formState.isValid}
      >
        <form onSubmit={editForm.handleSubmit(handleUpdateOrg)} className="space-y-4">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input 
              {...editForm.register('name')} 
              placeholder="Enter organization name"
              aria-describedby={editForm.formState.errors.name ? 'edit-name-error' : undefined}
            />
            {editForm.formState.errors.name && (
              <p id="edit-name-error" className="text-sm text-destructive">
                {editForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input 
              {...editForm.register('logoUrl')} 
              placeholder="https://example.com/logo.png"
              aria-describedby={editForm.formState.errors.logoUrl ? 'edit-logo-error' : undefined}
            />
            {editForm.formState.errors.logoUrl && (
              <p id="edit-logo-error" className="text-sm text-destructive">
                {editForm.formState.errors.logoUrl.message}
              </p>
            )}
          </div>
        </form>
      </FormModal>

      <FloatingPreview />
    </ErrorBoundary>
  );
}