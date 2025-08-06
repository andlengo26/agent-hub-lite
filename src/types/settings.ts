/**
 * Settings related type definitions
 * Provides specific types for widget and system settings
 */

export interface SettingsSection {
  [key: string]: unknown;
}

export interface WidgetSettingsUpdate {
  section: string;
  updates: Record<string, unknown>;
}

export interface UserIdentificationConfig {
  settings: Record<string, unknown>;
  conversationPersistence: Record<string, unknown>;
  messageQuota: Record<string, unknown>;
}

export interface WidgetActionConfig {
  settings: Record<string, unknown>;
  conversationPersistence: Record<string, unknown>;
  conversationState: Record<string, unknown>;
  messageQuota: Record<string, unknown>;
  spamPrevention: Record<string, unknown>;
  userIdentification: Record<string, unknown>;
}

export interface MoodleConfig {
  enabled: boolean;
  settings: Record<string, unknown>;
}