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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily & Hourly Quotas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="daily-quota">Enable Daily Message Quota</Label>
              <p className="text-sm text-muted-foreground">
                Limit total messages per day across all sessions
              </p>
            </div>
            <Switch 
              id="daily-quota" 
              checked={settings.aiSettings.enableDailyQuota}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableDailyQuota: checked })
              }
            />
          </div>

          {settings.aiSettings.enableDailyQuota && (
            <div className="space-y-2">
              <Label htmlFor="max-daily">Max Daily Messages</Label>
              <Input 
                id="max-daily" 
                type="number" 
                value={settings.aiSettings.maxDailyMessages}
                onChange={(e) => 
                  updateSettings('aiSettings', { maxDailyMessages: parseInt(e.target.value) || 50 })
                }
                min="10" 
                max="1000" 
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hourly-quota">Enable Hourly Message Quota</Label>
              <p className="text-sm text-muted-foreground">
                Limit messages per hour for rate limiting
              </p>
            </div>
            <Switch 
              id="hourly-quota" 
              checked={settings.aiSettings.enableHourlyQuota}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableHourlyQuota: checked })
              }
            />
          </div>

          {settings.aiSettings.enableHourlyQuota && (
            <div className="space-y-2">
              <Label htmlFor="max-hourly">Max Hourly Messages</Label>
              <Input 
                id="max-hourly" 
                type="number" 
                value={settings.aiSettings.maxHourlyMessages}
                onChange={(e) => 
                  updateSettings('aiSettings', { maxHourlyMessages: parseInt(e.target.value) || 10 })
                }
                min="5" 
                max="100" 
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quota-warning">Quota Warning Threshold</Label>
            <Input 
              id="quota-warning" 
              type="number" 
              value={settings.aiSettings.quotaWarningThreshold}
              onChange={(e) => 
                updateSettings('aiSettings', { quotaWarningThreshold: parseInt(e.target.value) || 5 })
              }
              min="1" 
              max="20" 
            />
            <p className="text-xs text-muted-foreground">
              Show warning when remaining messages reach this threshold
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spam Prevention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="spam-prevention">Enable Spam Prevention</Label>
              <p className="text-sm text-muted-foreground">
                Prevent rapid consecutive messages from users
              </p>
            </div>
            <Switch 
              id="spam-prevention" 
              checked={settings.aiSettings.enableSpamPrevention}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableSpamPrevention: checked })
              }
            />
          </div>

          {settings.aiSettings.enableSpamPrevention && (
            <div className="space-y-2">
              <Label htmlFor="message-delay">Minimum Message Delay (seconds)</Label>
              <Input 
                id="message-delay" 
                type="number" 
                value={settings.aiSettings.minMessageDelaySeconds}
                onChange={(e) => 
                  updateSettings('aiSettings', { minMessageDelaySeconds: parseInt(e.target.value) || 3 })
                }
                min="1" 
                max="30" 
              />
              <p className="text-xs text-muted-foreground">
                Users must wait this long between messages
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-feedback">Enable Message Feedback</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to rate AI responses with thumbs up/down
              </p>
            </div>
            <Switch 
              id="enable-feedback" 
              checked={settings.aiSettings.enableFeedback}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableFeedback: checked })
              }
            />
          </div>

          {settings.aiSettings.enableFeedback && (
            <div className="space-y-2">
              <Label htmlFor="feedback-prompt">Feedback Prompt</Label>
              <Input 
                id="feedback-prompt" 
                value={settings.aiSettings.feedbackPrompt}
                onChange={(e) => 
                  updateSettings('aiSettings', { feedbackPrompt: e.target.value })
                }
                placeholder="Was this response helpful?"
              />
              <p className="text-xs text-muted-foreground">
                Text shown to users when asking for feedback
              </p>
            </div>
          )}

          <Button onClick={handleSave}>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}