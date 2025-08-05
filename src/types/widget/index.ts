/**
 * Widget Configuration and Settings Type System
 * Types for widget appearance, behavior, and configuration
 */

import { AppearanceConfig } from '../core';
import { IntegrationSettings } from '../user';

// ============= Widget Appearance =============

export interface WidgetAppearance extends AppearanceConfig {
  headerText: string;
  logoUrl?: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
  boxShadow: string;
  position: WidgetPosition;
  dimensions: WidgetDimensions;
  animations: WidgetAnimations;
}

export interface WidgetPosition {
  placement: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offsetX: number;
  offsetY: number;
  zIndex: number;
}

export interface WidgetDimensions {
  collapsed: {
    width: number;
    height: number;
  };
  expanded: {
    width: number;
    height: number;
    maxWidth?: number;
    maxHeight?: number;
  };
  mobile: {
    width: string;
    height: string;
  };
}

export interface WidgetAnimations {
  enableAnimations: boolean;
  openAnimation: 'slide' | 'fade' | 'scale' | 'bounce';
  closeAnimation: 'slide' | 'fade' | 'scale';
  transitionDuration: number;
  easing: string;
}

// ============= AI Configuration =============

export interface AISettings {
  assistantName: string;
  welcomeMessage: string;
  model: string;
  temperature: number;
  maxTokens: number;
  enableFeedback: boolean;
  enableSentimentAnalysis: boolean;
  responseDelay: AIResponseDelay;
  escalation: AIEscalationSettings;
  limitations: AILimitations;
  personality: AIPersonality;
}

export interface AIResponseDelay {
  enabled: boolean;
  minDelaySeconds: number;
  maxDelaySeconds: number;
  typingIndicator: boolean;
}

export interface AIEscalationSettings {
  enabled: boolean;
  confidenceThreshold: number;
  maxAttempts: number;
  triggerKeywords: string[];
  escalationMessage: string;
  autoEscalate: boolean;
}

export interface AILimitations {
  maxDailyMessages: number;
  maxWeeklyMessages: number;
  maxSessionMessages: number;
  rateLimitPerMinute: number;
  enableSpamPrevention: boolean;
  cooldownPeriod: number;
}

export interface AIPersonality {
  tone: 'professional' | 'friendly' | 'casual' | 'formal';
  style: 'concise' | 'detailed' | 'conversational';
  helpfulness: 'conservative' | 'moderate' | 'proactive';
  customInstructions?: string;
}

// ============= User Information Settings =============

export interface UserInfoSettings {
  enableUserIdentification: boolean;
  enableManualForm: boolean;
  enableMoodleAuth: boolean;
  enableSSO: boolean;
  anonymousChat: boolean;
  identificationTiming: 'immediate' | 'before-first-message' | 'before-human-handoff';
  requiredFields: UserRequiredFields;
  customFields: CustomField[];
  validation: UserValidationSettings;
}

export interface UserRequiredFields {
  name: boolean;
  email: boolean;
  mobile: boolean;
  studentId: boolean;
  department: boolean;
  organization: boolean;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean';
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select/multiselect
  validation?: FieldValidation;
  order: number;
}

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  customValidator?: string; // function name
}

export interface UserValidationSettings {
  emailValidation: boolean;
  phoneValidation: boolean;
  strictValidation: boolean;
  allowInternationalPhone: boolean;
  blockedDomains: string[];
  allowedDomains: string[];
}

// ============= Voice and Communication =============

export interface VoiceSettings {
  enableVoiceCalls: boolean;
  enableVoicemail: boolean;
  provider: 'twilio' | 'webrtc' | 'custom';
  configuration: VoiceConfiguration;
  businessHours: BusinessHours;
  callRouting: CallRouting;
  recording: CallRecording;
}

export interface VoiceConfiguration {
  apiKey?: string;
  phoneNumber?: string;
  region?: string;
  quality: 'standard' | 'high' | 'premium';
  codec: 'g711' | 'g722' | 'opus';
  dtmfDetection: boolean;
}

