import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chat } from "@/lib/mock-data";

interface ChatPanelProps {
  chat: Chat;
}

export const ChatPanel = React.memo<ChatPanelProps>(({ chat }) => {
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
      
      <div className="flex gap-2">
        {chat.status === "active" && (
          <>
            <Button variant="secondary">Escalate to Agent</Button>
            <Button variant="outline">Join Chat</Button>
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