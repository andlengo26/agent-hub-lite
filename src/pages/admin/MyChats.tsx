import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DataTable } from "@/components/ui/data-table";
import { ChatFilters } from "@/components/admin/ChatFilters";
import { ChatPanel } from "@/components/admin/ChatPanel";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AgentConsoleProvider } from "@/contexts/AgentConsoleContext";
import { AgentConsoleLayout } from "@/components/admin/agent-console/AgentConsoleLayout";
import { Chat } from "@/types";
import { useChatsSummary } from "@/hooks/useChatsSummary";
// Removed WebSocket hook
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Filter, Monitor, Download, Archive, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
// Removed CSV export
import { isWithinInterval, parseISO } from "date-fns";



const createChatColumns = (users: any[]) => [
  { 
    key: "requesterName", 
    label: "Customer",
    sortable: true
  },
  { 
    key: "requesterEmail", 
    label: "Email",
    render: (_, chat: Chat) => (
      <div className="max-w-48 truncate" title={chat.requesterEmail}>
        {chat.requesterEmail}
      </div>
    ),
    hideOnMobile: true
  },
  { 
    key: "geo", 
    label: "Location",
    render: (_, chat: Chat) => (
      <div className="flex items-center gap-1">
        <MapPin className="h-3 w-3 text-muted-foreground" />
        <span className="truncate max-w-24" title={chat.geo}>
          {chat.geo}
        </span>
      </div>
    ),
    hideOnMobile: true
  },
  {
    key: "assignedAgentId",
    label: "Assigned Agent",
    render: (_, chat: Chat) => {
      if (!chat.assignedAgentId) {
        return <Badge variant="outline">Unassigned</Badge>;
      }
      const agent = users.find(u => u.id === chat.assignedAgentId);
      return agent ? `${agent.firstName} ${agent.lastName}` : "Unknown";
    },
    hideOnMobile: true
  },
  { 
    key: "status", 
    label: "Status",
    render: (_, chat: Chat) => (
      <span className={`capitalize ${
        chat.status === 'active' ? 'text-success font-medium' :
        chat.status === 'missed' ? 'text-destructive font-medium' : 
        'text-text-secondary font-medium'
      }`}>
        {chat.status}
      </span>
    ),
    sortable: true
  },
  { 
    key: "createdAt", 
    label: "Started",
    render: (_, chat: Chat) => new Date(chat.createdAt).toLocaleDateString(),
    sortable: true
  }
];

export default function MyChats() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'console'>('console');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    agent: '',
    dateRange: { from: undefined, to: undefined }
  });

  const { currentUser } = useAuth();
  const enableRealTimeUpdates = useFeatureFlag('realTime');
  
  // Use consolidated hook for data fetching
  const { chats: allChats, users, counts, isLoading } = useChatsSummary({
    agentId: currentUser?.id, // Filter by current agent
  });

  // Debug logging
  console.log('MyChats - Current user:', currentUser?.id);
  console.log('MyChats - Filtered chats count:', allChats.length);
  console.log('MyChats - All chats sample:', allChats.slice(0, 3));
  // WebSocket connection removed
  
  // User chats are already filtered by the hook
  const userChats = allChats;

  // Apply filters and active tab
  const filteredChats = useMemo(() => {
    let filtered = userChats;

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(chat => chat.status === activeTab);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(chat => 
        chat.requesterName.toLowerCase().includes(searchLower) ||
        chat.requesterEmail.toLowerCase().includes(searchLower) ||
        chat.geo.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(chat => chat.status === filters.status);
    }

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(chat => {
        const chatDate = parseISO(chat.createdAt);
        
        if (filters.dateRange.from && filters.dateRange.to) {
          return isWithinInterval(chatDate, {
            start: filters.dateRange.from,
            end: filters.dateRange.to
          });
        } else if (filters.dateRange.from) {
          return chatDate >= filters.dateRange.from;
        } else if (filters.dateRange.to) {
          return chatDate <= filters.dateRange.to;
        }
        
        return true;
      });
    }

    return filtered;
  }, [userChats, activeTab, filters]);

  // Use counts from the hook
  const statusCounts = {
    all: counts.total,
    active: counts.active,
    missed: counts.missed,
    closed: counts.closed,
  };

  // Filter queue chats (active/missed status for console view)
  const queueChats = useMemo(() => {
    return filteredChats.filter(chat => chat.status === 'active' || chat.status === 'missed');
  }, [filteredChats]);

  // Bulk actions for DataTable
  const bulkActions = [
    {
      id: "export",
      label: "Export as CSV",
      icon: <Download className="h-4 w-4" />,
      onClick: async (selectedChats: Chat[]) => {
        console.log('Export chats:', selectedChats); // Export functionality removed
        toast({
          title: "Export Complete",
          description: `${selectedChats.length} chats exported to CSV`,
        });
      }
    },
    {
      id: "archive",
      label: "Archive Selected",
      icon: <Archive className="h-4 w-4" />,
      onClick: async (selectedChats: Chat[]) => {
        toast({
          title: "Chats Archived",
          description: `${selectedChats.length} chats have been archived`,
        });
      }
    },
    {
      id: "delete",
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive" as const,
      onClick: async (selectedChats: Chat[]) => {
        toast({
          title: "Chats Deleted",
          description: `${selectedChats.length} chats have been deleted`,
          variant: "destructive"
        });
      }
    }
  ];

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
    <ErrorBoundary>
      <AgentConsoleProvider>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Chats</h1>
              <p className="text-muted-foreground">
                Manage chats assigned to you
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'console' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('console')}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Console View
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table View
              </Button>
            </div>
          </div>

          {viewMode === 'console' ? (
            <div className="h-[calc(100vh-12rem)]">
              <AgentConsoleLayout 
                queueChats={queueChats}
                isLoading={isLoading}
                users={users}
                selectionMode={true}
              />
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {filtersCollapsed ? 'Show' : 'Hide'} Filters
                </Button>
              </div>

              {!filtersCollapsed && (
                <ChatFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  isCollapsed={false}
                  onToggleCollapse={() => {}}
                />
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                  <TabsTrigger value="active">Active ({statusCounts.active})</TabsTrigger>
                  <TabsTrigger value="missed">Missed ({statusCounts.missed})</TabsTrigger>
                  <TabsTrigger value="closed">Closed ({statusCounts.closed})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {activeTab === "all" ? "All My Chats" : 
                         activeTab === "active" ? "Active Chats" :
                         activeTab === "missed" ? "Missed Chats" : "Closed Chats"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-4">
                          {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                        </div>
                      ) : (
                        <DataTable
                          data={filteredChats}
                          columns={createChatColumns(users) as any}
                          onRowClick={(row: any) => setSelectedChat(row)}
                          loading={isLoading}
                          selectable={true}
                          bulkActions={bulkActions}
                          pagination={true}
                          searchable={true}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Chat Details Drawer - only show in table view */}
        {viewMode === 'table' && (
          <Sheet open={!!selectedChat} onOpenChange={() => setSelectedChat(null)}>
            <SheetContent className="w-2/3 max-w-[66vw] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Chat Details</SheetTitle>
              </SheetHeader>
              {selectedChat && (
                <ErrorBoundary>
                  <ChatPanel key={selectedChat.id} chat={selectedChat} />
                </ErrorBoundary>
              )}
            </SheetContent>
          </Sheet>
        )}
      </AgentConsoleProvider>
    </ErrorBoundary>
  );
}