export interface BusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: WeeklySchedule;
  holidays: Holiday[];
  afterHoursMessage?: string;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  enabled: boolean;
  open: string; // HH:mm format
  close: string; // HH:mm format
  breaks?: TimeRange[];
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface Holiday {
  name: string;
  date: Date;
  recurring: boolean;
  allDay: boolean;
  timeRange?: TimeRange;
}

export interface CallRouting {
  strategy: 'round-robin' | 'least-busy' | 'priority' | 'random';
  fallback: 'voicemail' | 'queue' | 'disconnect';
  maxWaitTime: number;
  queuePosition: boolean;
  musicOnHold: boolean;
}

export interface CallRecording {
  enabled: boolean;
  autoStart: boolean;
  announcement: boolean;
  retention: number; // days
  transcription: boolean;
  storage: 'local' | 's3' | 'gcs' | 'azure';
}

// ============= Embedding and Integration =============

export interface EmbedSettings {
  script: string;
  customCSS?: string;
  customJS?: string;
  moodleChatPluginIntegration: boolean;
  wordPressIntegration: boolean;
  shopifyIntegration: boolean;
  salesforceIntegration: boolean;
  allowedDomains: string[];
  blocklistedDomains: string[];
  enableCSP: boolean;
  sandboxMode: boolean;
}

// ============= Widget Behavior =============

export interface WidgetBehavior {
  autoOpen: WidgetAutoOpen;
  notifications: WidgetNotifications;
  session: SessionBehavior;
  accessibility: AccessibilitySettings;
  mobile: MobileBehavior;
}

export interface WidgetAutoOpen {
  enabled: boolean;
  delay: number;
  conditions: AutoOpenCondition[];
  frequency: 'once' | 'once-per-session' | 'once-per-day' | 'always';
}

export interface AutoOpenCondition {
  type: 'page-view' | 'time-on-page' | 'scroll-depth' | 'exit-intent' | 'url-match';
  value: string | number;
  operator?: 'eq' | 'gt' | 'lt' | 'contains' | 'regex';
}

export interface WidgetNotifications {
  sound: boolean;
  soundFile?: string;
  desktop: boolean;
  badge: boolean;
  vibration: boolean; // mobile
  customNotificationHandler?: string;
}

export interface SessionBehavior {
  persistChat: boolean;
  sessionTimeout: number;
  idleTimeout: number;
  maxSessionDuration: number;
  warningBeforeTimeout: number;
  autoCloseOnIdle: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  focusIndicators: boolean;
  altTextForImages: boolean;
  ariaLabels: Record<string, string>;
}

export interface MobileBehavior {
  responsive: boolean;
  mobileBreakpoint: number;
  fullScreenOnMobile: boolean;
  swipeGestures: boolean;
  touchOptimization: boolean;
  orientation: 'auto' | 'portrait' | 'landscape';
}

// ============= Consolidated Widget Settings =============

export interface ConsolidatedWidgetSettings {
  appearance: WidgetAppearance;
  ai: AISettings;
  userInfo: UserInfoSettings;
  integrations: IntegrationSettings;
  voice: VoiceSettings;
  embed: EmbedSettings;
  behavior: WidgetBehavior;
  version: string;
  lastModified: Date;
  modifiedBy: string;
}

// ============= Widget Analytics =============

export interface WidgetAnalytics {
  views: number;
  interactions: number;
  conversations: number;
  conversationRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  userSatisfaction: number;
  aiResolutionRate: number;
  escalationRate: number;
  popularPages: PageAnalytics[];
  timeBasedMetrics: TimeBasedMetrics;
}

export interface PageAnalytics {
  url: string;
  title?: string;
  views: number;
  interactions: number;
  conversionRate: number;
}

export interface TimeBasedMetrics {
  hourly: Record<string, number>;
  daily: Record<string, number>;
  weekly: Record<string, number>;
  monthly: Record<string, number>;
}