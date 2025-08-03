/**
 * Validation schemas using Zod
 * Provides type-safe form validation for the admin interface
 */

import { z } from 'zod';

// Organization validation schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name too long'),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name too long').optional(),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
});

// User validation schemas
export const inviteUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'Name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'agent', 'manager']).default('agent'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'Name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['admin', 'agent', 'manager']).optional(),
  onlineStatus: z.enum(['online', 'offline', 'away']).optional(),
});

// Widget settings validation schemas
export const widgetIntegrationsSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
  aiModel: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-2']).default('gpt-4'),
  moodleUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  moodleToken: z.string().optional(),
});

export const widgetAiSettingsSchema = z.object({
  assistantName: z.string().min(1, 'Assistant name is required').max(50, 'Name too long'),
  welcomeMessage: z.string().min(1, 'Welcome message is required').max(200, 'Message too long'),
  tone: z.enum(['friendly', 'professional', 'casual', 'formal']).default('friendly'),
  customPrompt: z.string().max(500, 'Prompt too long').optional(),
  sessionTimeout: z.number().min(5, 'Minimum 5 minutes').max(120, 'Maximum 120 minutes'),
  idleTimeout: z.number().min(1, 'Minimum 1 minute').max(60, 'Maximum 60 minutes'),
});

export const widgetAppearanceSchema = z.object({
  headerText: z.string().min(1, 'Header text is required').max(50, 'Text too long'),
  subheaderText: z.string().max(100, 'Text too long').optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  highlightColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  buttonPosition: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']).default('bottom-right'),
  minimizedText: z.string().min(1, 'Minimized text is required').max(20, 'Text too long'),
  autoOpenWidget: z.boolean().default(false),
});

export const widgetUserInfoSchema = z.object({
  anonymousChat: z.boolean().default(true),
  requiredFields: z.object({
    name: z.boolean().default(false),
    email: z.boolean().default(false),
    mobile: z.boolean().default(false),
  }),
}).refine((data) => {
  if (!data.anonymousChat) {
    return data.requiredFields.name || data.requiredFields.email || data.requiredFields.mobile;
  }
  return true;
}, {
  message: "At least one field must be required when anonymous chat is disabled",
  path: ["requiredFields"]
});

export const widgetVoiceSchema = z.object({
  enableVoiceCalls: z.boolean().default(false),
  enableVoicemails: z.boolean().default(false),
  businessHours: z.object({
    start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  }),
});

// Type exports
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type WidgetIntegrationsInput = z.infer<typeof widgetIntegrationsSchema>;
export type WidgetAiSettingsInput = z.infer<typeof widgetAiSettingsSchema>;
export type WidgetAppearanceInput = z.infer<typeof widgetAppearanceSchema>;
export type WidgetUserInfoInput = z.infer<typeof widgetUserInfoSchema>;
export type WidgetVoiceInput = z.infer<typeof widgetVoiceSchema>;

// User identification validation schemas
export const userIdentificationFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  mobile: z.string().regex(/^[\+]?[1-9][\d\s\-\(\)]{8,15}$/, 'Invalid phone number').optional(),
}).refine((data) => {
  return data.name || data.email || data.mobile;
}, {
  message: "At least one field is required",
  path: ["name"]
});

export type UserIdentificationFormInput = z.infer<typeof userIdentificationFormSchema>;