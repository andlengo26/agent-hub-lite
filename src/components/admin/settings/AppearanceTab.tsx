/**
 * Appearance settings tab component
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ColorPicker } from '@/components/ui/color-picker';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface AppearanceTabProps {
  settings: WidgetSettings;
  updateSettings: (section: keyof WidgetSettings, updates: any) => void;
}

export function AppearanceTab({ settings, updateSettings }: AppearanceTabProps) {
  return (
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
  );
}