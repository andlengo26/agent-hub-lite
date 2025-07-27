import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EnhancedDataTable, Column } from "@/components/common/EnhancedDataTable";
import { FormModal } from "@/components/common/FormModal";
import { FloatingPreview } from "@/components/admin/FloatingPreview";
import { Plus, Users as UsersIcon, Download, Archive, Trash2, UserPlus } from "lucide-react";
import { useUsers, useInviteUser, useUpdateUser, useDeleteUser } from "@/hooks/useApiQuery";
import { inviteUserSchema, updateUserSchema, type InviteUserInput, type UpdateUserInput } from "@/lib/validations";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { User } from "@/types";
import { toast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const userColumns: Column<User>[] = [
  { 
    key: "firstName", 
    header: "User",
    width: "300px",
    cell: (value, row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.avatarUrl} />
          <AvatarFallback>{value.charAt(0)}{row.lastName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <span className="font-medium">{value} {row.lastName}</span>
          <p className="text-sm text-muted-foreground">{row.email}</p>
        </div>
      </div>
    )
  },
  { 
    key: "role", 
    header: "Role",
    hideOnMobile: true,
    cell: (value) => (
      <Badge variant="outline" className="capitalize">{value}</Badge>
    )
  },
  { 
    key: "onlineStatus", 
    header: "Status",
    cell: (value) => (
      <Badge variant={value === "online" ? "default" : value === "away" ? "secondary" : "destructive"}>
        <span className="w-2 h-2 rounded-full bg-current mr-1.5"></span>
        {value}
      </Badge>
    )
  },
  { 
    key: "createdAt", 
    header: "Joined",
    hideOnMobile: true,
    cell: (value) => (
      <span className="text-sm text-muted-foreground">
        {new Date(value).toLocaleDateString()}
      </span>
    )
  },
];

export default function Users() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const multiTenant = useFeatureFlag('multiTenant');
  const { data: usersResponse, isLoading } = useUsers();
  const inviteUserMutation = useInviteUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const users = usersResponse?.data || [];

  const inviteForm = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'agent',
    },
  });

  const editForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  const handleInviteUser = async (data: InviteUserInput) => {
    try {
      await inviteUserMutation.mutateAsync(data);
      inviteForm.reset();
      setIsInviteModalOpen(false);
      toast({ title: "Success", description: "User invitation sent successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send user invitation", variant: "destructive" });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
  };

  const handleUpdateUser = async (data: UpdateUserInput) => {
    if (!editingUser) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        data,
      });
      editForm.reset();
      setEditingUser(null);
      toast({ title: "Success", description: "User updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete "${user.firstName} ${user.lastName}"?`)) return;
    
    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast({ title: "Success", description: "User deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  };

  const handleBulkExport = (selectedUsers: User[]) => {
    console.log('Exporting users:', selectedUsers);
    toast({ title: "Export started", description: `Exporting ${selectedUsers.length} users` });
  };

  const handleBulkInvite = (selectedUsers: User[]) => {
    console.log('Re-inviting users:', selectedUsers);
    toast({ title: "Invitations sent", description: `Re-sent invitations to ${selectedUsers.length} users` });
  };

  const handleBulkDelete = (selectedUsers: User[]) => {
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) return;
    console.log('Deleting users:', selectedUsers);
    toast({ title: "Delete started", description: `Deleting ${selectedUsers.length} users` });
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
      id: 'reinvite',
      label: 'Re-invite',
      icon: <UserPlus className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: handleBulkInvite,
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage team members and their permissions
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                Team Members ({users.length})
                {multiTenant && (
                  <Badge variant="outline">Multi-Tenant</Badge>
                )}
              </CardTitle>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <EnhancedDataTable
              columns={userColumns}
              data={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              selectable={true}
              searchable={true}
              searchPlaceholder="Search users by name or email..."
              bulkActions={bulkActions}
              loading={isLoading}
              emptyState={{
                title: "No team members found",
                description: "Get started by inviting your first team member to collaborate.",
                illustration: "users",
                actionLabel: "Invite User",
                onAction: () => setIsInviteModalOpen(true),
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Invite User Modal */}
      <FormModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          inviteForm.reset();
        }}
        title="Invite New User"
        description="Send an invitation to add a new team member."
        isLoading={inviteUserMutation.isPending}
        submitLabel="Send Invitation"
        onSubmit={inviteForm.handleSubmit(handleInviteUser)}
        submitDisabled={!inviteForm.formState.isValid}
      >
        <form onSubmit={inviteForm.handleSubmit(handleInviteUser)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input 
                {...inviteForm.register('firstName')} 
                placeholder="John"
                aria-describedby={inviteForm.formState.errors.firstName ? 'first-name-error' : undefined}
              />
              {inviteForm.formState.errors.firstName && (
                <p id="first-name-error" className="text-sm text-destructive">
                  {inviteForm.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input 
                {...inviteForm.register('lastName')} 
                placeholder="Doe"
                aria-describedby={inviteForm.formState.errors.lastName ? 'last-name-error' : undefined}
              />
              {inviteForm.formState.errors.lastName && (
                <p id="last-name-error" className="text-sm text-destructive">
                  {inviteForm.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email Address *</Label>
            <Input 
              {...inviteForm.register('email')} 
              type="email" 
              placeholder="john.doe@example.com"
              aria-describedby={inviteForm.formState.errors.email ? 'email-error' : undefined}
            />
            {inviteForm.formState.errors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {inviteForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select 
              value={inviteForm.watch('role')} 
              onValueChange={(value) => inviteForm.setValue('role', value as any)}
            >
              <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </FormModal>

      {/* Edit User Modal */}
      <FormModal
        isOpen={!!editingUser}
        onClose={() => {
          setEditingUser(null);
          editForm.reset();
        }}
        title="Edit User"
        description="Update user information and role."
        isLoading={updateUserMutation.isPending}
        submitLabel="Update User"
        onSubmit={editForm.handleSubmit(handleUpdateUser)}
        submitDisabled={!editForm.formState.isValid}
      >
        <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input 
                {...editForm.register('firstName')} 
                placeholder="John"
                aria-describedby={editForm.formState.errors.firstName ? 'edit-first-name-error' : undefined}
              />
              {editForm.formState.errors.firstName && (
                <p id="edit-first-name-error" className="text-sm text-destructive">
                  {editForm.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input 
                {...editForm.register('lastName')} 
                placeholder="Doe"
                aria-describedby={editForm.formState.errors.lastName ? 'edit-last-name-error' : undefined}
              />
              {editForm.formState.errors.lastName && (
                <p id="edit-last-name-error" className="text-sm text-destructive">
                  {editForm.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input 
              {...editForm.register('email')} 
              type="email" 
              placeholder="john.doe@example.com"
              aria-describedby={editForm.formState.errors.email ? 'edit-email-error' : undefined}
            />
            {editForm.formState.errors.email && (
              <p id="edit-email-error" className="text-sm text-destructive">
                {editForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select 
              value={editForm.watch('role')} 
              onValueChange={(value) => editForm.setValue('role', value as any)}
            >
              <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </FormModal>

      <FloatingPreview />
    </ErrorBoundary>
  );
}