/**
 * Unified Settings Provider
 * Consolidates all widget settings management into a single context
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWidgetSettings, WidgetSettings } from '@/hooks/useWidgetSettings';

export interface WidgetAppearance {
  primaryColor: string;
  secondaryColor: string;
  highlightColor: string;
  headerText: string;
  subheaderText?: string;
  minimizedText?: string;
  buttonPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  paddingX: number;
  paddingY: number;
  autoOpenWidget: boolean;
}

export interface AISettings {
  assistantName: string;
  welcomeMessage: string;
  enableFeedback: boolean;
  maxDailyMessages: number;
  maxHourlyMessages: number;
  maxMessagesPerSession: number;
  enableDailyQuota: boolean;
  enableHourlyQuota: boolean;
  enableMessageQuota: boolean;
  quotaWarningThreshold: number;
  minMessageDelaySeconds: number;
  enableSpamPrevention: boolean;
}

export interface UserInfoSettings {
  enableUserIdentification: boolean;
  enableManualForm: boolean;
  enableMoodleAuth: boolean;
  anonymousChat: boolean;
  requiredFields: {
    name: boolean;
    email: boolean;
    mobile: boolean;
  };
}

export interface IntegrationsSettings {
  aiModel: string;
  moodle: {
    enabled: boolean;
    moodleUrl: string;
    apiToken: string;
    autoLogin: boolean;
    requiredFields: {
      studentId: boolean;
      department: boolean;
    };
  };
}

export interface VoiceSettings {
  enableVoiceCalls: boolean;
  enableVoicemail: boolean;
  businessHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
}

export interface EmbedSettings {
  script: string;
  moodleChatPluginIntegration: boolean;
}

export interface ConsolidatedWidgetSettings {
  appearance: WidgetAppearance;
  aiSettings: AISettings;
  userInfo: UserInfoSettings;
  integrations: IntegrationsSettings;
  voice: VoiceSettings;
  embed: EmbedSettings;
}

interface SettingsContextValue {
  settings: ConsolidatedWidgetSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Actions
  updateSettings: (updates: Partial<ConsolidatedWidgetSettings>) => void;
  saveSettings: (settings: ConsolidatedWidgetSettings) => Promise<void>;
  resetSettings: () => void;
  
  // Specific update methods
  updateAppearance: (appearance: Partial<WidgetAppearance>) => void;
  updateAISettings: (aiSettings: Partial<AISettings>) => void;
  updateUserInfo: (userInfo: Partial<UserInfoSettings>) => void;
  updateIntegrations: (integrations: Partial<IntegrationsSettings>) => void;
  updateVoiceSettings: (voice: Partial<VoiceSettings>) => void;
  updateEmbedSettings: (embed: Partial<EmbedSettings>) => void;
  
  // Validation
  validateSettings: (settings: ConsolidatedWidgetSettings) => {
    isValid: boolean;
    errors: Record<string, string>;
  };
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { settings: originalSettings, loading, saving, saveSettings: originalSaveSettings, updateSettings: originalUpdateSettings } = useWidgetSettings();
  const [error, setError] = useState<string | null>(null);

  // Transform original settings to consolidated format
  const settings: ConsolidatedWidgetSettings | null = originalSettings ? {
    appearance: {
      primaryColor: originalSettings.appearance.primaryColor,
      secondaryColor: originalSettings.appearance.secondaryColor,
      highlightColor: originalSettings.appearance.highlightColor,
      headerText: originalSettings.appearance.headerText,
      subheaderText: originalSettings.appearance.subheaderText,
      minimizedText: originalSettings.appearance.minimizedText,
      buttonPosition: originalSettings.appearance.buttonPosition as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
      paddingX: originalSettings.appearance.paddingX,
      paddingY: originalSettings.appearance.paddingY,
      autoOpenWidget: originalSettings.appearance.autoOpenWidget
    },
    aiSettings: {
      assistantName: originalSettings.aiSettings.assistantName,
      welcomeMessage: originalSettings.aiSettings.welcomeMessage,
      enableFeedback: originalSettings.aiSettings.enableFeedback,
      maxDailyMessages: originalSettings.aiSettings.maxDailyMessages,
      maxHourlyMessages: originalSettings.aiSettings.maxHourlyMessages,
      maxMessagesPerSession: originalSettings.aiSettings.maxMessagesPerSession,
      enableDailyQuota: originalSettings.aiSettings.enableDailyQuota,
      enableHourlyQuota: originalSettings.aiSettings.enableHourlyQuota,
      enableMessageQuota: originalSettings.aiSettings.enableMessageQuota,
      quotaWarningThreshold: originalSettings.aiSettings.quotaWarningThreshold,
      minMessageDelaySeconds: originalSettings.aiSettings.minMessageDelaySeconds,
      enableSpamPrevention: originalSettings.aiSettings.enableSpamPrevention
    },
    userInfo: {
      enableUserIdentification: originalSettings.userInfo.enableUserIdentification,
      enableManualForm: originalSettings.userInfo.enableManualForm,
      enableMoodleAuth: originalSettings.userInfo.enableMoodleAuth,
      anonymousChat: originalSettings.userInfo.anonymousChat,
      requiredFields: originalSettings.userInfo.requiredFields
    },
    integrations: {
      aiModel: originalSettings.integrations.aiModel,
      moodle: originalSettings.integrations.moodle
    },
    voice: {
      enableVoiceCalls: originalSettings.voice.enableVoiceCalls,
      enableVoicemail: originalSettings.voice.enableVoicemails || false,
      businessHours: {
        enabled: (originalSettings.voice.businessHours as any)?.enabled || false,
        start: originalSettings.voice.businessHours?.start || '09:00',
        end: originalSettings.voice.businessHours?.end || '17:00',
        timezone: (originalSettings.voice.businessHours as any)?.timezone || 'UTC'
      }
    },
    embed: {
      script: originalSettings.embed.script,
      moodleChatPluginIntegration: originalSettings.embed.moodleChatPluginIntegration || false
    }
  } : null;

  // Actions
  const updateSettings = useCallback((updates: Partial<ConsolidatedWidgetSettings>) => {
    if (!originalSettings) return;
    
    try {
      // Simplified approach - just pass through to original hook
      Object.entries(updates).forEach(([section, sectionUpdates]) => {
        if (section in originalSettings) {
          originalUpdateSettings(section as any, sectionUpdates);
        }
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    }
  }, [originalSettings, originalUpdateSettings]);

  const saveSettings = useCallback(async (settingsToSave: ConsolidatedWidgetSettings) => {
    try {
      await originalSaveSettings(settingsToSave as any);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      throw err;
    }
  }, [originalSaveSettings]);

  const resetSettings = useCallback(() => {
    // Implementation would reset to default settings
    setError(null);
  }, []);

  // Specific update methods
  const updateAppearance = useCallback((appearance: Partial<WidgetAppearance>) => {
    updateSettings({ appearance: { ...settings?.appearance, ...appearance } as WidgetAppearance });
  }, [updateSettings, settings]);

  const updateAISettings = useCallback((aiSettings: Partial<AISettings>) => {
    updateSettings({ aiSettings: { ...settings?.aiSettings, ...aiSettings } as AISettings });
  }, [updateSettings, settings]);

  const updateUserInfo = useCallback((userInfo: Partial<UserInfoSettings>) => {
    updateSettings({ userInfo: { ...settings?.userInfo, ...userInfo } as UserInfoSettings });
  }, [updateSettings, settings]);

  const updateIntegrations = useCallback((integrations: Partial<IntegrationsSettings>) => {
    updateSettings({ integrations: { ...settings?.integrations, ...integrations } as IntegrationsSettings });
  }, [updateSettings, settings]);

  const updateVoiceSettings = useCallback((voice: Partial<VoiceSettings>) => {
    updateSettings({ voice: { ...settings?.voice, ...voice } as VoiceSettings });
  }, [updateSettings, settings]);

  const updateEmbedSettings = useCallback((embed: Partial<EmbedSettings>) => {
    updateSettings({ embed: { ...settings?.embed, ...embed } as EmbedSettings });
  }, [updateSettings, settings]);

  // Validation
  const validateSettings = useCallback((settingsToValidate: ConsolidatedWidgetSettings) => {
    const errors: Record<string, string> = {};
    
    // Validate appearance
    if (!settingsToValidate.appearance.primaryColor) {
      errors.primaryColor = 'Primary color is required';
    }
    if (!settingsToValidate.appearance.headerText) {
      errors.headerText = 'Header text is required';
    }
    
    // Validate AI settings
    if (!settingsToValidate.aiSettings.assistantName) {
      errors.assistantName = 'Assistant name is required';
    }
    if (!settingsToValidate.aiSettings.welcomeMessage) {
      errors.welcomeMessage = 'Welcome message is required';
    }
    
    // Validate Moodle integration if enabled
    if (settingsToValidate.integrations.moodle.enabled) {
      if (!settingsToValidate.integrations.moodle.moodleUrl) {
        errors.moodleUrl = 'Moodle URL is required when integration is enabled';
      }
      if (!settingsToValidate.integrations.moodle.apiToken) {
        errors.moodleApiToken = 'Moodle API token is required when integration is enabled';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  const contextValue: SettingsContextValue = {
    settings,
    loading,
    saving,
    error,
    
    // Actions
    updateSettings,
    saveSettings,
    resetSettings,
    
    // Specific updates
    updateAppearance,
    updateAISettings,
    updateUserInfo,
    updateIntegrations,
    updateVoiceSettings,
    updateEmbedSettings,
    
    // Validation
    validateSettings
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}