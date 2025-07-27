import React, { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chat, mockUsers } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Clock, 
  User, 
  Bot, 
  MessageSquare,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface ChatPanelProps {
  chat: Chat;
}

export const ChatPanel = memo<ChatPanelProps>(({ chat }) => {
  console.log('ChatPanel: Rendering chat panel', { chatId: chat.id, status: chat.status, assignedAgent: chat.assignedAgentId });
  
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(chat.assignedAgentId || "unassigned");

  const assignedAgent = mockUsers.find(u => u.id === chat.assignedAgentId);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Message sent",
        description: "Your message has been sent to the customer"
      });
      setMessage("");
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Retry successful",
        description: "Connection restored"
      });
    } catch (error) {
      toast({
        title: "Retry failed",
        description: "Please check your connection",
        variant: "destructive"
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleAgentChange = async (agentId: string) => {
    try {
      console.log('ChatPanel: Assigning agent', { agentId, chatId: chat.id });
      setSelectedAgentId(agentId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (agentId === "unassigned") {
        toast({
          title: "Agent unassigned",
          description: "Chat is now unassigned"
        });
      } else {
        const agent = mockUsers.find(u => u.id === agentId);
        toast({
          title: "Agent assigned",
          description: `Chat assigned to ${agent?.firstName} ${agent?.lastName}`
        });
      }
    } catch (error) {
      console.error('ChatPanel: Failed to assign agent', error);
      toast({
        title: "Failed to assign agent",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="font-medium">{chat.requesterName}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{chat.requesterEmail}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{chat.requesterPhone}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{chat.geo}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">IP Address</div>
                  <div className="font-medium">{chat.ipAddress}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Started</div>
                  <div className="font-medium">{new Date(chat.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={chat.status === "active" ? "default" : chat.status === "missed" ? "destructive" : "secondary"}>
                {chat.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Assigned Agent:</span>
              <Select value={selectedAgentId} onValueChange={handleAgentChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-md z-50">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {mockUsers.filter(user => user.role === 'agent').map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.avatar || user.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.firstName} {user.lastName}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed">{chat.summary}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                Auto-generated summary
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Chat Transcript */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {chat.requesterName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{chat.requesterName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(chat.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-muted p-3 rounded-lg max-w-xs ml-8">
                  <p className="text-sm">
                    Hi, I'm having trouble with my account login. Can you help me?
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-1 items-end">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(Date.now() - 600000).toLocaleTimeString()}
                  </span>
                  <span className="text-sm font-medium">
                    {assignedAgent ? `${assignedAgent.firstName} ${assignedAgent.lastName}` : "Agent"}
                  </span>
                  {assignedAgent && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={assignedAgent.avatar || assignedAgent.avatarUrl} />
                      <AvatarFallback>
                        {assignedAgent.firstName[0]}{assignedAgent.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs mr-8">
                  <p className="text-sm">
                    Hello! I'd be happy to help you with your login issue. Can you tell me what specific error you're seeing?
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {chat.requesterName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{chat.requesterName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(Date.now() - 300000).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-muted p-3 rounded-lg max-w-xs ml-8">
                  <p className="text-sm">
                    It says "Invalid credentials" but I'm sure my password is correct.
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-1 items-end">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(Date.now() - 120000).toLocaleTimeString()}
                  </span>
                  <span className="text-sm font-medium">
                    {assignedAgent ? `${assignedAgent.firstName} ${assignedAgent.lastName}` : "Agent"}
                  </span>
                  {assignedAgent && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={assignedAgent.avatar || assignedAgent.avatarUrl} />
                      <AvatarFallback>
                        {assignedAgent.firstName[0]}{assignedAgent.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs mr-8">
                  <p className="text-sm">
                    Let me help you reset your password. I'll send you a secure reset link to your email address.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="bg-muted/50 px-3 py-1 rounded-full">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {chat.status === "active" ? "Chat is ongoing" : "Chat ended"}
                  </span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      {/* Chat Input Box */}
      {chat.status === "active" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Send Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              disabled={isSending}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !message.trim()}
                size="sm"
                className="flex-1"
              >
                {isSending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional sections for closed chats */}
      {chat.status === "closed" && (
        <>
          <Separator />
          
          {/* Call Recordings Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Call Recordings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Recording_2025-01-26_10:30.mp3</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Play
                    </Button>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Duration: 4:32</p>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">account_screenshot.png</span>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">support_document.pdf</span>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex gap-2 pt-4 border-t">
        {chat.status === "active" && (
          <>
            <Button variant="secondary">Escalate to Agent</Button>
            <Button variant="outline">Join Chat</Button>
            <Button 
              variant="outline" 
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? "Retrying..." : "Retry Connection"}
            </Button>
          </>
        )}
        {chat.status === "missed" && (
          <>
            <Button variant="secondary">Reply via Email</Button>
            <Button variant="outline">Schedule Callback</Button>
          </>
        )}
        {chat.status === "closed" && (
          <>
            <Button variant="outline">Export Transcript</Button>
            <Button variant="outline">Reopen Chat</Button>
          </>
        )}
      </div>
    </div>
  );
});

ChatPanel.displayName = "ChatPanel";