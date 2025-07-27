import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/useApiQuery';

interface AgentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
  onAssign: (chatId: string, agentId: string) => void;
}

export function AgentAssignmentModal({ 
  isOpen, 
  onClose, 
  chat, 
  onAssign 
}: AgentAssignmentModalProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const { data: usersResponse } = useUsers();
  const users = usersResponse?.data || [];

  const handleAssign = async () => {
    if (!chat || !selectedAgentId) return;
    
    setIsAssigning(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onAssign(chat.id, selectedAgentId);
      
      const selectedAgent = users.find(u => u.id === selectedAgentId);
      toast({
        title: "Agent Assigned",
        description: `Chat has been assigned to ${selectedAgent?.firstName} ${selectedAgent?.lastName}`,
      });
      
      onClose();
      setSelectedAgentId('');
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedAgent = users.find(u => u.id === selectedAgentId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Agent</DialogTitle>
        </DialogHeader>
        
        {chat && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{chat.requesterName}</span>
                <Badge variant={chat.status === "active" ? "default" : "secondary"}>
                  {chat.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{chat.requesterEmail}</p>
              <p className="text-sm text-muted-foreground">{chat.geo}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Agent</label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
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
            </div>

            {selectedAgent && (
              <div className="bg-primary/5 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedAgent.avatar || selectedAgent.avatarUrl} />
                    <AvatarFallback>
                      {selectedAgent.firstName[0]}{selectedAgent.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {selectedAgent.firstName} {selectedAgent.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedAgentId || isAssigning}
          >
            {isAssigning ? "Assigning..." : "Assign Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}