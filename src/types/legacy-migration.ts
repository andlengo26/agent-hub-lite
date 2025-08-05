/**
 * Legacy Type Migration Helper
 * Maps old types to new consolidated types for smooth migration
 */

import {
  ChatSession as NewChatSession,
  ChatStatus as NewChatStatus,
  Message as NewMessage
} from './chat';

import {
  User as NewUser,
  Customer as NewCustomer,
  Organization as NewOrganization
} from './user';

import {
  Document as NewDocument,
  Resource as NewResource,
  FAQ as NewFAQ
} from './content';

import { ConsolidatedWidgetSettings as NewWidgetSettings } from './widget';

// ============= Type Mapping Functions =============

/**
 * Maps legacy chat to new chat session type
 */
export function mapLegacyChat(legacyChat: any): NewChatSession {
  return {
    id: legacyChat.id,
    customerId: legacyChat.customerId,
    customerName: legacyChat.customerName || legacyChat.requesterName,
    customerEmail: legacyChat.customerEmail,
    status: mapLegacyStatus(legacyChat.status),
    assignedTo: legacyChat.assignedTo,
    handledBy: legacyChat.handledBy || 'ai',
    startTime: new Date(legacyChat.startTime || legacyChat.createdAt),
    endTime: legacyChat.endTime ? new Date(legacyChat.endTime) : undefined,
    summary: legacyChat.summary,
    tags: legacyChat.tags || [],
    priority: legacyChat.priority || 'medium',
    channel: legacyChat.channel || 'widget',
    lastMessage: legacyChat.lastMessage,
    unreadCount: legacyChat.unreadCount || 0,
    waitTime: legacyChat.waitTime,
    aiHandoffReason: legacyChat.aiHandoffReason,
    escalationReason: legacyChat.escalationReason,
    createdAt: new Date(legacyChat.createdAt),
    updatedAt: legacyChat.updatedAt ? new Date(legacyChat.updatedAt) : undefined
  };
}

/**
 * Maps legacy status to new status
 */
export function mapLegacyStatus(status: string): NewChatStatus {
  const statusMap: Record<string, NewChatStatus> = {
    'waiting': 'waiting',
    'active': 'active',
    'missed': 'missed',
    'closed': 'closed',
    'ai-handling': 'ai-handling',
    'ai-timeout': 'ai-timeout',
    'escalated': 'escalated'
  };
  
  return statusMap[status] || 'waiting';
}

/**
 * Maps legacy message to new message type
 */
export function mapLegacyMessage(legacyMessage: any): NewMessage {
  return {
    id: legacyMessage.id,
    type: legacyMessage.type || 'user',
    content: legacyMessage.content,
    timestamp: new Date(legacyMessage.timestamp),
    ...(legacyMessage.type === 'ai' && {
      feedbackSubmitted: legacyMessage.feedbackSubmitted,
      confidence: legacyMessage.confidence,
      sources: legacyMessage.sources
    })
  };
}

/**
 * Maps legacy user to new user type
 */
export function mapLegacyUser(legacyUser: any): NewUser {
  return {
    id: legacyUser.id,
    avatar: legacyUser.avatar,
    name: legacyUser.name,
    email: legacyUser.email,
    role: legacyUser.role || 'viewer',
    status: legacyUser.status || 'active',
    lastLoginAt: legacyUser.lastLoginAt ? new Date(legacyUser.lastLoginAt) : undefined,
    permissions: legacyUser.permissions || [],
    organizationId: legacyUser.organizationId,
    createdAt: new Date(legacyUser.createdAt || Date.now()),
    updatedAt: legacyUser.updatedAt ? new Date(legacyUser.updatedAt) : undefined,
    preferences: legacyUser.preferences || {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        sms: false,
        desktop: true,
        sound: true
      },
      dashboard: {
        defaultView: 'overview',
        widgetOrder: [],
        refreshInterval: 30000
      }
    }
  };
}

/**
 * Maps legacy organization to new organization type
 */
