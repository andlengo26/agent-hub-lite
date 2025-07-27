import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EnhancedDataTable } from "@/components/common/EnhancedDataTable";
import { ChatPanel } from "@/components/admin/ChatPanel";
import { ChatFilters, ChatFilters as ChatFiltersType } from "@/components/admin/ChatFilters";
import { ChatPagination } from "@/components/admin/ChatPagination";
import { AgentAssignmentModal } from "@/components/admin/AgentAssignmentModal";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AgentConsoleProvider } from "@/contexts/AgentConsoleContext";
import { AgentConsoleLayout } from "@/components/admin/agent-console/AgentConsoleLayout";
import { Chat } from "@/types";
import { useChats, useUsers } from "@/hooks/useApiQuery";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { performanceMonitor } from "@/lib/performance-monitor";
import { MoreHorizontal, UserPlus, MessageSquareX, XCircle, Trash2, MapPin, Archive, Monitor } from "lucide-react";
import { isWithinInterval, parseISO } from "date-fns";

const chatColumns = [
  { 
    key: "requesterName", 
    header: "Customer",
    sortable: true
  },
  { 
    key: "requesterEmail", 
    header: "Email",
    cell: (chat: Chat) => (
      <div className="max-w-48 truncate" title={chat.requesterEmail}>
        {chat.requesterEmail}
      </div>
    ),
    mobileHidden: true
  },
  { 
    key: "geo", 
    header: "Location",
    cell: (chat: Chat) => (
      <div className="flex items-center gap-1">
        <MapPin className="h-3 w-3 text-muted-foreground" />
        <span className="truncate max-w-24" title={chat.geo}>
          {chat.geo}
        </span>
      </div>
    ),
    mobileHidden: true
  },
  { 
    key: "status", 
    header: "Status",
    cell: (chat: Chat) => (
      <span className={`capitalize ${
        chat.status === 'active' ? 'text-green-600 font-medium' :
        chat.status === 'missed' ? 'text-red-600 font-medium' : 
        'text-gray-600 font-medium'
      }`}>
        {chat.status}
      </span>
    ),
    sortable: true
  },
  { 
    key: "assignedAgentId", 
    header: "Agent",
    cell: (chat: Chat, users: any[]) => {
      const agent = users.find(u => u.id === chat.assignedAgentId);
      return agent ? `${agent.firstName} ${agent.lastName}` : "Unassigned";
    },
    mobileHidden: true
  },
  { 
    key: "createdAt", 
    header: "Started",
    cell: (chat: Chat) => new Date(chat.createdAt).toLocaleDateString(),
    sortable: true
  }
];

