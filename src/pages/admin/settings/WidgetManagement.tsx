/**
 * Refactored Widget Management Settings Page
 * Now uses unified SettingsProvider for better architecture
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { adaptSettingsForTabs, createUpdateSettingsWrapper } from '@/components/admin/settings/SettingsAdapter';
import { Loader2, Check } from 'lucide-react';
import {
  SetupIntegrationTab,
  UserAccessAuthTab,
  AIBehaviorRoutingTab,
  AppearancePlacementTab,
  AdvancedFeaturesTab,
} from '@/components/admin/settings';
import { InteractiveWidget } from '@/components/admin/InteractiveWidget';

// Internal component that uses the settings context
function WidgetManagementContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, loading, saving, saveSettings, error, updateSettings: updateSettingsContext } = useSettings();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'setup');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Create compatibility wrapper for legacy updateSettings
  const updateSettings = createUpdateSettingsWrapper(updateSettingsContext);

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

  const handleSaveAllSettings = async () => {
    if (!settings) return;
    
    try {
      await saveSettings(settings);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Track changes to mark unsaved state
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [settings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Adapt consolidated settings to legacy format for existing tabs
  const adaptedSettings = settings ? adaptSettingsForTabs(settings) : null;

  if (!adaptedSettings) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load widget settings</p>
        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
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
          <CardTitle className="flex items-center justify-between">
            Widget Configuration
            {hasUnsavedChanges && (
              <span className="text-sm text-muted-foreground">• Unsaved changes</span>
            )}
          </CardTitle>
          <CardDescription>
            Customize your widget's behavior, appearance, and features using the unified settings system
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
              <SetupIntegrationTab settings={adaptedSettings} updateSettings={updateSettings} />
            </TabsContent>

            <TabsContent value="access" className="space-y-4">
              <UserAccessAuthTab settings={adaptedSettings} updateSettings={updateSettings} />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <AIBehaviorRoutingTab settings={adaptedSettings} updateSettings={updateSettings} />
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <AppearancePlacementTab settings={adaptedSettings} updateSettings={updateSettings} />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <AdvancedFeaturesTab settings={adaptedSettings} updateSettings={updateSettings} />
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {error && (
                  <span className="text-sm text-destructive">{error}</span>
                )}
                {!hasUnsavedChanges && !saving && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    All changes saved
                  </div>
                )}
              </div>
              <Button 
                onClick={handleSaveAllSettings} 
                disabled={saving || !hasUnsavedChanges}
                className="min-w-[120px]"
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with SettingsProvider wrapper
export default function WidgetManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Widget Management</h1>
        <p className="text-muted-foreground">
          Configure your customer support widget settings with the new unified architecture
        </p>
      </div>

      <SettingsProvider>
        <WidgetManagementContent />
        <InteractiveWidget />
      </SettingsProvider>
    </div>
  );
}