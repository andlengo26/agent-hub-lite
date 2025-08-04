/**
 * Setup & Integration Settings Tab
 * Consolidates API keys, AI model selection, and Moodle integration
 */

import { useState } from 'react';
import { WidgetSettings } from '@/hooks/useWidgetSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface SetupIntegrationTabProps {
  settings: WidgetSettings;
  updateSettings: (section: keyof WidgetSettings, updates: any) => void;
}

export function SetupIntegrationTab({ settings, updateSettings }: SetupIntegrationTabProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Configure your AI service connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={settings?.integrations?.apiKey || ''}
                onChange={(e) => updateSettings('integrations', { apiKey: e.target.value })}
                placeholder="Enter your API key"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aiModel">AI Model</Label>
            <Select
              value={settings?.integrations?.aiModel || ''}
              onValueChange={(value) => updateSettings('integrations', { aiModel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3">Claude-3</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Moodle Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Moodle Integration</CardTitle>
          <CardDescription>Connect with your Moodle instance for enhanced features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Moodle Integration</Label>
              <p className="text-sm text-muted-foreground">Allow users to authenticate via Moodle</p>
            </div>
            <Switch
              checked={settings?.integrations?.moodle?.enabled || false}
              onCheckedChange={(checked) => 
                updateSettings('integrations', { 
                  moodle: { ...settings?.integrations?.moodle, enabled: checked }
                })
              }
            />
          </div>

          {settings?.integrations?.moodle?.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="moodleUrl">Moodle URL</Label>
                <Input
                  id="moodleUrl"
                  value={settings?.integrations?.moodle?.moodleUrl || ''}
                  onChange={(e) => 
                    updateSettings('integrations', {
                      moodle: { ...settings?.integrations?.moodle, moodleUrl: e.target.value }
                    })
                  }
                  placeholder="https://your-moodle-site.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moodleToken">Moodle API Token</Label>
                <Input
                  id="moodleToken"
                  type="password"
                  value={settings?.integrations?.moodle?.apiToken || ''}
                  onChange={(e) => 
                    updateSettings('integrations', {
                      moodle: { ...settings?.integrations?.moodle, apiToken: e.target.value }
                    })
                  }
                  placeholder="Enter Moodle API token"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-login for Moodle Users</Label>
                  <p className="text-sm text-muted-foreground">Automatically sign in users already logged into Moodle</p>
                </div>
                <Switch
                  checked={settings?.integrations?.moodle?.autoLogin || false}
                  onCheckedChange={(checked) => 
                    updateSettings('integrations', {
                      moodle: { ...settings?.integrations?.moodle, autoLogin: checked }
                    })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Chat Plugin Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Chat Plugin Integration</CardTitle>
          <CardDescription>Enable seamless integration with Moodle chat plugin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Moodle Chat Plugin Integration</Label>
              <p className="text-sm text-muted-foreground">Direct integration with Moodle's native chat functionality</p>
            </div>
            <Switch
              checked={settings?.embed?.moodleChatPluginIntegration || false}
              onCheckedChange={(checked) => 
                updateSettings('embed', { moodleChatPluginIntegration: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}