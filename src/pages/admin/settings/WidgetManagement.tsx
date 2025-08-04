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
import {
  SetupIntegrationTab,
  UserAccessAuthTab,
  AIBehaviorRoutingTab,
  AppearancePlacementTab,
  AdvancedFeaturesTab,
} from '@/components/admin/settings';

export default function WidgetManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const { settings, loading, saving, saveSettings, updateSettings } = useWidgetSettings();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'setup');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['setup', 'access', 'ai', 'appearance', 'advanced'].includes(tab)) {
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="setup">Setup & Integration</TabsTrigger>
              <TabsTrigger value="access">User Access & Auth</TabsTrigger>
              <TabsTrigger value="ai">AI Behavior & Routing</TabsTrigger>
              <TabsTrigger value="appearance">Appearance & Placement</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <SetupIntegrationTab settings={settings} updateSettings={updateSettings} />
            </TabsContent>

            <TabsContent value="access" className="space-y-4">
              <UserAccessAuthTab settings={settings} updateSettings={updateSettings} />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <AIBehaviorRoutingTab settings={settings} updateSettings={updateSettings} />
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <AppearancePlacementTab settings={settings} updateSettings={updateSettings} />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <AdvancedFeaturesTab settings={settings} updateSettings={updateSettings} />
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