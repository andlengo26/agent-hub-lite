/**
 * Refactored Widget Management Settings Page
 * Split into modular components for better maintainability
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { InteractiveWidget } from '@/components/admin/InteractiveWidget';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Loader2 } from 'lucide-react';
import { IntegrationsTab, AISettingsTab, AppearanceTab, UserInfoTab } from '@/components/admin/settings';

export default function WidgetManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const { settings, loading, saving, saveSettings, updateSettings } = useWidgetSettings();
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
              <IntegrationsTab settings={settings} updateSettings={updateSettings} />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <AISettingsTab settings={settings} updateSettings={updateSettings} />
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <AppearanceTab settings={settings} updateSettings={updateSettings} />
            </TabsContent>

            <TabsContent value="userinfo" className="space-y-4">
              <UserInfoTab settings={settings} updateSettings={updateSettings} />
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