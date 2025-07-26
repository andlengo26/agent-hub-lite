import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ChatPanel } from "@/components/admin/ChatPanel";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { mockChats, mockUsers, Chat } from "@/lib/mock-data";
import { useChats } from "@/hooks/useApiQuery";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const chatColumns: Column<Chat>[] = [
  { key: "requesterName", header: "Customer" },
  { key: "requesterEmail", header: "Email" },
  { key: "status", header: "Status", cell: (value) => (
    <Badge variant={value === "active" ? "default" : value === "missed" ? "destructive" : "secondary"}>
      {value}
    </Badge>
  )},
  { key: "assignedAgentId", header: "Agent", cell: (value) => {
    const agent = mockUsers.find(u => u.id === value);
    return agent ? `${agent.firstName} ${agent.lastName}` : "Unassigned";
  }},
  { key: "createdAt", header: "Started" },
];

export default function AllChats() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const enableRealTimeUpdates = useFeatureFlag('realTime');
  const { data: chatsResponse, isLoading, error, isRefetching } = useChats({
    page: 1,
    limit: 50,
    status: activeTab === "all" ? undefined : activeTab as any
  });

  const chats = chatsResponse?.data || mockChats;

  // Memoized filtered chats for performance
  const filteredChats = useMemo(() => {
    const filterChats = (status?: string) => {
      if (!status || status === "all") return chats;
      return chats.filter(chat => chat.status === status);
    };
    return filterChats(activeTab);
  }, [chats, activeTab]);

  // Memoized status counts
  const statusCounts = useMemo(() => ({
    all: chats.length,
    active: chats.filter(chat => chat.status === "active").length,
    missed: chats.filter(chat => chat.status === "missed").length,
    closed: chats.filter(chat => chat.status === "closed").length
  }), [chats]);

  // Show refetch toast for real-time updates
  useEffect(() => {
    if (isRefetching && enableRealTimeUpdates) {
      toast({
        title: "Updating chats...",
        description: "Fetching latest chat data",
      });
    }
  }, [isRefetching, enableRealTimeUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setSelectedChat(null);
    };
  }, []);

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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">All Chats</h1>
          <p className="text-muted-foreground">
            Monitor and manage all customer chat interactions
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Failed to load chats. Using offline data.</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
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
                <DataTable
                  data={filteredChats}
                  columns={chatColumns}
                  onRowClick={setSelectedChat}
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