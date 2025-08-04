/**
 * User Access & Authentication Settings Tab
 * Manages user identification, anonymous access, and authentication methods
 */

import { WidgetSettings } from '@/hooks/useWidgetSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface UserAccessAuthTabProps {
  settings: WidgetSettings;
  updateSettings: (section: keyof WidgetSettings, updates: any) => void;
}

export function UserAccessAuthTab({ settings, updateSettings }: UserAccessAuthTabProps) {
  return (
    <div className="space-y-6">
      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>Configure how users can access the chat widget</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Anonymous Chat</Label>
              <p className="text-sm text-muted-foreground">Users can chat without providing personal information</p>
            </div>
            <Switch
              checked={settings?.userInfo?.anonymousChat || false}
              onCheckedChange={(checked) => 
                updateSettings('userInfo', { anonymousChat: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-open Widget</Label>
              <p className="text-sm text-muted-foreground">Automatically open the widget for new visitors</p>
            </div>
            <Switch
              checked={settings?.appearance?.autoOpenWidget || false}
              onCheckedChange={(checked) => 
                updateSettings('appearance', { autoOpenWidget: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* User Identification */}
      <Card>
        <CardHeader>
          <CardTitle>User Identification</CardTitle>
          <CardDescription>Configure how users identify themselves when not using anonymous chat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable User Identification</Label>
              <p className="text-sm text-muted-foreground">Require users to identify themselves before chatting</p>
            </div>
            <Switch
              checked={settings?.userInfo?.enableUserIdentification || false}
              onCheckedChange={(checked) => 
                updateSettings('userInfo', { enableUserIdentification: checked })
              }
            />
          </div>

          {settings?.userInfo?.enableUserIdentification && (
            <>
              <div className="space-y-3">
                <Label>Required Information</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="name"
                      checked={settings?.userInfo?.requiredFields?.name || false}
                      onCheckedChange={(checked) => 
                        updateSettings('userInfo', {
                          requiredFields: {
                            ...settings?.userInfo?.requiredFields,
                            name: checked
                          }
                        })
                      }
                    />
                    <Label htmlFor="name">Full Name</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={settings?.userInfo?.requiredFields?.email || false}
                      onCheckedChange={(checked) => 
                        updateSettings('userInfo', {
                          requiredFields: {
                            ...settings?.userInfo?.requiredFields,
                            email: checked
                          }
                        })
                      }
                    />
                    <Label htmlFor="email">Email Address</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mobile"
                      checked={settings?.userInfo?.requiredFields?.mobile || false}
                      onCheckedChange={(checked) => 
                        updateSettings('userInfo', {
                          requiredFields: {
                            ...settings?.userInfo?.requiredFields,
                            mobile: checked
                          }
                        })
                      }
                    />
                    <Label htmlFor="mobile">Mobile Number</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionDuration">Session Duration (hours)</Label>
                <Input
                  id="sessionDuration"
                  type="number"
                  min="1"
                  max="168"
                  value={settings?.userInfo?.sessionDurationHours || 24}
                  onChange={(e) => 
                    updateSettings('userInfo', { sessionDurationHours: parseInt(e.target.value) })
                  }
                />
                <p className="text-sm text-muted-foreground">How long user sessions remain valid (1-168 hours)</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Authentication Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Methods</CardTitle>
          <CardDescription>Choose how users can authenticate with the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Manual Form Submission</Label>
              <p className="text-sm text-muted-foreground">
                Users fill out a form with their details (name, email, phone) to identify themselves. 
                This is the traditional method where users manually enter their information.
              </p>
            </div>
            <Switch
              checked={settings?.userInfo?.enableManualForm || false}
              onCheckedChange={(checked) => 
                updateSettings('userInfo', { enableManualForm: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Moodle Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Users authenticate using their existing Moodle login credentials. 
                This requires Moodle integration to be configured and allows seamless single sign-on experience.
              </p>
            </div>
            <Switch
              checked={settings?.userInfo?.enableMoodleAuth || false}
              onCheckedChange={(checked) => 
                updateSettings('userInfo', { enableMoodleAuth: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Welcome Message</CardTitle>
          <CardDescription>Personalize the greeting for authenticated users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customWelcome">Custom Welcome Message</Label>
              <Textarea
                id="customWelcome"
                value={settings?.userInfo?.customWelcomeMessage || ''}
                onChange={(e) => 
                  updateSettings('userInfo', { customWelcomeMessage: e.target.value })
                }
                placeholder="Welcome back! How can I help you today?"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                This message will be shown to users during the identification process (User Access & Auth tab).
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is different from the AI welcome message in the "AI Behavior & Routing" tab. 
                This message appears during user identification, while the AI welcome message appears when the chat conversation starts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}