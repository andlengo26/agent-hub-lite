import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable, Column } from "@/components/ui/data-table";
import { BulkActionsToolbar } from "@/components/common/BulkActionsToolbar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormModal } from "@/components/common/FormModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Settings, 
  Bell, 
  BellOff,
  Clock,
  MessageSquare,
  TrendingUp,
  Filter,
  Download,
  Send
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: 'agent' | 'manager' | 'admin';
  onlineStatus: 'online' | 'away' | 'busy' | 'offline';
  activeChatCount: number;
  maxConcurrentChats: number;
  totalChatsToday: number;
  avgResponseTime: number;
  availabilityEnabled: boolean;
  notificationsEnabled: boolean;
  workingHours: boolean;
  lastActive: string;
  organizationId?: string;
}

const mockAgents: Agent[] = [
  {
    id: 'agent_001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    role: 'agent',
    onlineStatus: 'online',
    activeChatCount: 2,
    maxConcurrentChats: 3,
    totalChatsToday: 15,
    avgResponseTime: 45,
    availabilityEnabled: true,
    notificationsEnabled: true,
    workingHours: true,
    lastActive: new Date().toISOString()
  },
  {
    id: 'agent_002',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@company.com',
    role: 'agent',
    onlineStatus: 'busy',
    activeChatCount: 3,
    maxConcurrentChats: 3,
    totalChatsToday: 18,
    avgResponseTime: 38,
    availabilityEnabled: true,
    notificationsEnabled: false,
    workingHours: true,
    lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 'agent_003',
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis@company.com',
    role: 'manager',
    onlineStatus: 'away',
    activeChatCount: 1,
    maxConcurrentChats: 5,
    totalChatsToday: 8,
    avgResponseTime: 52,
    availabilityEnabled: false,
    notificationsEnabled: true,
    workingHours: false,
    lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'agent_004',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@company.com',
    role: 'agent',
    onlineStatus: 'offline',
    activeChatCount: 0,
    maxConcurrentChats: 4,
    totalChatsToday: 12,
    avgResponseTime: 48,
    availabilityEnabled: true,
    notificationsEnabled: true,
    workingHours: true,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [isBulkNotificationModalOpen, setIsBulkNotificationModalOpen] = useState(false);
  const [isBulkAvailabilityModalOpen, setIsBulkAvailabilityModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkAvailabilitySettings, setBulkAvailabilitySettings] = useState({
    availabilityEnabled: true,
    maxConcurrentChats: 3,
    workingHours: true
  });

  const getStatusBadge = (status: Agent['onlineStatus']) => {
    const statusConfig = {
      online: { variant: 'default' as const, color: 'bg-success text-success-foreground' },
      busy: { variant: 'secondary' as const, color: 'bg-highlight text-highlight-foreground' },
      away: { variant: 'outline' as const, color: 'bg-muted text-muted-foreground' },
      offline: { variant: 'destructive' as const, color: 'bg-destructive text-destructive-foreground' }
    };
    return statusConfig[status];
  };

  const agentColumns: Column<Agent>[] = [
    {
      key: 'firstName',
      label: 'Agent',
      sortable: true,
      render: (_, agent) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={agent.avatarUrl} alt={`${agent.firstName} ${agent.lastName}`} />
            <AvatarFallback>{agent.firstName[0]}{agent.lastName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{agent.firstName} {agent.lastName}</div>
            <div className="text-sm text-muted-foreground">{agent.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'onlineStatus',
      label: 'Status',
      sortable: true,
      render: (status, agent) => {
        const config = getStatusBadge(status);
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.color}`} />
            <Badge variant={config.variant} className="capitalize text-xs">
              {status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {agent.activeChatCount}/{agent.maxConcurrentChats}
            </span>
          </div>
        );
      },
    },
    {
      key: 'totalChatsToday',
      label: 'Today',
      sortable: true,
      render: (count) => (
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm font-medium">{count}</span>
        </div>
      ),
    },
    {
      key: 'avgResponseTime',
      label: 'Avg Response',
      sortable: true,
      render: (time) => (
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{time}s</span>
        </div>
      ),
    },
    {
      key: 'availabilityEnabled',
      label: 'Auto Availability',
      render: (enabled) => (
        enabled ? 
          <UserCheck className="w-4 h-4 text-success" /> : 
          <UserX className="w-4 h-4 text-muted-foreground" />
      ),
    },
    {
      key: 'notificationsEnabled',
      label: 'Notifications',
      render: (enabled) => (
        enabled ? 
          <Bell className="w-4 h-4 text-primary" /> : 
          <BellOff className="w-4 h-4 text-muted-foreground" />
      ),
    }
  ];

  const filteredAgents = agents.filter(agent => {
    if (filterStatus === 'all') return true;
    return agent.onlineStatus === filterStatus;
  });

  const handleBulkNotificationToggle = () => {
    const agentIds = selectedAgents.map(agent => agent.id);
    setAgents(prev => prev.map(agent => 
      agentIds.includes(agent.id) 
        ? { ...agent, notificationsEnabled: !agent.notificationsEnabled }
        : agent
    ));
    setSelectedAgents([]);
    toast({
      title: 'Notifications Updated',
      description: `Updated notification settings for ${selectedAgents.length} agents`
    });
  };

  const handleBulkAvailabilityUpdate = () => {
    const agentIds = selectedAgents.map(agent => agent.id);
    setAgents(prev => prev.map(agent => 
      agentIds.includes(agent.id) 
        ? { 
            ...agent, 
            availabilityEnabled: bulkAvailabilitySettings.availabilityEnabled,
            maxConcurrentChats: bulkAvailabilitySettings.maxConcurrentChats,
            workingHours: bulkAvailabilitySettings.workingHours
          }
        : agent
    ));
    setIsBulkAvailabilityModalOpen(false);
    setSelectedAgents([]);
    toast({
      title: 'Availability Updated',
      description: `Updated availability settings for ${selectedAgents.length} agents`
    });
  };

  const handleSendBulkNotification = () => {
    if (!bulkMessage.trim()) return;
    
    setIsBulkNotificationModalOpen(false);
    setBulkMessage('');
    setSelectedAgents([]);
    toast({
      title: 'Notification Sent',
      description: `Sent notification to ${selectedAgents.length} agents`
    });
  };

  const bulkActions = [
    { 
      id: 'toggle-notifications', 
      label: 'Toggle Notifications', 
      icon: <Bell className="w-4 h-4" />, 
      onClick: handleBulkNotificationToggle 
    },
    { 
      id: 'update-availability', 
      label: 'Update Availability', 
      icon: <Settings className="w-4 h-4" />, 
      onClick: () => setIsBulkAvailabilityModalOpen(true) 
    },
    { 
      id: 'send-notification', 
      label: 'Send Notification', 
      icon: <Send className="w-4 h-4" />, 
      onClick: () => setIsBulkNotificationModalOpen(true) 
    },
    { 
      id: 'export', 
      label: 'Export Selected', 
      icon: <Download className="w-4 h-4" />, 
      onClick: () => toast({ title: 'Export started' }) 
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Management</h1>
        <p className="text-muted-foreground">
          Manage agent availability, notifications, and performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-space-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online Agents</p>
                <p className="text-2xl font-bold text-success">
                  {agents.filter(a => a.onlineStatus === 'online').length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-space-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Chats</p>
                <p className="text-2xl font-bold text-primary">
                  {agents.reduce((sum, agent) => sum + agent.activeChatCount, 0)}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-space-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold text-secondary">
                  {Math.round(agents.reduce((sum, agent) => sum + agent.avgResponseTime, 0) / agents.length)}s
                </p>
              </div>
              <Clock className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-space-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Chats Today</p>
                <p className="text-2xl font-bold text-highlight">
                  {agents.reduce((sum, agent) => sum + agent.totalChatsToday, 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-highlight" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Agent Overview
            </CardTitle>
            <CardDescription>Monitor and manage agent status and settings</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="away">Away</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <DataTable
            data={filteredAgents}
            columns={agentColumns}
            searchable
            selectable
            bulkActions={bulkActions}
            emptyMessage="No agents found"
            emptyDescription="No agents match the current filter criteria."
          />
        </CardContent>
      </Card>

      {/* Bulk Notification Modal */}
      <FormModal
        isOpen={isBulkNotificationModalOpen}
        onClose={() => {
          setIsBulkNotificationModalOpen(false);
          setBulkMessage('');
        }}
        title="Send Bulk Notification"
        description={`Send a notification to ${selectedAgents.length} selected agents`}
        onSubmit={handleSendBulkNotification}
        submitLabel="Send Notification"
        submitDisabled={!bulkMessage.trim()}
      >
        <div className="space-y-4">
          <div>
            <Label>Selected Agents ({selectedAgents.length})</Label>
            <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
              {selectedAgents.slice(0, 3).map((agent) => (
                <div key={agent.id} className="text-sm text-muted-foreground">
                  {agent.firstName} {agent.lastName}
                </div>
              ))}
              {selectedAgents.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  and {selectedAgents.length - 3} more...
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="bulk-message">Notification Message</Label>
            <Textarea
              id="bulk-message"
              value={bulkMessage}
              onChange={(e) => setBulkMessage(e.target.value)}
              placeholder="Enter notification message..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
      </FormModal>

      {/* Bulk Availability Modal */}
      <FormModal
        isOpen={isBulkAvailabilityModalOpen}
        onClose={() => setIsBulkAvailabilityModalOpen(false)}
        title="Update Availability Settings"
        description={`Update availability settings for ${selectedAgents.length} selected agents`}
        onSubmit={handleBulkAvailabilityUpdate}
        submitLabel="Update Settings"
      >
        <div className="space-y-4">
          <div>
            <Label>Selected Agents ({selectedAgents.length})</Label>
            <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
              {selectedAgents.slice(0, 3).map((agent) => (
                <div key={agent.id} className="text-sm text-muted-foreground">
                  {agent.firstName} {agent.lastName}
                </div>
              ))}
              {selectedAgents.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  and {selectedAgents.length - 3} more...
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Auto Availability</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic availability management
                </p>
              </div>
              <Switch 
                checked={bulkAvailabilitySettings.availabilityEnabled}
                onCheckedChange={(checked) => setBulkAvailabilitySettings(prev => ({
                  ...prev,
                  availabilityEnabled: checked
                }))}
              />
            </div>

            <div>
              <Label htmlFor="bulk-max-chats">Maximum Concurrent Chats</Label>
              <Input
                id="bulk-max-chats"
                type="number"
                min="1"
                max="10"
                value={bulkAvailabilitySettings.maxConcurrentChats}
                onChange={(e) => setBulkAvailabilitySettings(prev => ({
                  ...prev,
                  maxConcurrentChats: parseInt(e.target.value) || 1
                }))}
                className="w-20 mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Working Hours</Label>
                <p className="text-sm text-muted-foreground">
                  Respect configured working hours
                </p>
              </div>
              <Switch 
                checked={bulkAvailabilitySettings.workingHours}
                onCheckedChange={(checked) => setBulkAvailabilitySettings(prev => ({
                  ...prev,
                  workingHours: checked
                }))}
              />
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  );
}