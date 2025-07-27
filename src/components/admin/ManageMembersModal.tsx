/**
 * Modal for managing organization members
 * Allows viewing, adding, and removing members with bulk operations
 */

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelect } from '@/components/ui/multi-select';
import { Separator } from '@/components/ui/separator';
import { Users, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Organization, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
  availableUsers: User[];
  isLoading?: boolean;
  onAddMembers: (organizationId: string, userIds: string[]) => Promise<void>;
  onRemoveMembers: (organizationId: string, userIds: string[]) => Promise<void>;
}

export function ManageMembersModal({
  isOpen,
  onClose,
  organization,
  availableUsers,
  isLoading = false,
  onAddMembers,
  onRemoveMembers,
}: ManageMembersModalProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedNewUsers, setSelectedNewUsers] = useState<string[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [isRemovingMembers, setIsRemovingMembers] = useState(false);
  const { toast } = useToast();

  // Get current members and available users to add
  const currentMembers = useMemo(() => {
    if (!organization?.members) return [];
    return availableUsers.filter(user => organization.members!.includes(user.id));
  }, [organization?.members, availableUsers]);

  const usersToAdd = useMemo(() => {
    if (!organization?.members) return availableUsers;
    return availableUsers.filter(user => !organization.members!.includes(user.id));
  }, [organization?.members, availableUsers]);

  const userOptions = useMemo(() => 
    usersToAdd.map(user => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName} (${user.email})`,
    }))
  , [usersToAdd]);

  const handleMemberSelection = (userId: string, checked: boolean) => {
    setSelectedMembers(prev => 
      checked 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAllMembers = (checked: boolean) => {
    setSelectedMembers(checked ? currentMembers.map(user => user.id) : []);
  };

  const handleAddMembers = async () => {
    if (!organization || selectedNewUsers.length === 0) return;

    try {
      setIsAddingMembers(true);
      await onAddMembers(organization.id, selectedNewUsers);
      setSelectedNewUsers([]);
      toast({ title: 'Success', description: 'Members added successfully' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to add members',
        variant: 'destructive'
      });
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleRemoveMembers = async () => {
    if (!organization || selectedMembers.length === 0) return;

    try {
      setIsRemovingMembers(true);
      await onRemoveMembers(organization.id, selectedMembers);
      setSelectedMembers([]);
      toast({ title: 'Success', description: 'Members removed successfully' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to remove members',
        variant: 'destructive'
      });
    } finally {
      setIsRemovingMembers(false);
    }
  };

  const handleClose = () => {
    setSelectedMembers([]);
    setSelectedNewUsers([]);
    onClose();
  };

  if (!organization) return null;

  const isAllSelected = currentMembers.length > 0 && currentMembers.every(user => selectedMembers.includes(user.id));
  const isSomeSelected = selectedMembers.length > 0 && selectedMembers.length < currentMembers.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Manage Members - ${organization.name}`}
      description={`Add or remove members from ${organization.name}`}
      size="lg"
    >
      <div className="space-y-space-6">
        {/* Add New Members Section */}
        <div className="space-y-space-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <h3 className="text-base font-medium">Add New Members</h3>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <MultiSelect
                options={userOptions}
                selected={selectedNewUsers}
                onChange={setSelectedNewUsers}
                placeholder="Select users to add..."
                disabled={isLoading || isAddingMembers}
              />
            </div>
            <Button
              onClick={handleAddMembers}
              disabled={selectedNewUsers.length === 0 || isAddingMembers || isLoading}
              size="sm"
            >
              {isAddingMembers && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add
            </Button>
          </div>
        </div>

        <Separator />

        {/* Current Members Section */}
        <div className="space-y-space-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <h3 className="text-base font-medium">Current Members</h3>
              <Badge variant="secondary">{currentMembers.length}</Badge>
            </div>
            
            {selectedMembers.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveMembers}
                disabled={isRemovingMembers || isLoading}
              >
                {isRemovingMembers && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <UserMinus className="w-4 h-4 mr-2" />
                Remove ({selectedMembers.length})
              </Button>
            )}
          </div>

          {currentMembers.length === 0 ? (
            <div className="text-center py-space-6 text-text-secondary">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No members in this organization</p>
            </div>
          ) : (
            <div className="space-y-space-3">
              {/* Select All Checkbox */}
              <div className="flex items-center space-x-2 p-2 rounded-md border border-border">
                <Checkbox
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      const checkboxEl = el.querySelector('input');
                      if (checkboxEl) checkboxEl.indeterminate = isSomeSelected;
                    }
                  }}
                  onCheckedChange={handleSelectAllMembers}
                />
                <span className="text-sm font-medium">
                  Select All ({currentMembers.length} members)
                </span>
              </div>

              {/* Members List */}
              <div className="space-y-space-2 max-h-60 overflow-y-auto">
                {currentMembers.map((user) => (
                  <div 
                    key={user.id}
                    className="flex items-center space-x-3 p-3 rounded-md border border-border hover:bg-surface"
                  >
                    <Checkbox
                      checked={selectedMembers.includes(user.id)}
                      onCheckedChange={(checked) => handleMemberSelection(user.id, !!checked)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {user.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}