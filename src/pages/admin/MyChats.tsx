import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EnhancedDataTable } from "@/components/common/EnhancedDataTable";
import { ChatFilters } from "@/components/admin/ChatFilters";
import { ChatPanel } from "@/components/admin/ChatPanel";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { mockChats, mockUsers, Chat } from "@/lib/mock-data";
import { useChats, useUsers } from "@/hooks/useApiQuery";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Filter } from "lucide-react";
import { isWithinInterval, parseISO } from "date-fns";

const currentUserId = "user_002"; // Mock current user ID

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
    key: "assignedAgentId",
    header: "Assigned Agent",
    cell: (chat: Chat) => {
      if (!chat.assignedAgentId) {
        return <Badge variant="outline">Unassigned</Badge>;
      }
      const agent = mockUsers.find(u => u.id === chat.assignedAgentId);
      return agent ? `${agent.firstName} ${agent.lastName}` : "Unknown";
    },
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
    key: "createdAt", 
    header: "Started",
    cell: (chat: Chat) => new Date(chat.createdAt).toLocaleDateString(),
    sortable: true
  }
];

export default function MyChats() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    agent: 'all',
    dateRange: { from: undefined as Date | undefined, to: undefined as Date | undefined }
  });
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);

  const enableRealTimeUpdates = useFeatureFlag('realTime');
  const { data: chatsResponse, isLoading } = useChats();
  const { data: usersResponse } = useUsers();
  
  const allChats = chatsResponse?.data || mockChats;
  const users = usersResponse?.data || mockUsers;
  
  // Filter to only show chats assigned to current user
  const userChats = allChats.filter(chat => chat.assignedAgentId === currentUserId);

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

  // Calculate counts for tabs
  const statusCounts = useMemo(() => {
    return {
      all: userChats.length,
      active: userChats.filter(chat => chat.status === 'active').length,
      missed: userChats.filter(chat => chat.status === 'missed').length,
      closed: userChats.filter(chat => chat.status === 'closed').length
    };
  }, [userChats]);

  const handleRowClick = (chat: Chat) => {
    setSelectedChat(chat);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Chats</h1>
        <p className="text-muted-foreground">
          View and manage chats assigned to you
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <ChatFilters
          filters={filters}
          onFiltersChange={setFilters}
          isCollapsed={filtersCollapsed}
          onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            My Assigned Chats
            {enableRealTimeUpdates && (
              <Badge variant="outline">Live</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs for different chat statuses */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({statusCounts.active})
              </TabsTrigger>
              <TabsTrigger value="missed">
                Missed ({statusCounts.missed})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed ({statusCounts.closed})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              <EnhancedDataTable
                data={filteredChats}
                columns={chatColumns}
                onRowClick={handleRowClick}
                loading={isLoading}
                emptyState={{
                  title: filteredChats.length === 0 && userChats.length > 0 
                    ? "No chats match your filters" 
                    : "No chats assigned",
                  description: filteredChats.length === 0 && userChats.length > 0
                    ? "Try adjusting your search criteria or filters."
                    : "You don't have any chats assigned to you at the moment."
                }}
                selectable={false}
                searchable={false}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Chat Detail Sheet */}
      <Sheet open={!!selectedChat} onOpenChange={(open) => !open && setSelectedChat(null)}>
        <SheetContent className="w-2/3 max-w-[66vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Chat Details - {selectedChat?.requesterName}
            </SheetTitle>
          </SheetHeader>
          {selectedChat && (
            <div className="mt-6">
              <ErrorBoundary>
                <ChatPanel chat={selectedChat} />
              </ErrorBoundary>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}