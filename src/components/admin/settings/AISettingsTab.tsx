/**
 * AI Settings tab component
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle } from 'lucide-react';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface AISettingsTabProps {
  settings: WidgetSettings;
  updateSettings: (section: keyof WidgetSettings, updates: any) => void;
}

export function AISettingsTab({ settings, updateSettings }: AISettingsTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="assistantName">Assistant Name</Label>
        <Input
          id="assistantName"
          value={settings.aiSettings.assistantName}
          onChange={(e) => updateSettings('aiSettings', { assistantName: e.target.value })}
          placeholder="Support Assistant"
        />
      </div>
      
      <div>
        <Label htmlFor="welcomeMessage">Welcome Message</Label>
        <Textarea
          id="welcomeMessage"
          value={settings.aiSettings.welcomeMessage}
          onChange={(e) => updateSettings('aiSettings', { welcomeMessage: e.target.value })}
          placeholder="Hello! How can I help you today?"
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="tone">Conversation Tone</Label>
        <Select 
          value={settings.aiSettings.tone} 
          onValueChange={(value) => updateSettings('aiSettings', { tone: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="customPrompt">Custom AI Prompt (Optional)</Label>
        <Textarea
          id="customPrompt"
          value={settings.aiSettings.customPrompt}
          onChange={(e) => updateSettings('aiSettings', { customPrompt: e.target.value })}
          placeholder="Add custom instructions for the AI assistant..."
          rows={4}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
          <Input
            id="sessionTimeout"
            type="number"
            min="5"
            max="120"
            value={settings.aiSettings.sessionTimeout}
            onChange={(e) => updateSettings('aiSettings', { sessionTimeout: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="requestWaitingTime">AI Response Wait Time (minutes)</Label>
          <Input
            id="requestWaitingTime"
            type="number"
            min="1"
            max="30"
            value={settings.aiSettings.requestWaitingTime}
            onChange={(e) => updateSettings('aiSettings', { requestWaitingTime: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Advanced AI management settings are available in <strong>AI Response Settings</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}