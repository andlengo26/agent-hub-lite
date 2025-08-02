import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chat, User } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ChatReassignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
  users: User[];
  onReassign: (chatId: string, newAgentId: string) => Promise<void>;
}

export function ChatReassignmentModal({ 
  isOpen, 
  onClose, 
  chat, 
  users,
  onReassign 
}: ChatReassignmentModalProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isReassigning, setIsReassigning] = useState(false);

  // Filter to show only online human agents, excluding the current assignee
  const availableAgents = users.filter(user => 
    user.onlineStatus === 'online' && 
    user.role !== 'admin' &&
    user.id !== chat?.assignedAgentId
  );

  const handleReassign = async () => {
    if (!chat || !selectedAgentId) return;
    
    setIsReassigning(true);
    
    try {
      await onReassign(chat.id, selectedAgentId);
      
      const selectedAgent = users.find(u => u.id === selectedAgentId);
      toast({
        title: "Chat Reassigned",
        description: `Chat has been reassigned to ${selectedAgent?.firstName} ${selectedAgent?.lastName}`,
      });
      
      onClose();
      setSelectedAgentId('');
    } catch (error) {
      toast({
        title: "Reassignment Failed",
        description: "Failed to reassign chat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsReassigning(false);
    }
  };

  const handleClose = () => {
    setSelectedAgentId('');
    onClose();
  };

  const selectedAgent = users.find(u => u.id === selectedAgentId);
  const currentAgent = chat?.assignedAgentId ? users.find(u => u.id === chat.assignedAgentId) : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign Chat</DialogTitle>
        </DialogHeader>
        
        {chat && (
          <div className="space-y-4">
            {/* Chat Info */}
            <div className="bg-surface p-4 rounded-radius-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text-primary">{chat.requesterName}</span>
                <Badge variant={chat.status === "active" ? "default" : "secondary"}>
                  {chat.status}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary">{chat.requesterEmail}</p>
              <p className="text-sm text-text-secondary">{chat.geo}</p>
            </div>

            {/* Current Agent Info */}
            {currentAgent && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Currently Assigned To</label>
                <div className="bg-primary/5 p-3 rounded-radius-md">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentAgent.avatar || currentAgent.avatarUrl} />
                      <AvatarFallback>
                        {currentAgent.firstName[0]}{currentAgent.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-text-primary">
                        {currentAgent.firstName} {currentAgent.lastName}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {currentAgent.email}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {currentAgent.role}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Reassign To</label>
              {availableAgents.length > 0 ? (
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar || user.avatarUrl} />
                            <AvatarFallback>
                              {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.firstName} {user.lastName}</span>
                          <Badge variant="outline" className="ml-auto">
                            {user.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-text-secondary p-3 bg-surface rounded-radius-md">
                  No online agents available for reassignment
                </div>
              )}
            </div>

            {/* Selected Agent Preview */}
            {selectedAgent && (
              <div className="bg-highlight/5 p-3 rounded-radius-md">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedAgent.avatar || selectedAgent.avatarUrl} />
                    <AvatarFallback>
                      {selectedAgent.firstName[0]}{selectedAgent.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-text-primary">
                      {selectedAgent.firstName} {selectedAgent.lastName}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {selectedAgent.email}
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {selectedAgent.role}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isReassigning}>
            Cancel
          </Button>
          <Button 
            onClick={handleReassign} 
            disabled={!selectedAgentId || isReassigning || availableAgents.length === 0}
          >
            {isReassigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reassigning...
              </>
            ) : (
              "Reassign Chat"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}