export default function AllChats() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'console'>('console');
  const [assignmentModal, setAssignmentModal] = useState<{
    isOpen: boolean;
    chat: Chat | null;
  }>({ isOpen: false, chat: null });
  
  const [filters, setFilters] = useState<ChatFiltersType>({
    search: '',
    status: '',
    agent: '',
    dateRange: { from: undefined, to: undefined }
  });
  
  // Performance monitoring - always call
  performanceMonitor.startTiming('chatLoadTime');
  
  // Feature flags and API calls - always call
  const enableRealTimeUpdates = useFeatureFlag('realTime');
  const { data: chatsResponse, isLoading, error, isRefetching } = useChats({
    page: 1,
    limit: 50,
  });
  const { data: usersResponse } = useUsers();

  // Data processing - always call
  const chats = chatsResponse?.data || [];
  const users = usersResponse?.data || [];

  // Memoized filtered chats for performance - always call
  const filteredChats = useMemo(() => {
    performanceMonitor.startTiming('filterTime');
    
    let result = chats;

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter(chat => chat.status === activeTab);
    }

    // Apply additional filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(chat => 
        chat.requesterName.toLowerCase().includes(searchLower) ||
        chat.requesterEmail.toLowerCase().includes(searchLower) ||
        chat.geo.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status && filters.status !== activeTab) {
      result = result.filter(chat => chat.status === filters.status);
    }

    if (filters.agent) {
      if (filters.agent === "unassigned") {
        result = result.filter(chat => !chat.assignedAgentId);
      } else {
        result = result.filter(chat => chat.assignedAgentId === filters.agent);
      }
    }

    if (filters.dateRange.from) {
      result = result.filter(chat => {
        const chatDate = parseISO(chat.createdAt);
        if (filters.dateRange.to) {
          return isWithinInterval(chatDate, {
            start: filters.dateRange.from!,
            end: filters.dateRange.to
          });
        }
        return chatDate >= filters.dateRange.from!;
      });
    }

    performanceMonitor.endTiming('filterTime');
    return result;
  }, [chats, activeTab, filters]);

  // Pagination logic
  const paginatedChats = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredChats.slice(startIndex, startIndex + pageSize);
  }, [filteredChats, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredChats.length / pageSize);

  // Memoized status counts - always call
  const statusCounts = useMemo(() => ({
    all: chats.length,
    active: chats.filter(chat => chat.status === "active").length,
    missed: chats.filter(chat => chat.status === "missed").length,
    closed: chats.filter(chat => chat.status === "closed").length
  }), [chats]);

  // All useEffect hooks - always call in same order
  // Show refetch toast for real-time updates
  useEffect(() => {
    if (isRefetching && enableRealTimeUpdates) {
      toast({
        title: "Updating chats...",
        description: "Fetching latest chat data",
      });
    }
  }, [isRefetching, enableRealTimeUpdates]);

  // Simulate new chat assignments
  useEffect(() => {
    if (!enableRealTimeUpdates) return;
    
    const interval = setInterval(() => {
      // Simulate random new chat assignment
      if (Math.random() > 0.95) {
        toast({
          title: "New chat assigned",
          description: "A new customer chat has been assigned to you",
          variant: "default"
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [enableRealTimeUpdates]);

  // Error handling toast
  useEffect(() => {
    if (error && chats.length > 0) {
      toast({
        title: "Using offline data",
        description: "Failed to connect to server. Showing cached data.",
        variant: "destructive"
      });
    }
  }, [error, chats.length]);

  // Cleanup and performance monitoring on unmount
  useEffect(() => {
    return () => {
      setSelectedChat(null);
      performanceMonitor.endTiming('chatLoadTime');
      performanceMonitor.measureMemoryUsage();
      performanceMonitor.checkPerformance();
    };
  }, []);

  // Log performance metrics when data loads
  useEffect(() => {
    if (chats.length > 0) {
      performanceMonitor.endTiming('chatLoadTime');
      performanceMonitor.logMetrics();
    }
  }, [chats]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, activeTab]);

  // Callbacks for actions
  const handleAssignAgent = useCallback((chat: Chat) => {
    setAssignmentModal({ isOpen: true, chat });
  }, []);

  const handleAgentAssigned = useCallback((chatId: string, agentId: string) => {
    // In a real app, this would update the chat via API
    toast({
      title: "Success",
      description: "Agent assigned successfully",
    });
  }, []);

  const handleCancelChat = useCallback(async (chat: Chat) => {
    toast({
      title: "Chat Cancelled",
      description: `Chat with ${chat.requesterName} has been cancelled`,
    });
  }, []);

  const handleCloseChat = useCallback(async (chat: Chat) => {
    toast({
      title: "Chat Closed",
      description: `Chat with ${chat.requesterName} has been closed`,
    });
  }, []);

  const handleDeleteChat = useCallback(async (chat: Chat) => {
    toast({
      title: "Chat Deleted",
      description: `Chat with ${chat.requesterName} has been deleted`,
      variant: "destructive"
    });
  }, []);

  const bulkActions = [
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

  // Handle loading state in render return
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


  // Filter queue chats (active/missed status for console view)
  const queueChats = useMemo(() => {
    return filteredChats.filter(chat => chat.status === 'active' || chat.status === 'missed');
  }, [filteredChats]);

  return (
    <ErrorBoundary>
      <AgentConsoleProvider>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">All Chats</h1>
              <p className="text-muted-foreground">
                Monitor and manage all customer chat interactions
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-space-2">
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
              />
            </div>
          ) : (
            <>
              {/* Filters */}
              <ChatFilters
                filters={filters}
                onFiltersChange={setFilters}
                isCollapsed={filtersCollapsed}
                onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
              />

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All Chats ({statusCounts.all})</TabsTrigger>
                  <TabsTrigger value="active">Active ({statusCounts.active})</TabsTrigger>
                  <TabsTrigger value="missed">Missed ({statusCounts.missed})</TabsTrigger>
                  <TabsTrigger value="closed">Closed ({statusCounts.closed})</TabsTrigger>
                  {enableRealTimeUpdates && (
                    <Badge variant="outline" className="ml-2">
                      {isRefetching ? "Updating..." : "Live"}
                    </Badge>
                  )}
                </TabsList>

                <TabsContent value={activeTab} key={`tab-${activeTab}`}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>
                          {activeTab === "all" ? "All Conversations" : 
                           activeTab === "active" ? "Active Chats" :
                           activeTab === "missed" ? "Missed Chats" : "Closed Chats"}
                        </span>
                        <span className="text-sm font-normal text-muted-foreground">
                          {filteredChats.length} total
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EnhancedDataTable
                        data={paginatedChats}
                        columns={chatColumns.map(col => ({
                          ...col,
                          cell: col.cell ? (chat: Chat) => col.cell(chat, users) : undefined
                        }))}
                        onRowClick={setSelectedChat}
                        onEdit={(chat) => setSelectedChat(chat)}
                        onView={(chat) => setSelectedChat(chat)}
                        loading={isLoading}
                        emptyState={{
                          title: "No chats found",
                          description: "No chats match your current filters."
                        }}
                        selectable={true}
                        searchable={false}
                        bulkActions={bulkActions}
                      />

                      {/* Pagination */}
                      <ChatPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={filteredChats.length}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                          setPageSize(size);
                          setCurrentPage(1);
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Chat Details Drawer - only show in table view */}
        {viewMode === 'table' && (
          <>
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

            {/* Agent Assignment Modal */}
            <AgentAssignmentModal
              isOpen={assignmentModal.isOpen}
              onClose={() => setAssignmentModal({ isOpen: false, chat: null })}
              chat={assignmentModal.chat}
              onAssign={handleAgentAssigned}
            />
          </>
        )}
      </AgentConsoleProvider>
    </ErrorBoundary>
  );
}