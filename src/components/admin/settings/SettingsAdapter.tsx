/**
 * Settings Tab Adapter
 * Provides compatibility layer between ConsolidatedWidgetSettings and legacy WidgetSettings
 */

import { ConsolidatedWidgetSettings } from '@/contexts/SettingsContext';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

// Adapter function to convert ConsolidatedWidgetSettings to WidgetSettings format
export function adaptSettingsForTabs(settings: ConsolidatedWidgetSettings): WidgetSettings {
  return {
    integrations: {
      apiKey: settings.integrations.apiKey,
      aiModel: settings.integrations.aiModel,
      moodle: settings.integrations.moodle
    },
    aiSettings: {
      assistantName: settings.aiSettings.assistantName,
      welcomeMessage: settings.aiSettings.welcomeMessage,
      tone: 'friendly', // Default value for compatibility
      customPrompt: '', // Default value for compatibility
      sessionTimeout: 30, // Default value for compatibility
      idleTimeout: 10, // Default value for compatibility
      enableFeedback: settings.aiSettings.enableFeedback,
      feedbackPrompt: 'How was your experience?', // Default value
      maxDailyMessages: settings.aiSettings.maxDailyMessages,
      maxHourlyMessages: settings.aiSettings.maxHourlyMessages,
      maxMessagesPerSession: settings.aiSettings.maxMessagesPerSession,
      enableDailyQuota: settings.aiSettings.enableDailyQuota,
      enableHourlyQuota: settings.aiSettings.enableHourlyQuota,
      enableMessageQuota: settings.aiSettings.enableMessageQuota,
      quotaWarningThreshold: settings.aiSettings.quotaWarningThreshold,
      minMessageDelaySeconds: settings.aiSettings.minMessageDelaySeconds,
      enableSpamPrevention: settings.aiSettings.enableSpamPrevention
    },
    appearance: {
      primaryColor: settings.appearance.primaryColor,
      secondaryColor: settings.appearance.secondaryColor,
      highlightColor: settings.appearance.highlightColor,
      headerText: settings.appearance.headerText,
      subheaderText: settings.appearance.subheaderText,
      minimizedText: settings.appearance.minimizedText,
      buttonPosition: settings.appearance.buttonPosition,
      paddingX: settings.appearance.paddingX,
      paddingY: settings.appearance.paddingY,
      autoOpenWidget: settings.appearance.autoOpenWidget
    },
    userInfo: {
      enableUserIdentification: settings.userInfo.enableUserIdentification,
      enableManualForm: settings.userInfo.enableManualForm,
      enableMoodleAuth: settings.userInfo.enableMoodleAuth,
      anonymousChat: settings.userInfo.anonymousChat,
      requiredFields: settings.userInfo.requiredFields
    },
    voice: {
      enableVoiceCalls: settings.voice.enableVoiceCalls,
      enableVoicemails: settings.voice.enableVoicemail,
      businessHours: {
        start: settings.voice.businessHours.start,
        end: settings.voice.businessHours.end
      }
    },
    embed: {
      script: settings.embed.script,
      moodleChatPluginIntegration: settings.embed.moodleChatPluginIntegration
    }
  } as WidgetSettings;
}

// Create a wrapper function for updateSettings compatibility
export function createUpdateSettingsWrapper(updateFunction: any) {
  return (section: string, updates: any) => {
    // Convert section updates to consolidated format
    updateFunction({ [section]: updates });
  };
}