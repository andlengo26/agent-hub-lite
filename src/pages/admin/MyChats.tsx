import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/admin/DataTable";
import { mockChats, mockUsers, Chat } from "@/lib/mock-data";
import { useChats } from "@/hooks/useApiQuery";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Skeleton } from "@/components/ui/skeleton";

const currentUserId = "2"; // Mock current user ID

const chatColumns: Column<Chat>[] = [
  { key: "requesterName", header: "Customer" },
  { key: "requesterEmail", header: "Email" },
  { key: "status", header: "Status", cell: (value) => (
    <Badge variant={value === "active" ? "default" : value === "missed" ? "destructive" : "secondary"}>
      {value}
    </Badge>
  )},
  { key: "createdAt", header: "Started" },
];

export default function MyChats() {
  const enableRealTimeUpdates = useFeatureFlag('realTime');
  const { data: chatsResponse, isLoading } = useChats();
  
  const allChats = chatsResponse?.data || mockChats;
  const myChats = allChats.filter(chat => chat.assignedAgentId === currentUserId);

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
            My Assigned Chats ({myChats.length})
            {enableRealTimeUpdates && (
              <Badge variant="outline">Live</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={myChats}
            columns={chatColumns}
          />
        </CardContent>
      </Card>
    </div>
  );
}