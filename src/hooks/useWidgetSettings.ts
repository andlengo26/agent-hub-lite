/**
 * Custom hook for managing widget settings
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface WidgetSettings {
  integrations: {
    apiKey: string;
    aiModel: string;
    moodleUrl: string;
    moodleToken: string;
  };
  aiSettings: {
    assistantName: string;
    welcomeMessage: string;
    tone: string;
    customPrompt: string;
    sessionTimeout: number;
    idleTimeout: number;
    // AI-first routing settings
    enableAIFirst?: boolean;
    requestWaitingTime?: number; // Minutes before AI hands off to human
    aiHandoffRules?: {
      escalateOnKeywords?: string[];
      maxAIAttempts?: number;
      requireHumanForComplex?: boolean;
    };
    // Conversation lifecycle settings
    showTalkToHumanButton?: boolean;
    talkToHumanButtonText?: string;
    showEndConversationButton?: boolean;
    endConversationButtonText?: string;
    enableIdleTimeout?: boolean;
    enableMaxSessionLength?: boolean;
    maxSessionMinutes?: number;
    enableMessageQuota?: boolean;
    maxMessagesPerSession?: number;
    // Phase 4: New quota and spam prevention settings
    enableDailyQuota?: boolean;
    maxDailyMessages?: number;
    enableHourlyQuota?: boolean;
    maxHourlyMessages?: number;
    quotaWarningThreshold?: number;
    enableSpamPrevention?: boolean;
    minMessageDelaySeconds?: number;
    enableFeedback?: boolean;
    feedbackPrompt?: string;
  };
  appearance: {
    headerText: string;
    subheaderText: string;
    primaryColor: string;
    secondaryColor: string;
    highlightColor: string;
    buttonPosition: string;
    minimizedText: string;
    autoOpenWidget: boolean;
    paddingX: number;
    paddingY: number;
  };
  userInfo: {
    anonymousChat: boolean;
    requiredFields: {
      name: boolean;
      email: boolean;
      mobile: boolean;
    };
    // User identification settings
    enableUserIdentification?: boolean;
    identificationMethod?: 'manual_form_submission' | 'moodle_authentication' | 'both';
    enableMoodleAuth?: boolean;
    enableManualForm?: boolean;
    sessionDurationHours?: number;
    customWelcomeMessage?: string;
    moodleConfig?: {
      moodleUrl: string;
      apiToken: string;
      enabled: boolean;
      autoLogin: boolean;
      requiredFields: {
        studentId: boolean;
        department: boolean;
      };
    };
  };
  embed: {
    script: string;
    moodleChatPluginIntegration?: boolean;
  };
  voice: {
    enableVoiceCalls: boolean;
    enableVoicemails: boolean;
    businessHours: {
      start: string;
      end: string;
    };
  };
}

export function useWidgetSettings() {
  const [settings, setSettings] = useState<WidgetSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/mocks/widget-settings.json');
      if (!response.ok) throw new Error('Failed to load settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error loading widget settings:', error);
      toast({
        title: "Error",
        description: "Failed to load widget settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: WidgetSettings) => {
    setSaving(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll just update local state and show success
      setSettings(newSettings);
      
      toast({
        title: "Success",
        description: "Widget settings saved successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error saving widget settings:', error);
      toast({
        title: "Error",
        description: "Failed to save widget settings",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof WidgetSettings, updates: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        ...updates
      }
    }));
  };

  return {
    settings,
    loading,
    saving,
    saveSettings,
    updateSettings,
    loadSettings
  };
}