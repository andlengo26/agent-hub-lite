/**
 * User Info settings tab component
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface UserInfoTabProps {
  settings: WidgetSettings;
  updateSettings: (section: keyof WidgetSettings, updates: any) => void;
}

export function UserInfoTab({ settings, updateSettings }: UserInfoTabProps) {
  return (
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
  );
}