/**
 * Moodle Configuration Settings Page
 * Updated to use consolidated Moodle module
 */

import React from 'react';
import { MoodleConfigPanel } from '@/modules/moodle/components/MoodleConfigPanel';
import { MoodleConfigService } from '@/modules/moodle/services/MoodleConfigService';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { useToast } from '@/hooks/use-toast';

export function MoodleConfiguration() {
  const { settings, updateSettings, saveSettings, saving } = useWidgetSettings();
  const { toast } = useToast();

  if (!settings) {
    return <div>Loading...</div>;
  }

  const moodleConfig = settings.integrations.moodle || MoodleConfigService.getDefaultConfig();

  const handleConfigChange = (newConfig: any) => {
    updateSettings('integrations', {
      ...settings.integrations,
      moodle: newConfig
    });
  };

  const handleSave = async () => {
    const success = await saveSettings(settings);
    if (success) {
      toast({
        title: "Success",
        description: "Moodle configuration saved successfully",
      });
    }
  };

  return (
    <MoodleConfigPanel
      config={moodleConfig}
      onConfigChange={handleConfigChange}
      onSave={handleSave}
      saving={saving}
    />
  );
}