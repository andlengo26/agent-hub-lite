import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Shield, Users as UsersIcon, UserCheck } from "lucide-react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { mockUsers, User } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FloatingPreview } from "@/components/admin/FloatingPreview";
import { useUsers, useUpdateUser, useDeleteUser } from "@/hooks/useApiQuery";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const enableMultiTenant = useFeatureFlag('multiTenant');
  const { data: usersResponse, isLoading } = useUsers();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  
  const users = usersResponse?.data || mockUsers;

  const handleUpdateUser = (userId: string, data: Partial<User>) => {
    updateUserMutation.mutate({ userId, data });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
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
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Send Invitation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Team Members ({users.length})
            {enableMultiTenant && (
              <Badge variant="outline">Multi-Tenant</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={userColumns}
            onEdit={(user) => handleUpdateUser(user.id, user)}
            onDelete={(user) => handleDeleteUser(user.id)}
          />
        </CardContent>
      </Card>
    </div>
    <FloatingPreview />
  </>
  );
}