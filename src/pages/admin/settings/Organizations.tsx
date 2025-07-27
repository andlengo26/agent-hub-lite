import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { EnhancedDataTable, Column } from "@/components/common/EnhancedDataTable";
import { FloatingPreview } from "@/components/admin/FloatingPreview";
import { FormModal } from "@/components/common/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MultiSelect, Option } from "@/components/ui/multi-select";
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
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [managingOrganization, setManagingOrganization] = useState<Organization | null>(null);
  const [isAddUsersModalOpen, setIsAddUsersModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [orgMembers, setOrgMembers] = useState<{ [orgId: string]: User[] }>({});

  const { data } = useOrganizations();
  const { data: usersData } = useUsers();
  const createOrganizationMutation = useCreateOrganization();
  const updateOrganizationMutation = useUpdateOrganization();
  const deleteOrganizationMutation = useDeleteOrganization();

  const organizations = data?.data || [];
  const allUsers = usersData?.data || [];

  // Get members for an organization
  const getOrgMembers = (orgId: string): User[] => {
    if (orgMembers[orgId]) {
      return orgMembers[orgId];
    }
    return allUsers.filter(user => user.organizationId === orgId);
  };

  // Get available users (not in any organization)
  const getAvailableUsers = (): User[] => {
    const assignedUserIds = new Set(allUsers.filter(user => user.organizationId).map(user => user.id));
    return allUsers.filter(user => !assignedUserIds.has(user.id));
  };

  const orgColumns: Column<Organization>[] = [
    {
      key: "name",
      header: "Organization",
      cell: (_, org) => (
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
              {getOrgMembers(org.id).length} members
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "activeAgents",
      header: "Active Agents",
      cell: (agents) => (
        <Badge variant="secondary">
          {agents} agents
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status", 
      cell: (status) => (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (date) => new Date(date).toLocaleDateString(),
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

  const handleManageUsers = (org: Organization) => {
    setManagingOrganization(org);
  };

  const handleAddUsers = () => {
    setIsAddUsersModalOpen(true);
  };

  const handleSaveUserAssignments = () => {
    if (!managingOrganization) return;

    // Update local state to reflect new assignments
    const newMembers = allUsers.filter(user => selectedUserIds.includes(user.id));
    setOrgMembers(prev => ({
      ...prev,
      [managingOrganization.id]: [...getOrgMembers(managingOrganization.id), ...newMembers]
    }));

    setIsAddUsersModalOpen(false);
    setSelectedUserIds([]);
    
    toast({
      title: "Users assigned",
      description: `${selectedUserIds.length} users assigned to ${managingOrganization.name}.`,
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

  // Available users for the multi-select (users not in the current organization)
  const availableUserOptions: Option[] = getAvailableUsers().map(user => ({
    label: `${user.firstName} ${user.lastName} (${user.email})`,
    value: user.id,
  }));

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
            <EnhancedDataTable
              data={organizations}
              columns={orgColumns}
              searchable
              selectable
              onEdit={handleEditOrg}
              onDelete={handleDeleteOrg}
              onRowClick={handleManageUsers}
              bulkActions={bulkActions}
              emptyState={{
                title: "No organizations found",
                description: "Get started by creating your first organization.",
              }}
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

        {/* Manage Users Drawer */}
        <Drawer open={!!managingOrganization} onOpenChange={(open) => !open && setManagingOrganization(null)}>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle>Manage Users - {managingOrganization?.name}</DrawerTitle>
              <DrawerDescription>
                View and manage users assigned to this organization.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-auto">
              <div className="mb-4 flex justify-between items-center">
                <h4 className="font-medium">Current Members ({managingOrganization ? getOrgMembers(managingOrganization.id).length : 0})</h4>
                <Button onClick={handleAddUsers} size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Users
                </Button>
              </div>
              
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {managingOrganization && getOrgMembers(managingOrganization.id).length > 0 ? (
                      getOrgMembers(managingOrganization.id).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                                <AvatarFallback>
                                  {user.firstName[0]}{user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {user.firstName} {user.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No users assigned to this organization yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Add Users Modal */}
        <FormModal
          isOpen={isAddUsersModalOpen}
          onClose={() => {
            setIsAddUsersModalOpen(false);
            setSelectedUserIds([]);
          }}
          title="Add Users to Organization"
          onSubmit={handleSaveUserAssignments}
          submitLabel="Add Selected Users"
          submitDisabled={selectedUserIds.length === 0}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="users">Select Users</Label>
              <MultiSelect
                options={availableUserOptions}
                selected={selectedUserIds}
                onChange={setSelectedUserIds}
                placeholder="Search and select users..."
                className="mt-1"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
            </div>
          </div>
        </FormModal>

        <FloatingPreview />
      </div>
    </ErrorBoundary>
  );
}