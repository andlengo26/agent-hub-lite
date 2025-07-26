import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function WidgetManagement() {
  const [widgetSettings, setWidgetSettings] = useState({
    primaryColor: "#0052CC",
    secondaryColor: "#17A2B8",
    highlightColor: "#FFC107",
    position: "bottom-right",
    aiName: "Assistant",
    welcomeMessage: "Hello! How can I help you today?",
    tone: "friendly",
    customPrompt: "",
    sessionTimeout: 30,
    idleTimeout: 10,
    anonymous: false,
    autoOpen: false,
    headerText: "Customer Support",
    subHeaderText: "We're here to help",
    minimizedText: "Chat with us",
    enableCalls: true,
    enableVoicemails: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Widget Management</h1>
        <p className="text-muted-foreground">
          Configure your customer support chat widget
        </p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="user-info">User Info</TabsTrigger>
          <TabsTrigger value="embed">Embed</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" placeholder="Enter your API key" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="moodle-url">Moodle URL</Label>
                <Input id="moodle-url" placeholder="https://your-moodle.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moodle-token">Moodle Token</Label>
                <Input id="moodle-token" placeholder="Enter Moodle access token" type="password" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-settings">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-name">AI Assistant Name</Label>
                <Input 
                  id="ai-name" 
                  value={widgetSettings.aiName}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, aiName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <Input 
                  id="welcome-message" 
                  value={widgetSettings.welcomeMessage}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={widgetSettings.tone} onValueChange={(value) => setWidgetSettings(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Custom Prompt</Label>
                <Textarea 
                  id="custom-prompt" 
                  placeholder="Enter custom instructions for the AI..."
                  value={widgetSettings.customPrompt}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, customPrompt: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input 
                    id="session-timeout" 
                    type="number" 
                    value={widgetSettings.sessionTimeout}
                    onChange={(e) => setWidgetSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idle-timeout">Idle Timeout (minutes)</Label>
                  <Input 
                    id="idle-timeout" 
                    type="number" 
                    value={widgetSettings.idleTimeout}
                    onChange={(e) => setWidgetSettings(prev => ({ ...prev, idleTimeout: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Widget Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="header-text">Header Text</Label>
                <Input 
                  id="header-text" 
                  value={widgetSettings.headerText}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, headerText: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subheader-text">Subheader Text</Label>
                <Input 
                  id="subheader-text" 
                  value={widgetSettings.subHeaderText}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, subHeaderText: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <Input 
                    id="primary-color" 
                    type="color" 
                    value={widgetSettings.primaryColor}
                    onChange={(e) => setWidgetSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <Input 
                    id="secondary-color" 
                    type="color" 
                    value={widgetSettings.secondaryColor}
                    onChange={(e) => setWidgetSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="highlight-color">Highlight Color</Label>
                  <Input 
                    id="highlight-color" 
                    type="color" 
                    value={widgetSettings.highlightColor}
                    onChange={(e) => setWidgetSettings(prev => ({ ...prev, highlightColor: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Button Position</Label>
                <RadioGroup 
                  value={widgetSettings.position} 
                  onValueChange={(value) => setWidgetSettings(prev => ({ ...prev, position: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-right" id="bottom-right" />
                    <Label htmlFor="bottom-right">Bottom Right</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-left" id="bottom-left" />
                    <Label htmlFor="bottom-left">Bottom Left</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimized-text">Minimized Text</Label>
                <Input 
                  id="minimized-text" 
                  value={widgetSettings.minimizedText}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, minimizedText: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-open">Auto-open Widget</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically open the chat widget for visitors
                  </p>
                </div>
                <Switch 
                  id="auto-open" 
                  checked={widgetSettings.autoOpen}
                  onCheckedChange={(checked) => setWidgetSettings(prev => ({ ...prev, autoOpen: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-info">
          <Card>
            <CardHeader>
              <CardTitle>User Information Collection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous">Anonymous Chat</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to chat without providing information
                  </p>
                </div>
                <Switch 
                  id="anonymous" 
                  checked={widgetSettings.anonymous}
                  onCheckedChange={(checked) => setWidgetSettings(prev => ({ ...prev, anonymous: checked }))}
                />
              </div>
              {!widgetSettings.anonymous && (
                <div className="space-y-2">
                  <Label>Required Fields</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="require-name" defaultChecked />
                      <Label htmlFor="require-name">Name</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="require-email" defaultChecked />
                      <Label htmlFor="require-email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="require-mobile" />
                      <Label htmlFor="require-mobile">Mobile</Label>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="embed-code">Embed Script</Label>
                <Textarea 
                  id="embed-code" 
                  readOnly
                  value={`<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://widget.example.com/chat.js';
    script.async = true;
    script.setAttribute('data-widget-id', 'your-widget-id');
    document.head.appendChild(script);
  })();
</script>`}
                  className="font-mono text-sm"
                  rows={8}
                />
              </div>
              <Button variant="outline">Copy to Clipboard</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Calls & Voicemails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-calls">Enable Voice Calls</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to make voice calls
                  </p>
                </div>
                <Switch 
                  id="enable-calls" 
                  checked={widgetSettings.enableCalls}
                  onCheckedChange={(checked) => setWidgetSettings(prev => ({ ...prev, enableCalls: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-voicemails">Enable Voicemails</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to leave voicemail messages
                  </p>
                </div>
                <Switch 
                  id="enable-voicemails" 
                  checked={widgetSettings.enableVoicemails}
                  onCheckedChange={(checked) => setWidgetSettings(prev => ({ ...prev, enableVoicemails: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Business Hours</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input id="start-time" type="time" defaultValue="09:00" />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Input id="end-time" type="time" defaultValue="17:00" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button size="lg" variant="highlight">Save All Settings</Button>
      </div>
    </div>
  );
}