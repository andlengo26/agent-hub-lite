/**
 * Enhanced Widget Management Settings Page
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorPicker } from '@/components/ui/color-picker';
import { InteractiveWidget } from '@/components/admin/InteractiveWidget';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { useToast } from '@/hooks/use-toast';
import { Copy, Eye, EyeOff, Check, Loader2, MessageCircle } from 'lucide-react';

export default function WidgetManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const { settings, loading, saving, saveSettings, updateSettings } = useWidgetSettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'integrations');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['integrations', 'ai', 'appearance', 'userinfo', 'embed', 'voice'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleCopyEmbed = () => {
    if (settings?.embed?.script) {
      navigator.clipboard.writeText(settings.embed.script);
      setCopied(true);
      toast({
        title: "Success",
        description: "Embed code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveAllSettings = async () => {
    if (!settings) return;
    await saveSettings(settings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load widget settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Widget Management</h1>
        <p className="text-muted-foreground">
          Configure your customer support widget settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Widget Configuration</CardTitle>
          <CardDescription>
            Customize your widget's behavior, appearance, and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="ai">AI Settings</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="userinfo">User Info</TabsTrigger>
              <TabsTrigger value="embed">Embed</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
            </TabsList>

            <TabsContent value="integrations" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">API Key *</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        id="apiKey"
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.integrations.apiKey}
                        onChange={(e) => updateSettings('integrations', { apiKey: e.target.value })}
                        placeholder="Enter your API key"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="aiModel">AI Model</Label>
                  <Select 
                    value={settings.integrations.aiModel} 
                    onValueChange={(value) => updateSettings('integrations', { aiModel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                      <SelectItem value="claude-2">Claude 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="moodleUrl">Moodle URL (Optional)</Label>
                  <Input
                    id="moodleUrl"
                    type="url"
                    value={settings.integrations.moodle?.moodleUrl || ''}
                    onChange={(e) => updateSettings('integrations', { 
                      moodle: { ...settings.integrations.moodle, moodleUrl: e.target.value }
                    })}
                    placeholder="https://your-moodle.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="moodleToken">Moodle Token (Optional)</Label>
                  <Input
                    id="moodleToken"
                    value={settings.integrations.moodle?.apiToken || ''}
                    onChange={(e) => updateSettings('integrations', { 
                      moodle: { ...settings.integrations.moodle, apiToken: e.target.value }
                    })}
                    placeholder="Enter Moodle integration token"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="headerText">Header Text</Label>
                  <Input
                    id="headerText"
                    value={settings.appearance.headerText}
                    onChange={(e) => updateSettings('appearance', { headerText: e.target.value })}
                    placeholder="Customer Support"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subheaderText">Subheader Text (Optional)</Label>
                  <Input
                    id="subheaderText"
                    value={settings.appearance.subheaderText}
                    onChange={(e) => updateSettings('appearance', { subheaderText: e.target.value })}
                    placeholder="We're here to help"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ColorPicker
                    label="Primary Color"
                    value={settings.appearance.primaryColor}
                    onChange={(color) => updateSettings('appearance', { primaryColor: color })}
                  />
                  <ColorPicker
                    label="Secondary Color"
                    value={settings.appearance.secondaryColor}
                    onChange={(color) => updateSettings('appearance', { secondaryColor: color })}
                  />
                  <ColorPicker
                    label="Highlight Color"
                    value={settings.appearance.highlightColor}
                    onChange={(color) => updateSettings('appearance', { highlightColor: color })}
                  />
                </div>
                
                <div>
                  <Label>Button Position</Label>
                  <RadioGroup
                    value={settings.appearance.buttonPosition}
                    onValueChange={(value) => updateSettings('appearance', { buttonPosition: value })}
                    className="grid grid-cols-2 gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bottom-right" id="bottom-right" />
                      <Label htmlFor="bottom-right">Bottom Right</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bottom-left" id="bottom-left" />
                      <Label htmlFor="bottom-left">Bottom Left</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="top-right" id="top-right" />
                      <Label htmlFor="top-right">Top Right</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="top-left" id="top-left" />
                      <Label htmlFor="top-left">Top Left</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label htmlFor="minimizedText">Minimized Button Text</Label>
                  <Input
                    id="minimizedText"
                    value={settings.appearance.minimizedText}
                    onChange={(e) => updateSettings('appearance', { minimizedText: e.target.value })}
                    placeholder="Need help?"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paddingX">Horizontal Padding (px)</Label>
                    <Input
                      id="paddingX"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.appearance.paddingX}
                      onChange={(e) => updateSettings('appearance', { paddingX: parseInt(e.target.value) || 24 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paddingY">Vertical Padding (px)</Label>
                    <Input
                      id="paddingY"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.appearance.paddingY}
                      onChange={(e) => updateSettings('appearance', { paddingY: parseInt(e.target.value) || 24 })}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoOpenWidget"
                    checked={settings.appearance.autoOpenWidget}
                    onCheckedChange={(checked) => updateSettings('appearance', { autoOpenWidget: checked })}
                  />
                  <Label htmlFor="autoOpenWidget">Auto-open widget for new visitors</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="userinfo" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymousChat"
                    checked={settings.userInfo.anonymousChat}
                    onCheckedChange={(checked) => updateSettings('userInfo', { anonymousChat: checked })}
                  />
                  <Label htmlFor="anonymousChat">Allow anonymous chat</Label>
                </div>
                
                {!settings.userInfo.anonymousChat && (
                  <div>
                    <Label>Required User Information</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requiredName"
                          checked={settings.userInfo.requiredFields.name}
                          onCheckedChange={(checked) => updateSettings('userInfo', { 
                            requiredFields: { ...settings.userInfo.requiredFields, name: !!checked }
                          })}
                        />
                        <Label htmlFor="requiredName">Name</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requiredEmail"
                          checked={settings.userInfo.requiredFields.email}
                          onCheckedChange={(checked) => updateSettings('userInfo', { 
                            requiredFields: { ...settings.userInfo.requiredFields, email: !!checked }
                          })}
                        />
                        <Label htmlFor="requiredEmail">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requiredMobile"
                          checked={settings.userInfo.requiredFields.mobile}
                          onCheckedChange={(checked) => updateSettings('userInfo', { 
                            requiredFields: { ...settings.userInfo.requiredFields, mobile: !!checked }
                          })}
                        />
                         <Label htmlFor="requiredMobile">Mobile Number</Label>
                       </div>
                     </div>
                   </div>
                 )}

                 {!settings.userInfo.anonymousChat && (
                   <div className="space-y-4 border-t pt-4">
                     <h4 className="text-sm font-medium">User Identification Settings</h4>
                     
                     <div className="flex items-center space-x-2">
                       <Switch
                         id="enableUserIdentification"
                         checked={settings.userInfo.enableUserIdentification !== false}
                         onCheckedChange={(checked) => updateSettings('userInfo', { 
                           enableUserIdentification: checked 
                         })}
                       />
                       <Label htmlFor="enableUserIdentification">Enable user identification system</Label>
                     </div>

                      {settings.userInfo.enableUserIdentification !== false && (
                        <div className="space-y-4">
                          <div>
                            <Label>Available Identification Methods</Label>
                            <div className="space-y-3 mt-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="enableManualForm"
                                  checked={settings.userInfo.enableManualForm !== false}
                                  onCheckedChange={(checked) => updateSettings('userInfo', { 
                                    enableManualForm: !!checked 
                                  })}
                                />
                                <Label htmlFor="enableManualForm">Manual Form Submission</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="enableMoodleAuth"
                                  checked={settings.userInfo.enableMoodleAuth || false}
                                  onCheckedChange={(checked) => updateSettings('userInfo', { 
                                    enableMoodleAuth: !!checked 
                                  })}
                                />
                                <Label htmlFor="enableMoodleAuth">Moodle Authentication</Label>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {settings.embed.moodleChatPluginIntegration 
                                ? "When Moodle Chat Plugin integration is enabled, Moodle authentication takes priority when available."
                                : "Users can choose from available identification methods."
                              }
                            </p>
                          </div>

                         <div>
                           <Label htmlFor="sessionDurationHours">Session Duration (hours)</Label>
                           <Input
                             id="sessionDurationHours"
                             type="number"
                             min="1"
                             max="168"
                             value={settings.userInfo.sessionDurationHours || 24}
                             onChange={(e) => updateSettings('userInfo', { 
                               sessionDurationHours: parseInt(e.target.value) || 24 
                             })}
                             placeholder="24"
                           />
                           <p className="text-xs text-muted-foreground mt-1">
                             How long user identification remains valid (1-168 hours).
                           </p>
                         </div>
                       </div>
                     )}
                   </div>
                 )}
                 
               </div>
             </TabsContent>

            <TabsContent value="embed" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="moodleChatPluginIntegration"
                    checked={settings.embed.moodleChatPluginIntegration || false}
                    onCheckedChange={(checked) => updateSettings('embed', { moodleChatPluginIntegration: checked })}
                  />
                  <Label htmlFor="moodleChatPluginIntegration">Integrate with Moodle Chat Plugin</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, the widget will prioritize Moodle authentication and seamlessly integrate with the Moodle chat plugin workflow.
                </p>
                
                <div>
                  <Label htmlFor="embedScript">Embed Code</Label>
                  <div className="relative">
                    <Textarea
                      id="embedScript"
                      value={settings.embed.script}
                      readOnly
                      rows={8}
                      className="font-mono text-sm bg-muted"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyEmbed}
                      className="absolute top-2 right-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableVoiceCalls"
                    checked={settings.voice.enableVoiceCalls}
                    onCheckedChange={(checked) => updateSettings('voice', { enableVoiceCalls: checked })}
                  />
                  <Label htmlFor="enableVoiceCalls">Enable voice calls</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableVoicemails"
                    checked={settings.voice.enableVoicemails}
                    onCheckedChange={(checked) => updateSettings('voice', { enableVoicemails: checked })}
                  />
                  <Label htmlFor="enableVoicemails">Enable voicemails</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Business Hours Start</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={settings.voice.businessHours.start}
                      onChange={(e) => updateSettings('voice', { 
                        businessHours: { ...settings.voice.businessHours, start: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">Business Hours End</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={settings.voice.businessHours.end}
                      onChange={(e) => updateSettings('voice', { 
                        businessHours: { ...settings.voice.businessHours, end: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-6 border-t">
            <Button 
              onClick={handleSaveAllSettings} 
              className="w-full"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save All Settings'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Interactive Widget */}
      <InteractiveWidget />
    </div>
  );
}