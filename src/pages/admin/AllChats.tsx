import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DataTable, Column } from "@/components/admin/DataTable";
import { mockChats, mockUsers, Chat } from "@/lib/mock-data";
import { useChats } from "@/hooks/useApiQuery";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Phone, 
  Download, 
  Clock, 
  User, 
  Mail, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  FileText
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const chatColumns: Column<Chat>[] = [
  { 
    key: "customerName", 
    header: "Customer",
    cell: (value, row) => (
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{value.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.subject}</div>
        </div>
      </div>
    )
  },
  { 
    key: "status", 
    header: "Status", 
    cell: (value) => {
      const variants = {
        active: "default",
        missed: "destructive", 
        closed: "secondary"
      } as const;
      return (
        <Badge variant={variants[value as keyof typeof variants]}>
          {value}
        </Badge>
      );
    }
  },
  { 
    key: "priority", 
    header: "Priority", 
    cell: (value) => {
      const variants = {
        low: "secondary",
        medium: "outline",
        high: "default",
        urgent: "destructive"
      } as const;
      return (
        <Badge variant={variants[value as keyof typeof variants]}>
          {value}
        </Badge>
      );
    }
  },
  { 
    key: "assignedAgentId", 
    header: "Agent", 
    cell: (value) => {
      const agent = mockUsers.find(u => u.id === value);
      return agent ? `${agent.firstName} ${agent.lastName}` : "Unassigned";
    }
  },
  { 
    key: "messageCount", 
    header: "Messages",
    cell: (value) => <Badge variant="outline">{value}</Badge>
  },
  { 
    key: "createdAt", 
    header: "Started",
    cell: (value) => new Date(value).toLocaleString()
  },
];

function ChatPanel({ chat, onClose }: { chat: Chat; onClose: () => void }) {
  const agent = mockUsers.find(u => u.id === chat.assignedAgentId);

  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Customer Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {chat.customerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{chat.customerName}</div>
              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>{chat.customerEmail}</span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>{chat.requesterPhone}</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Browser:</span> {chat.browser}
            </div>
            <div>
              <span className="font-medium">IP:</span> {chat.ipAddress}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Page:</span> 
              <Button variant="link" size="sm" className="p-0 h-auto">
                <ExternalLink className="h-3 w-3 mr-1" />
                {chat.pageUrl}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Chat Details</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{chat.priority} priority</Badge>
              <Badge variant={chat.status === 'active' ? 'default' : chat.status === 'missed' ? 'destructive' : 'secondary'}>
                {chat.status}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-medium text-sm">Subject</div>
            <div className="text-sm text-muted-foreground">{chat.subject}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Messages:</span> {chat.messageCount}
            </div>
            <div>
              <span className="font-medium">Agent:</span> {agent?.firstName} {agent?.lastName}
            </div>
            <div>
              <span className="font-medium">Started:</span> {new Date(chat.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {new Date(chat.lastUpdatedAt).toLocaleString()}
            </div>
          </div>

          <div>
            <div className="font-medium text-sm">Last Message</div>
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
              {chat.lastMessage}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Closed Chat Extras */}
      {chat.status === 'closed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Chat Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {chat.callRecordingUrl && (
              <div>
                <div className="font-medium text-sm mb-2">Call Recording</div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Recording
                </Button>
              </div>
            )}
            
            {chat.uploadedFiles && chat.uploadedFiles.length > 0 && (
              <div>
                <div className="font-medium text-sm mb-2">Uploaded Files</div>
                <div className="space-y-2">
                  {chat.uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {(file.size / 1024).toFixed(1)}KB
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat Transcript */}
      {chat.transcript && chat.transcript.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Chat Transcript</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {chat.transcript.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'agent' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="text-sm">{message.message}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AllChats() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  
  const enableRealTimeUpdates = useFeatureFlag('realTime');
  const { data: chatsResponse, isLoading, error, refetch } = useChats({
    page: 1,
    limit: 50,
    status: activeTab === "all" ? undefined : activeTab as any
  });

  const chats = chatsResponse?.data || mockChats;

  const filterChats = (status?: string) => {
    if (!status || status === "all") return chats;
    return chats.filter(chat => chat.status === status);
  };

  const getChatCounts = () => ({
    all: chats.length,
    active: chats.filter(c => c.status === 'active').length,
    missed: chats.filter(c => c.status === 'missed').length,
    closed: chats.filter(c => c.status === 'closed').length,
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Chat data has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh chat data",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Chats</h1>
          <p className="text-muted-foreground">
            View and manage all customer chat conversations
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Chats</h3>
            <p className="text-muted-foreground text-center mb-4">
              There was a problem loading the chat data. Please try again.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const counts = getChatCounts();
  const filteredChats = filterChats(activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Chats</h1>
          <p className="text-muted-foreground">
            View and manage all customer chat conversations
            {enableRealTimeUpdates && (
              <Badge variant="outline" className="ml-2">
                Live
              </Badge>
            )}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="relative">
            All Chats
            <Badge variant="secondary" className="ml-2">
              {counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="relative">
            Active
            <Badge variant="default" className="ml-2">
              {counts.active}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="missed" className="relative">
            Missed
            <Badge variant="destructive" className="ml-2">
              {counts.missed}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="closed" className="relative">
            Closed
            <Badge variant="secondary" className="ml-2">
              {counts.closed}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{activeTab === 'all' ? 'All' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Chats ({filteredChats.length})</span>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredChats}
                columns={chatColumns}
                onRowClick={(chat) => setSelectedChat(chat)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedChat} onOpenChange={() => setSelectedChat(null)}>
        <SheetContent className="w-[600px] sm:w-[800px]">
          <SheetHeader>
            <SheetTitle>
              Chat Details - {selectedChat?.customerName}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {selectedChat && (
              <ChatPanel 
                chat={selectedChat} 
                onClose={() => setSelectedChat(null)} 
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}