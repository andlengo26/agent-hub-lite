import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EnhancedTable, Column } from "@/components/admin/EnhancedTable";
import { ChatPanel } from "@/components/admin/ChatPanel";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { mockChats, mockUsers, Chat } from "@/lib/mock-data";
import { useChats } from "@/hooks/useApiQuery";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { performanceMonitor } from "@/lib/performance-monitor";

const chatColumns: Column<Chat>[] = [
  { key: "requesterName", label: "Customer" },
  { key: "requesterEmail", label: "Email" },
  { key: "status", label: "Status", cell: (value) => (
    <Badge variant={value === "active" ? "default" : value === "missed" ? "destructive" : "secondary"}>
      {value}
    </Badge>
  )},
  { key: "assignedAgentId", label: "Agent", cell: (value) => {
    const agent = mockUsers.find(u => u.id === value);
    return agent ? `${agent.firstName} ${agent.lastName}` : "Unassigned";
  }},
  { key: "createdAt", label: "Started" },
];

export default function AllChats() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  // Performance monitoring - always call
  performanceMonitor.startTiming('chatLoadTime');
  
  // Feature flags and API calls - always call
  const enableRealTimeUpdates = useFeatureFlag('realTime');
  const { data: chatsResponse, isLoading, error, isRefetching } = useChats({
    page: 1,
    limit: 50,
  });

  // Data processing - always call
  const chats = chatsResponse?.data || mockChats;

  // Memoized filtered chats for performance - always call
  const filteredChats = useMemo(() => {
    performanceMonitor.startTiming('filterTime');
    const result = (() => {
      const filterChats = (status?: string) => {
        if (!status || status === "all") return chats;
        return chats.filter(chat => chat.status === status);
      };
      return filterChats(activeTab);
    })();
    performanceMonitor.endTiming('filterTime');
    return result;
  }, [chats, activeTab]);

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


  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">All Chats</h1>
          <p className="text-muted-foreground">
            Monitor and manage all customer chat interactions
          </p>
        </div>

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
                <CardTitle>
                  {activeTab === "all" ? "All Conversations" : 
                   activeTab === "active" ? "Active Chats" :
                   activeTab === "missed" ? "Missed Chats" : "Closed Chats"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedTable
                  data={filteredChats}
                  columns={chatColumns}
                  onRowClick={setSelectedChat}
                  loading={isLoading}
                  error={error?.message}
                  showActions={true}
                  onEmailReply={async (chat) => {
                    toast({
                      title: "Email Reply",
                      description: `Preparing email reply for ${chat.requesterName}`,
                    });
                  }}
                  onArchive={async (chats) => {
                    console.log('Archiving chats:', chats);
                  }}
                  onExport={async (chats) => {
                    console.log('Exporting chats:', chats);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Sheet open={!!selectedChat} onOpenChange={() => setSelectedChat(null)}>
          <SheetContent className="w-[600px] sm:w-[600px]">
            <SheetHeader>
              <SheetTitle>Chat Details</SheetTitle>
            </SheetHeader>
            {selectedChat && <ChatPanel key={selectedChat.id} chat={selectedChat} />}
          </SheetContent>
        </Sheet>
      </div>
    </ErrorBoundary>
  );
}