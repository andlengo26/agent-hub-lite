import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DataTable, Column } from "@/components/admin/DataTable";
import { mockChats, mockUsers, Chat } from "@/lib/mock-data";

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

  const filterChats = (status?: string) => {
    if (!status || status === "all") return mockChats;
    return mockChats.filter(chat => chat.status === status);
  };

  const ChatPanel = ({ chat }: { chat: Chat }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Customer</p>
          <p className="text-sm text-muted-foreground">{chat.requesterName}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Email</p>
          <p className="text-sm text-muted-foreground">{chat.requesterEmail}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Phone</p>
          <p className="text-sm text-muted-foreground">{chat.requesterPhone}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Browser</p>
          <p className="text-sm text-muted-foreground">{chat.browser}</p>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 min-h-[300px]">
        <h4 className="font-medium mb-3">Chat Transcript</h4>
        <div className="space-y-3 text-sm">
          <div className="bg-muted p-3 rounded-lg">
            <p><strong>Customer:</strong> Hi, I need help with my account settings.</p>
            <span className="text-xs text-muted-foreground">10:30 AM</span>
          </div>
          <div className="bg-primary/10 p-3 rounded-lg ml-4">
            <p><strong>AI Agent:</strong> I'd be happy to help you with your account settings. What specific setting would you like to modify?</p>
            <span className="text-xs text-muted-foreground">10:31 AM</span>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p><strong>Customer:</strong> I want to change my email address.</p>
            <span className="text-xs text-muted-foreground">10:32 AM</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        {chat.status === "active" && (
          <Button variant="highlight">Escalate to Agent</Button>
        )}
        {chat.status === "missed" && (
          <Button variant="outline">Reply via Email</Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Chats</h1>
        <p className="text-muted-foreground">
          Monitor and manage all customer chat interactions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Chats ({mockChats.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({filterChats("active").length})</TabsTrigger>
          <TabsTrigger value="missed">Missed ({filterChats("missed").length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({filterChats("closed").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={mockChats}
                columns={chatColumns}
                onRowClick={setSelectedChat}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Chats</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filterChats("active")}
                columns={chatColumns}
                onRowClick={setSelectedChat}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missed">
          <Card>
            <CardHeader>
              <CardTitle>Missed Chats</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filterChats("missed")}
                columns={chatColumns}
                onRowClick={setSelectedChat}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closed">
          <Card>
            <CardHeader>
              <CardTitle>Closed Chats</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filterChats("closed")}
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
          {selectedChat && <ChatPanel chat={selectedChat} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}