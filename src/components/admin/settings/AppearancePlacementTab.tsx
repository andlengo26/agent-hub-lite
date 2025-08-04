/**
 * Widget Appearance & Placement Settings Tab
 * Controls visual design, colors, positioning, and display options
 */

import { WidgetSettings } from '@/hooks/useWidgetSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

interface AppearancePlacementTabProps {
  settings: WidgetSettings;
  updateSettings: (section: keyof WidgetSettings, updates: any) => void;
}

export function AppearancePlacementTab({ settings, updateSettings }: AppearancePlacementTabProps) {
  return (
    <div className="space-y-6">
      {/* Header Content */}
      <Card>
        <CardHeader>
          <CardTitle>Header Content</CardTitle>
          <CardDescription>Customize the text displayed in the widget header</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headerText">Main Header Text</Label>
            <Input
              id="headerText"
              value={settings?.appearance?.headerText || ''}
              onChange={(e) => updateSettings('appearance', { headerText: e.target.value })}
              placeholder="Chat with us"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subheaderText">Subheader Text</Label>
            <Input
              id="subheaderText"
              value={settings?.appearance?.subheaderText || ''}
              onChange={(e) => updateSettings('appearance', { subheaderText: e.target.value })}
              placeholder="We're here to help"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimizedText">Minimized Button Text</Label>
            <Input
              id="minimizedText"
              value={settings?.appearance?.minimizedText || ''}
              onChange={(e) => updateSettings('appearance', { minimizedText: e.target.value })}
              placeholder="Chat"
            />
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card>
        <CardHeader>
          <CardTitle>Color Scheme</CardTitle>
          <CardDescription>Customize the widget's color palette to match your brand</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings?.appearance?.primaryColor || '#0052CC'}
                  onChange={(e) => updateSettings('appearance', { primaryColor: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={settings?.appearance?.primaryColor || '#0052CC'}
                  onChange={(e) => updateSettings('appearance', { primaryColor: e.target.value })}
                  placeholder="#0052CC"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings?.appearance?.secondaryColor || '#17A2B8'}
                  onChange={(e) => updateSettings('appearance', { secondaryColor: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={settings?.appearance?.secondaryColor || '#17A2B8'}
                  onChange={(e) => updateSettings('appearance', { secondaryColor: e.target.value })}
                  placeholder="#17A2B8"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlightColor">Highlight Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="highlightColor"
                  type="color"
                  value={settings?.appearance?.highlightColor || '#FFC107'}
                  onChange={(e) => updateSettings('appearance', { highlightColor: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={settings?.appearance?.highlightColor || '#FFC107'}
                  onChange={(e) => updateSettings('appearance', { highlightColor: e.target.value })}
                  placeholder="#FFC107"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget Positioning */}
      <Card>
        <CardHeader>
          <CardTitle>Widget Positioning</CardTitle>
          <CardDescription>Configure where the widget appears on your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Button Position</Label>
            <RadioGroup
              value={settings?.appearance?.buttonPosition || 'bottom-right'}
              onValueChange={(value) => updateSettings('appearance', { buttonPosition: value })}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paddingX">Horizontal Padding (px)</Label>
              <Input
                id="paddingX"
                type="number"
                min="0"
                max="100"
                value={settings?.appearance?.paddingX || 20}
                onChange={(e) => updateSettings('appearance', { paddingX: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paddingY">Vertical Padding (px)</Label>
              <Input
                id="paddingY"
                type="number"
                min="0"
                max="100"
                value={settings?.appearance?.paddingY || 20}
                onChange={(e) => updateSettings('appearance', { paddingY: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget Embed Code */}
      <Card>
        <CardHeader>
          <CardTitle>Widget Embed Code</CardTitle>
          <CardDescription>Copy this code to embed the widget on your website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="embedScript">Embed Script</Label>
            <textarea
              id="embedScript"
              value={settings?.embed?.script || ''}
              readOnly
              className="w-full h-32 p-3 font-mono text-sm bg-muted rounded-md border"
              placeholder="<!-- Widget embed script will be generated here -->"
            />
            <p className="text-sm text-muted-foreground">
              Copy and paste this code into your website's HTML to embed the chat widget
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}