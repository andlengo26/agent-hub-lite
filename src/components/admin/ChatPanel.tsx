import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Paperclip, Loader2, Play, Download } from "lucide-react";
import { Chat } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

interface ChatPanelProps {
  chat: Chat;
}

export const ChatPanel = React.memo<ChatPanelProps>(({ chat }) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

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

  return (
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
          <div key="msg-1" className="bg-muted p-3 rounded-lg">
            <p><strong>Customer:</strong> Hi, I need help with my account settings.</p>
            <span className="text-xs text-muted-foreground">10:30 AM</span>
          </div>
          <div key="msg-2" className="bg-primary/10 p-3 rounded-lg ml-4">
            <p><strong>AI Agent:</strong> I'd be happy to help you with your account settings. What specific setting would you like to modify?</p>
            <span className="text-xs text-muted-foreground">10:31 AM</span>
          </div>
          <div key="msg-3" className="bg-muted p-3 rounded-lg">
            <p><strong>Customer:</strong> I want to change my email address.</p>
            <span className="text-xs text-muted-foreground">10:32 AM</span>
          </div>
          <div key="msg-4" className="bg-primary/10 p-3 rounded-lg ml-4">
            <p><strong>AI Agent:</strong> I can help you update your email address. For security reasons, I'll need to verify your current information first. Can you please confirm your current email address?</p>
            <span className="text-xs text-muted-foreground">10:33 AM</span>
          </div>
          <div key="msg-5" className="bg-muted p-3 rounded-lg">
            <p><strong>Customer:</strong> Sure, it's {chat.requesterEmail}</p>
            <span className="text-xs text-muted-foreground">10:34 AM</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium">Browser Info</p>
          <p className="text-muted-foreground">{chat.browser}</p>
        </div>
        <div>
          <p className="font-medium">Page URL</p>
          <p className="text-muted-foreground truncate">{chat.pageUrl}</p>
        </div>
        <div>
          <p className="font-medium">IP Address</p>
          <p className="text-muted-foreground">{chat.ipAddress}</p>
        </div>
        <div>
          <p className="font-medium">Chat Duration</p>
          <p className="text-muted-foreground">4 minutes</p>
        </div>
      </div>
      
      {/* Chat Input Box */}
      {chat.status === "active" && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <h4 className="font-medium mb-3">Send Message</h4>
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim()}
              size="sm"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" disabled={isSending}>
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Attachments: Images, PDFs, Documents (placeholder)
          </p>
        </div>
      )}

      {/* Additional sections for closed chats */}
      {chat.status === "closed" && (
        <div className="space-y-4">
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
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
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
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">support_document.pdf</span>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-2">
        {chat.status === "active" && (
          <>
            <Button variant="secondary">Escalate to Agent</Button>
            <Button variant="outline">Join Chat</Button>
            <Button 
              variant="outline" 
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Retrying...
                </>
              ) : (
                "Retry Connection"
              )}
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