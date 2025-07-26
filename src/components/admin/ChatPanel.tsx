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
          <Button variant="secondary">Escalate to Agent</Button>
        )}
        {chat.status === "missed" && (
          <Button variant="outline">Reply via Email</Button>
        )}
      </div>
    </div>
  );
});

ChatPanel.displayName = "ChatPanel";