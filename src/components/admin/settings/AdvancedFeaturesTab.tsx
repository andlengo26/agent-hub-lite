/**
 * Advanced Features Settings Tab
 * Voice calls, quotas, spam prevention, session management, and other advanced features
 */

import { WidgetSettings } from '@/hooks/useWidgetSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface AdvancedFeaturesTabProps {
  settings: WidgetSettings;
  updateSettings: (section: keyof WidgetSettings, updates: any) => void;
}

export function AdvancedFeaturesTab({ settings, updateSettings }: AdvancedFeaturesTabProps) {
  return (
    <div className="space-y-6">
      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Configure session timeouts and duration limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              min="5"
              max="480"
              value={settings?.aiSettings?.sessionTimeout || 30}
              onChange={(e) => updateSettings('aiSettings', { sessionTimeout: parseInt(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground">
              How long before inactive sessions expire (5-480 minutes)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Idle Timeout</Label>
              <p className="text-sm text-muted-foreground">Warn users when they've been idle</p>
            </div>
            <Switch
              checked={settings?.aiSettings?.enableIdleTimeout || false}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableIdleTimeout: checked })
              }
            />
          </div>

          {settings?.aiSettings?.enableIdleTimeout && (
            <div className="space-y-2">
              <Label htmlFor="idleTimeout">Idle Timeout (minutes)</Label>
              <Input
                id="idleTimeout"
                type="number"
                min="5"
                max="60"
                value={settings?.aiSettings?.idleTimeout || 15}
                onChange={(e) => updateSettings('aiSettings', { idleTimeout: parseInt(e.target.value) })}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Maximum Session Length</Label>
              <p className="text-sm text-muted-foreground">Automatically end long conversations</p>
            </div>
            <Switch
              checked={settings?.aiSettings?.enableMaxSessionLength || false}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableMaxSessionLength: checked })
              }
            />
          </div>

          {settings?.aiSettings?.enableMaxSessionLength && (
            <div className="space-y-2">
              <Label htmlFor="maxSessionMinutes">Maximum Session Length (minutes)</Label>
              <Input
                id="maxSessionMinutes"
                type="number"
                min="30"
                max="480"
                value={settings?.aiSettings?.maxSessionMinutes || 120}
                onChange={(e) => updateSettings('aiSettings', { maxSessionMinutes: parseInt(e.target.value) })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Quotas */}
      <Card>
        <CardHeader>
          <CardTitle>Message Quotas</CardTitle>
          <CardDescription>Set limits on message volume to prevent abuse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Session Message Quota</Label>
              <p className="text-sm text-muted-foreground">Limit messages per conversation session</p>
            </div>
            <Switch
              checked={settings?.aiSettings?.enableMessageQuota || false}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableMessageQuota: checked })
              }
            />
          </div>

          {settings?.aiSettings?.enableMessageQuota && (
            <div className="space-y-2">
              <Label htmlFor="maxMessagesPerSession">Messages per Session</Label>
              <Input
                id="maxMessagesPerSession"
                type="number"
                min="5"
                max="200"
                value={settings?.aiSettings?.maxMessagesPerSession || 50}
                onChange={(e) => updateSettings('aiSettings', { maxMessagesPerSession: parseInt(e.target.value) })}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Daily Message Quota</Label>
              <p className="text-sm text-muted-foreground">Limit messages per user per day</p>
            </div>
            <Switch
              checked={settings?.aiSettings?.enableDailyQuota || false}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableDailyQuota: checked })
              }
            />
          </div>

          {settings?.aiSettings?.enableDailyQuota && (
            <div className="space-y-2">
              <Label htmlFor="maxDailyMessages">Daily Message Limit</Label>
              <Input
                id="maxDailyMessages"
                type="number"
                min="10"
                max="1000"
                value={settings?.aiSettings?.maxDailyMessages || 100}
                onChange={(e) => updateSettings('aiSettings', { maxDailyMessages: parseInt(e.target.value) })}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Hourly Message Quota</Label>
              <p className="text-sm text-muted-foreground">Limit messages per user per hour</p>
            </div>
            <Switch
              checked={settings?.aiSettings?.enableHourlyQuota || false}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableHourlyQuota: checked })
              }
            />
          </div>

          {settings?.aiSettings?.enableHourlyQuota && (
            <div className="space-y-2">
              <Label htmlFor="maxHourlyMessages">Hourly Message Limit</Label>
              <Input
                id="maxHourlyMessages"
                type="number"
                min="5"
                max="100"
                value={settings?.aiSettings?.maxHourlyMessages || 20}
                onChange={(e) => updateSettings('aiSettings', { maxHourlyMessages: parseInt(e.target.value) })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quotaWarningThreshold">Quota Warning Threshold (%)</Label>
            <Input
              id="quotaWarningThreshold"
              type="number"
              min="50"
              max="95"
              value={settings?.aiSettings?.quotaWarningThreshold || 80}
              onChange={(e) => updateSettings('aiSettings', { quotaWarningThreshold: parseInt(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground">
              When to warn users they're approaching their quota limit
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Spam Prevention */}
      <Card>
        <CardHeader>
          <CardTitle>Spam Prevention</CardTitle>
          <CardDescription>Protect against rapid-fire messaging and abuse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Spam Prevention</Label>
              <p className="text-sm text-muted-foreground">Enforce minimum delays between messages</p>
            </div>
            <Switch
              checked={settings?.aiSettings?.enableSpamPrevention || false}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableSpamPrevention: checked })
              }
            />
          </div>

          {settings?.aiSettings?.enableSpamPrevention && (
            <div className="space-y-2">
              <Label htmlFor="minMessageDelay">Minimum Message Delay (seconds)</Label>
              <Input
                id="minMessageDelay"
                type="number"
                min="1"
                max="30"
                value={settings?.aiSettings?.minMessageDelaySeconds || 2}
                onChange={(e) => updateSettings('aiSettings', { minMessageDelaySeconds: parseInt(e.target.value) })}
              />
              <p className="text-sm text-muted-foreground">
                Minimum time users must wait between sending messages
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voice Features */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Features</CardTitle>
          <CardDescription>Enable voice calls and voicemail functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Voice Calls</Label>
              <p className="text-sm text-muted-foreground">Allow users to initiate voice calls with agents</p>
            </div>
            <Switch
              checked={settings?.voice?.enableVoiceCalls || false}
              onCheckedChange={(checked) => 
                updateSettings('voice', { enableVoiceCalls: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Voicemails</Label>
              <p className="text-sm text-muted-foreground">Allow users to leave voicemail messages</p>
            </div>
            <Switch
              checked={settings?.voice?.enableVoicemails || false}
              onCheckedChange={(checked) => 
                updateSettings('voice', { enableVoicemails: checked })
              }
            />
          </div>

          {(settings?.voice?.enableVoiceCalls || settings?.voice?.enableVoicemails) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessHoursStart">Business Hours Start</Label>
                <Input
                  id="businessHoursStart"
                  type="time"
                  value={settings?.voice?.businessHours?.start || '09:00'}
                  onChange={(e) => 
                    updateSettings('voice', {
                      businessHours: {
                        ...settings?.voice?.businessHours,
                        start: e.target.value
                      }
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessHoursEnd">Business Hours End</Label>
                <Input
                  id="businessHoursEnd"
                  type="time"
                  value={settings?.voice?.businessHours?.end || '17:00'}
                  onChange={(e) => 
                    updateSettings('voice', {
                      businessHours: {
                        ...settings?.voice?.businessHours,
                        end: e.target.value
                      }
                    })
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}