/**
 * Integrations settings tab component
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface IntegrationsTabProps {
  settings: WidgetSettings;
  updateSettings: (section: keyof WidgetSettings, updates: any) => void;
}

export function IntegrationsTab({ settings, updateSettings }: IntegrationsTabProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
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
  );
}