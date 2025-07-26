import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/admin/DataTable";
import { mockChats, mockUsers, Chat } from "@/lib/mock-data";

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
  const myChats = mockChats.filter(chat => chat.assignedAgentId === currentUserId);

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
          <CardTitle>My Assigned Chats ({myChats.length})</CardTitle>
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