export function mapLegacyOrganization(legacyOrg: any): NewOrganization {
  return {
    id: legacyOrg.id,
    name: legacyOrg.name,
    domain: legacyOrg.domain,
    status: legacyOrg.status || 'active',
    plan: legacyOrg.plan || 'free',
    createdAt: new Date(legacyOrg.createdAt),
    updatedAt: legacyOrg.updatedAt ? new Date(legacyOrg.updatedAt) : undefined,
    settings: {
      allowedDomains: legacyOrg.allowedDomains || [],
      maxUsers: legacyOrg.maxUsers || 10,
      maxAgents: legacyOrg.maxAgents || 5,
      features: legacyOrg.features || [],
      integrations: legacyOrg.integrations || {},
      security: {
        enforceSSO: false,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: false,
          maxAge: 90,
          preventReuse: 5
        },
        sessionTimeout: 3600,
        auditLogs: true,
        encryptionEnabled: true
      }
    },
    contactInfo: {
      primaryContact: legacyOrg.primaryContact || '',
      billingEmail: legacyOrg.billingEmail || '',
      supportEmail: legacyOrg.supportEmail || ''
    }
  };
}

/**
 * Maps legacy widget settings to new consolidated settings
 */
export function mapLegacyWidgetSettings(legacySettings: any): NewWidgetSettings {
  return {
    appearance: {
      primaryColor: legacySettings.appearance?.primaryColor || '#0052CC',
      secondaryColor: legacySettings.appearance?.secondaryColor || '#17A2B8',
      textColor: legacySettings.appearance?.textColor || '#172B4D',
      backgroundColor: legacySettings.appearance?.backgroundColor || '#FFFFFF',
      headerText: legacySettings.appearance?.headerText || 'Support Chat',
      logoUrl: legacySettings.appearance?.logoUrl,
      fontFamily: legacySettings.appearance?.fontFamily || 'Inter, sans-serif',
      fontSize: legacySettings.appearance?.fontSize || 14,
      borderRadius: legacySettings.appearance?.borderRadius || 8,
      boxShadow: legacySettings.appearance?.boxShadow || '0 4px 12px rgba(0,0,0,0.15)',
      position: {
        placement: legacySettings.appearance?.position || 'bottom-right',
        offsetX: legacySettings.appearance?.paddingX || 20,
        offsetY: legacySettings.appearance?.paddingY || 20,
        zIndex: 1000
      },
      dimensions: {
        collapsed: { width: 60, height: 60 },
        expanded: { width: 400, height: 600 },
        mobile: { width: '100%', height: '100%' }
      },
      animations: {
        enableAnimations: true,
        openAnimation: 'slide',
        closeAnimation: 'slide',
        transitionDuration: 300,
        easing: 'ease-in-out'
      }
    },
    ai: {
      assistantName: legacySettings.aiSettings?.assistantName || 'AI Assistant',
      welcomeMessage: legacySettings.aiSettings?.welcomeMessage || 'Hello! How can I help you today?',
      model: legacySettings.integrations?.aiModel || 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: legacySettings.aiSettings?.maxTokens || 150,
      enableFeedback: legacySettings.aiSettings?.enableFeedback ?? true,
      enableSentimentAnalysis: false,
      responseDelay: {
        enabled: true,
        minDelaySeconds: legacySettings.aiSettings?.minMessageDelaySeconds || 1,
        maxDelaySeconds: 3,
        typingIndicator: true
      },
      escalation: {
        enabled: true,
        confidenceThreshold: 0.7,
        maxAttempts: 3,
        triggerKeywords: [],
        escalationMessage: 'Let me connect you with a human agent.',
        autoEscalate: false
      },
      limitations: {
        maxDailyMessages: legacySettings.aiSettings?.maxDailyMessages || 50,
        maxWeeklyMessages: legacySettings.aiSettings?.maxWeeklyMessages || 200,
        maxSessionMessages: 50,
        rateLimitPerMinute: 10,
        enableSpamPrevention: legacySettings.aiSettings?.enableSpamPrevention ?? true,
        cooldownPeriod: 60
      },
      personality: {
        tone: 'friendly',
        style: 'conversational',
        helpfulness: 'moderate'
      }
    },
    userInfo: {
      enableUserIdentification: legacySettings.userInfo?.enableUserIdentification ?? true,
      enableManualForm: legacySettings.userInfo?.enableManualForm ?? true,
      enableMoodleAuth: legacySettings.userInfo?.enableMoodleAuth ?? false,
      enableSSO: false,
      anonymousChat: false,
      identificationTiming: 'before-first-message',
      requiredFields: {
        name: legacySettings.userInfo?.requiredFields?.name ?? true,
        email: legacySettings.userInfo?.requiredFields?.email ?? true,
        mobile: legacySettings.userInfo?.requiredFields?.mobile ?? false,
        studentId: false,
        department: false,
        organization: false
      },
      customFields: [],
      validation: {
        emailValidation: true,
        phoneValidation: true,
        strictValidation: false,
        allowInternationalPhone: true,
        blockedDomains: [],
        allowedDomains: []
      }
    },
    integrations: legacySettings.integrations || {},
    voice: {
      enableVoiceCalls: legacySettings.voice?.enableVoiceCalls ?? false,
      enableVoicemail: legacySettings.voice?.enableVoicemail ?? false,
      provider: 'webrtc',
      configuration: {
        quality: 'standard',
        codec: 'opus',
        dtmfDetection: true
      },
      businessHours: {
        enabled: legacySettings.voice?.businessHours?.enabled ?? false,
        timezone: legacySettings.voice?.businessHours?.timezone || 'UTC',
        schedule: {
          monday: { enabled: true, open: '09:00', close: '17:00' },
          tuesday: { enabled: true, open: '09:00', close: '17:00' },
          wednesday: { enabled: true, open: '09:00', close: '17:00' },
          thursday: { enabled: true, open: '09:00', close: '17:00' },
          friday: { enabled: true, open: '09:00', close: '17:00' },
          saturday: { enabled: false, open: '09:00', close: '17:00' },
          sunday: { enabled: false, open: '09:00', close: '17:00' }
        },
        holidays: []
      },
      callRouting: {
        strategy: 'round-robin',
        fallback: 'voicemail',
        maxWaitTime: 300,
        queuePosition: true,
        musicOnHold: false
      },
      recording: {
        enabled: false,
        autoStart: false,
        announcement: true,
        retention: 30,
        transcription: false,
        storage: 'local'
      }
    },
    embed: {
      script: legacySettings.embed?.script || '',
      moodleChatPluginIntegration: legacySettings.embed?.moodleChatPluginIntegration ?? false,
      wordPressIntegration: false,
      shopifyIntegration: false,
      salesforceIntegration: false,
      allowedDomains: [],
      blocklistedDomains: [],
      enableCSP: true,
      sandboxMode: false
    },
    behavior: {
      autoOpen: {
        enabled: legacySettings.appearance?.autoOpenWidget ?? false,
        delay: 3000,
        conditions: [],
        frequency: 'once-per-session'
      },
      notifications: {
        sound: true,
        desktop: true,
        badge: true,
        vibration: false
      },
      session: {
        persistChat: true,
        sessionTimeout: 3600,
        idleTimeout: 1800,
        maxSessionDuration: 7200,
        warningBeforeTimeout: 300,
        autoCloseOnIdle: false
      },
      accessibility: {
        highContrast: false,
        fontSize: 'medium',
        keyboardNavigation: true,
        screenReaderSupport: true,
        focusIndicators: true,
        altTextForImages: true,
        ariaLabels: {}
      },
      mobile: {
        responsive: true,
        mobileBreakpoint: 768,
        fullScreenOnMobile: false,
        swipeGestures: true,
        touchOptimization: true,
        orientation: 'auto'
      }
    },
    version: '1.0.0',
    lastModified: new Date(),
    modifiedBy: 'system'
  };
}

// ============= Batch Migration Functions =============

/**
 * Migrates an array of legacy items to new types
 */
export function migrateLegacyChats(legacyChats: any[]): NewChatSession[] {
  return legacyChats.map(mapLegacyChat);
}

export function migrateLegacyMessages(legacyMessages: any[]): NewMessage[] {
  return legacyMessages.map(mapLegacyMessage);
}

export function migrateLegacyUsers(legacyUsers: any[]): NewUser[] {
  return legacyUsers.map(mapLegacyUser);
}

export function migrateLegacyOrganizations(legacyOrgs: any[]): NewOrganization[] {
  return legacyOrgs.map(mapLegacyOrganization);
}