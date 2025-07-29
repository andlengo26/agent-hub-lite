import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DataTable, Column } from "@/components/ui/data-table";
import { FloatingPreview } from "@/components/admin/FloatingPreview";
import { FormModal } from "@/components/common/FormModal";
import { ManageMembersModal } from "@/components/admin/ManageMembersModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization, useUsers } from "@/hooks/useApiQuery";
import { Organization, User } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Building2, Plus, Download, Archive, Trash2, Users, UserPlus } from "lucide-react";

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  logoUrl: z.string().optional(),
});

const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  logoUrl: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export default function Organizations() {
  const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [selectedOrgForMembers, setSelectedOrgForMembers] = useState<Organization | null>(null);

  const { data, isLoading: isLoadingOrganizations } = useOrganizations();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const createOrganizationMutation = useCreateOrganization();
  const updateOrganizationMutation = useUpdateOrganization();
  const deleteOrganizationMutation = useDeleteOrganization();

  const organizations = data?.data || [];
  const allUsers = usersData?.data || [];

  const orgColumns: Column<Organization>[] = [
    {
      key: "name",
      label: "Organization",
      sortable: true,
      render: (_, org) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={org.logoUrl} alt={org.name} />
            <AvatarFallback>
              {org.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{org.name}</div>
            <div className="text-sm text-muted-foreground">
              {org.members?.length || 0} members
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "activeAgents",
      label: "Active Agents",
      sortable: true,
      render: (agents) => (
        <Badge variant="secondary">
          {agents} agents
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (status) => (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const createForm = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
    },
  });

  const editForm = useForm<UpdateOrganizationInput>({
    resolver: zodResolver(updateOrganizationSchema),
  });

  const handleCreateOrg = (data: CreateOrganizationInput) => {
    createOrganizationMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        createForm.reset();
        toast({
          title: "Organization created",
          description: "Organization has been successfully created.",
        });
      },
    });
  };

  const handleEditOrg = (org: Organization) => {
    setEditingOrganization(org);
    editForm.reset({
      name: org.name,
      logoUrl: org.logoUrl,
      status: org.status,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateOrg = (data: UpdateOrganizationInput) => {
    if (!editingOrganization) return;

    updateOrganizationMutation.mutate(
      {
        orgId: editingOrganization.id,
        data,
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setEditingOrganization(null);
          editForm.reset();
          toast({
            title: "Organization updated",
            description: "Organization has been successfully updated.",
          });
        },
      }
    );
  };

  const handleDeleteOrg = (org: Organization) => {
    deleteOrganizationMutation.mutate(org.id, {
      onSuccess: () => {
        toast({
          title: "Organization deleted",
          description: "Organization has been successfully deleted.",
        });
      },
    });
  };

  const handleManageMembers = (org: Organization) => {
    setSelectedOrgForMembers(org);
    setIsMembersModalOpen(true);
  };

  const handleAddMembers = async (organizationId: string, userIds: string[]) => {
    // Mock implementation - in real app, this would call an API
    console.log('Adding users to organization:', { organizationId, userIds });
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Success",
      description: "Members added successfully",
    });
  };

  const handleRemoveMembers = async (organizationId: string, userIds: string[]) => {
    // Mock implementation - in real app, this would call an API
    console.log('Removing users from organization:', { organizationId, userIds });
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Success", 
      description: "Members removed successfully",
    });
  };

  const handleBulkExport = () => {
    toast({
      title: "Export started",
      description: `Exporting ${selectedOrganizations.length} organizations...`,
    });
  };

  const handleBulkArchive = () => {
    toast({
      title: "Archive completed",
      description: `${selectedOrganizations.length} organizations archived.`,
    });
  };

  const handleBulkDelete = () => {
    toast({
      title: "Delete completed",
      description: `${selectedOrganizations.length} organizations deleted.`,
    });
  };

  const bulkActions = [
    {
      id: "export",
      label: "Export Selected",
      icon: <Download className="w-4 h-4" />,
      onClick: handleBulkExport,
    },
    {
      id: "archive",
      label: "Archive Selected",
      icon: <Archive className="w-4 h-4" />,
      onClick: handleBulkArchive,
    },
    {
      id: "delete",
      label: "Delete Selected",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive" as const,
      onClick: handleBulkDelete,
    },
  ];

  // Custom actions for the data table
  const customActions = [
    {
      id: 'manage-members',
      label: 'Manage Members',
      icon: <Users className="h-4 w-4" />,
      onClick: handleManageMembers,
    },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organization Management</h2>
          <p className="text-muted-foreground">
            Manage organizations and their user assignments.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>
                View and manage all organizations in the system
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Organization
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              data={organizations}
              columns={orgColumns}
              loading={isLoadingOrganizations}
              searchable
              selectable
              onEdit={handleEditOrg}
              onDelete={handleDeleteOrg}
              customActions={customActions}
              bulkActions={bulkActions}
              emptyMessage="No organizations found"
              emptyDescription="Get started by creating your first organization."
            />
          </CardContent>
        </Card>

        {/* Create Organization Modal */}
        <FormModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            createForm.reset();
          }}
          title="Create Organization"
          onSubmit={createForm.handleSubmit(handleCreateOrg)}
          submitLabel="Create Organization"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                {...createForm.register("name")}
              />
              {createForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                {...createForm.register("logoUrl")}
              />
              {createForm.formState.errors.logoUrl && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.logoUrl.message}
                </p>
              )}
            </div>
          </div>
        </FormModal>

        {/* Edit Organization Modal */}
        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingOrganization(null);
          }}
          title="Edit Organization"
          onSubmit={editForm.handleSubmit(handleUpdateOrg)}
          submitLabel="Update Organization"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Organization Name</Label>
              <Input
                id="edit-name"
                {...editForm.register("name")}
              />
              {editForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-logoUrl">Logo URL</Label>
              <Input
                id="edit-logoUrl"
                {...editForm.register("logoUrl")}
              />
              {editForm.formState.errors.logoUrl && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.logoUrl.message}
                </p>
              )}
            </div>
          </div>
        </FormModal>

        {/* Manage Members Modal */}
        <ManageMembersModal
          isOpen={isMembersModalOpen}
          onClose={() => setIsMembersModalOpen(false)}
          organization={selectedOrgForMembers}
          availableUsers={allUsers}
          isLoading={isLoadingUsers}
          onAddMembers={handleAddMembers}
          onRemoveMembers={handleRemoveMembers}
        />

        <FloatingPreview />
      </div>
    </ErrorBoundary>
  );
}