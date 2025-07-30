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

import { FormModal } from "@/components/common/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers, useOrganizations, useUpdateUser, useInviteUser } from "@/hooks/useApiQuery";
import { User, Organization } from "@/types";
import { toast } from "@/hooks/use-toast";
import { UserPlus, UsersIcon, Download, Archive } from "lucide-react";

const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "agent", "manager"]),
  organizationId: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

export default function Users() {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [bulkOrgId, setBulkOrgId] = useState<string>("");

  const { data: usersData } = useUsers();
  const { data: orgsData } = useOrganizations();
  const updateUserMutation = useUpdateUser();
  const inviteUserMutation = useInviteUser();

  const users = usersData?.data || [];
  const organizations = orgsData?.data || [];

  const createForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { firstName: "", lastName: "", email: "", role: "agent", organizationId: "unassigned" },
  });

  const editForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
  });

  const getOrgName = (orgId: string | undefined) => {
    if (!orgId) return "Unassigned";
    const org = organizations.find((o) => o.id === orgId);
    return org?.name || "Unknown";
  };

  const userColumns: Column<User>[] = [
    {
      key: "firstName",
      label: "User",
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.firstName} {user.lastName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (role) => <Badge variant="outline" className="capitalize">{role}</Badge>,
    },
    {
      key: "organizationId",
      label: "Organization",
      sortable: true,
      render: (orgId) => <span className="text-sm">{getOrgName(orgId)}</span>,
    },
    {
      key: "onlineStatus",
      label: "Status",
      sortable: true,
      render: (status) => (
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500" : status === "away" ? "bg-yellow-500" : "bg-gray-500"}`} />
          <span className="text-sm capitalize">{status}</span>
        </div>
      ),
    },
  ];

  const handleCreateUser = (data: UserFormData) => {
    inviteUserMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        createForm.reset();
        toast({ title: "User invited", description: "User invitation sent successfully." });
      },
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    editForm.reset({ ...user, organizationId: user.organizationId || "unassigned" });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = (data: UserFormData) => {
    if (!editingUser) return;
    const processedData = {
      ...data,
      organizationId: data.organizationId === "unassigned" ? undefined : data.organizationId,
    };
    updateUserMutation.mutate({ userId: editingUser.id, data: processedData }, {
      onSuccess: () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
        toast({ title: "User updated", description: "User information updated successfully." });
      },
    });
  };

  const handleBulkAssign = () => {
    if (!bulkOrgId || selectedUsers.length === 0) return;
    selectedUsers.forEach((user) => {
      updateUserMutation.mutate({ userId: user.id, data: { organizationId: bulkOrgId } });
    });
    setIsBulkAssignModalOpen(false);
    setBulkOrgId("");
    setSelectedUsers([]);
    toast({ title: "Bulk assignment completed", description: `${selectedUsers.length} users assigned to organization.` });
  };

  const bulkActions = [
    { id: "assign", label: "Bulk Assign to Org", icon: <UsersIcon className="w-4 h-4" />, onClick: () => setIsBulkAssignModalOpen(true) },
    { id: "export", label: "Export Selected", icon: <Download className="w-4 h-4" />, onClick: () => toast({ title: "Export started" }) },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage users and their organization assignments.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>View and manage all users in the system</CardDescription>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              columns={userColumns}
              searchable
              selectable
              onEdit={handleEditUser}
              bulkActions={bulkActions}
              emptyMessage="No users found"
              emptyDescription="Get started by inviting your first user."
            />
          </CardContent>
        </Card>

        {/* Create/Edit/Bulk Assign Modals */}
        <FormModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Invite User" onSubmit={createForm.handleSubmit(handleCreateUser)} submitLabel="Send Invitation">
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...createForm.register("firstName")} />
              {createForm.formState.errors.firstName && (
                <p className="text-sm text-destructive">{createForm.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...createForm.register("lastName")} />
              {createForm.formState.errors.lastName && (
                <p className="text-sm text-destructive">{createForm.formState.errors.lastName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...createForm.register("email")} />
              {createForm.formState.errors.email && (
                <p className="text-sm text-destructive">{createForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select {...createForm.register("role")} defaultValue="agent">
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormModal>

        <FormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User" onSubmit={editForm.handleSubmit(handleUpdateUser)} submitLabel="Update User">
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...editForm.register("firstName")} />
              {editForm.formState.errors.firstName && (
                <p className="text-sm text-destructive">{editForm.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...editForm.register("lastName")} />
              {editForm.formState.errors.lastName && (
                <p className="text-sm text-destructive">{editForm.formState.errors.lastName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...editForm.register("email")} />
              {editForm.formState.errors.email && (
                <p className="text-sm text-destructive">{editForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select {...editForm.register("role")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Organization</Label>
              <Select {...editForm.register("organizationId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormModal>

        {/* Bulk Assignment Modal */}
        <FormModal 
          isOpen={isBulkAssignModalOpen} 
          onClose={() => {
            setIsBulkAssignModalOpen(false);
            setBulkOrgId("");
          }} 
          title="Bulk Assign to Organization" 
          onSubmit={handleBulkAssign} 
          submitLabel="Assign Users"
        >
          <div className="space-y-4">
            <div>
              <Label>Selected Users ({selectedUsers.length})</Label>
              <div className="mt-2 space-y-1">
                {selectedUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className="text-sm text-muted-foreground">
                    {user.firstName} {user.lastName}
                  </div>
                ))}
                {selectedUsers.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    and {selectedUsers.length - 3} more...
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="bulk-organization">Organization</Label>
              <Select value={bulkOrgId} onValueChange={setBulkOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormModal>

        
      </div>
    </ErrorBoundary>
  );
}
