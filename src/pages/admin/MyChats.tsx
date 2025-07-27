import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedDataTable } from "@/components/common/EnhancedDataTable";
import { mockChats, mockUsers, Chat } from "@/lib/mock-data";
import { useChats } from "@/hooks/useApiQuery";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

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
    key: "status", 
    header: "Status",
    cell: (chat: Chat) => (
      <Badge variant={chat.status === "active" ? "default" : chat.status === "missed" ? "destructive" : "secondary"}>
        {chat.status}
      </Badge>
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
  const enableRealTimeUpdates = useFeatureFlag('realTime');
  const { data: chatsResponse, isLoading } = useChats();
  
  const allChats = chatsResponse?.data || mockChats;
  const userChats = allChats.filter(chat => chat.assignedAgentId === currentUserId);

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            My Assigned Chats ({userChats.length})
            {enableRealTimeUpdates && (
              <Badge variant="outline">Live</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedDataTable
            data={userChats}
            columns={chatColumns}
            loading={isLoading}
            emptyState={{
              title: "No chats assigned",
              description: "You don't have any chats assigned to you at the moment."
            }}
            selectable={false}
            searchable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}