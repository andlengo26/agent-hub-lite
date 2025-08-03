import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { useToast } from "@/hooks/use-toast";

export default function AIResponse() {
  const { settings, updateSettings, saveSettings, loading } = useWidgetSettings();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!settings) return;
    
    const success = await saveSettings(settings);
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to save AI response settings",
        variant: "destructive"
      });
    }
  };

  if (loading || !settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Auto AI Response</h1>
        <p className="text-muted-foreground">
          Configure automatic AI response and session management settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-response">Enable Auto Response</Label>
              <p className="text-sm text-muted-foreground">
                Automatically respond to customer inquiries
              </p>
            </div>
            <Switch 
              id="auto-response" 
              checked={settings.aiSettings.enableAIFirst}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableAIFirst: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smart-routing">Smart Routing</Label>
              <p className="text-sm text-muted-foreground">
                Route complex queries to human agents
              </p>
            </div>
            <Switch 
              id="smart-routing" 
              checked={settings.aiSettings.aiHandoffRules?.requireHumanForComplex}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { 
                  aiHandoffRules: { 
                    ...settings.aiSettings.aiHandoffRules,
                    requireHumanForComplex: checked 
                  }
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="response-delay">AI Response Wait Time (minutes)</Label>
            <Input 
              id="response-delay" 
              type="number" 
              value={settings.aiSettings.requestWaitingTime || 5}
              onChange={(e) => 
                updateSettings('aiSettings', { requestWaitingTime: parseInt(e.target.value) || 5 })
              }
              min="1" 
              max="30" 
            />
            <p className="text-xs text-muted-foreground">
              Time to wait before escalating to human agent
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="idle-timeout">Enable Idle Timeout</Label>
              <p className="text-sm text-muted-foreground">
                Automatically end conversations after inactivity
              </p>
            </div>
            <Switch 
              id="idle-timeout" 
              checked={settings.aiSettings.enableIdleTimeout}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableIdleTimeout: checked })
              }
            />
          </div>

          {settings.aiSettings.enableIdleTimeout && (
            <div className="space-y-2">
              <Label htmlFor="idle-minutes">Idle Timeout (minutes)</Label>
              <Input 
                id="idle-minutes" 
                type="number" 
                value={settings.aiSettings.idleTimeout}
                onChange={(e) => 
                  updateSettings('aiSettings', { idleTimeout: parseInt(e.target.value) || 10 })
                }
                min="1" 
                max="60" 
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="max-session">Enable Max AI Session Duration</Label>
              <p className="text-sm text-muted-foreground">
                Limit AI session length and offer human handoff
              </p>
            </div>
            <Switch 
              id="max-session" 
              checked={settings.aiSettings.enableMaxSessionLength}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableMaxSessionLength: checked })
              }
            />
          </div>

          {settings.aiSettings.enableMaxSessionLength && (
            <div className="space-y-2">
              <Label htmlFor="max-minutes">Max AI Session Duration (minutes)</Label>
              <Input 
                id="max-minutes" 
                type="number" 
                value={settings.aiSettings.maxSessionMinutes}
                onChange={(e) => 
                  updateSettings('aiSettings', { maxSessionMinutes: parseInt(e.target.value) || 30 })
                }
                min="5" 
                max="120" 
              />
              <p className="text-xs text-muted-foreground">
                AI session will end after this duration with option to talk to human
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="message-quota">Enable Message Quota</Label>
              <p className="text-sm text-muted-foreground">
                Limit number of messages per session
              </p>
            </div>
            <Switch 
              id="message-quota" 
              checked={settings.aiSettings.enableMessageQuota}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableMessageQuota: checked })
              }
            />
          </div>

          {settings.aiSettings.enableMessageQuota && (
            <div className="space-y-2">
              <Label htmlFor="max-messages">Max Messages Per Session</Label>
              <Input 
                id="max-messages" 
                type="number" 
                value={settings.aiSettings.maxMessagesPerSession}
                onChange={(e) => 
                  updateSettings('aiSettings', { maxMessagesPerSession: parseInt(e.target.value) || 20 })
                }
                min="5" 
                max="100" 
              />
            </div>
          )}

          <Button onClick={handleSave}>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}