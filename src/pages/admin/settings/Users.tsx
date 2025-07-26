import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FloatingPreview } from "@/components/admin/FloatingPreview";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Loader2, Users as UsersIcon } from "lucide-react";
import { useUsers, useInviteUser, useUpdateUser, useDeleteUser } from "@/hooks/useApiQuery";
import { inviteUserSchema, updateUserSchema, type InviteUserInput, type UpdateUserInput } from "@/lib/validations";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { User } from "@/lib/mock-data";

const userColumns: Column<User>[] = [
  { 
    key: "firstName", 
    header: "User",
    cell: (value, row) => (
      <div className="flex items-center gap-2">
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
    cell: (value) => (
      <Badge variant="outline">{value}</Badge>
    )
  },
  { 
    key: "onlineStatus", 
    header: "Status",
    cell: (value) => (
      <Badge variant={value === "online" ? "default" : value === "away" ? "secondary" : "destructive"}>
        {value}
      </Badge>
    )
  },
  { key: "createdAt", header: "Joined" },
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
    } catch (error) {
      // Error handled by mutation
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
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete "${user.firstName} ${user.lastName}"?`)) return;
    
    try {
      await deleteUserMutation.mutateAsync(user.id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <>
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
          <CardContent>
            <DataTable
              columns={userColumns}
              data={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          </CardContent>
        </Card>
      </div>

      {/* Invite User Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          inviteForm.reset();
        }}
        title="Invite New User"
        description="Send an invitation to add a new team member."
      >
        <form onSubmit={inviteForm.handleSubmit(handleInviteUser)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input {...inviteForm.register('firstName')} placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input {...inviteForm.register('lastName')} placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email Address *</Label>
            <Input {...inviteForm.register('email')} type="email" placeholder="john.doe@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={inviteForm.watch('role')} onValueChange={(value) => inviteForm.setValue('role', value as any)}>
              <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              size="sm"
              type="button"
              onClick={() => {
                setIsInviteModalOpen(false);
                inviteForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              type="submit"
              disabled={inviteUserMutation.isPending}
            >
              {inviteUserMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => {
          setEditingUser(null);
          editForm.reset();
        }}
        title="Edit User"
        description="Update user information and role."
      >
        <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input {...editForm.register('firstName')} placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input {...editForm.register('lastName')} placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input {...editForm.register('email')} type="email" placeholder="john.doe@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={editForm.watch('role')} onValueChange={(value) => editForm.setValue('role', value as any)}>
              <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              size="sm"
              type="button"
              onClick={() => {
                setEditingUser(null);
                editForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              type="submit"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Update User
            </Button>
          </div>
        </form>
      </Modal>

      <FloatingPreview />
    </>
  );
}