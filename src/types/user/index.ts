/**
 * User and Organization Type System
 * Types for users, organizations, customers, and related entities
 */

import { BaseEntity } from '../core';

// ============= User Types =============

export type UserRole = 'admin' | 'agent' | 'manager' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User extends BaseEntity {
  avatar?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  permissions?: string[];
  organizationId: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  desktop: boolean;
  sound: boolean;
}

export interface DashboardPreferences {
  defaultView: string;
  widgetOrder: string[];
  refreshInterval: number;
}

// ============= Customer Types =============

export type CustomerStatus = 'new' | 'active' | 'inactive' | 'vip' | 'blocked';

export interface Customer extends BaseEntity {
  email: string;
  name?: string;
  phone?: string;
  status: CustomerStatus;
  organizationId: string;
  firstContactAt: Date;
  lastContactAt?: Date;
  totalEngagements: number;
  satisfactionScore?: number;
  tags?: string[];
  customFields?: Record<string, any>;
  preferences?: CustomerPreferences;
}

export interface CustomerPreferences {
  communicationChannel: 'email' | 'chat' | 'phone' | 'sms';
  language: string;
  timezone: string;
  doNotContact: boolean;
}

// ============= Organization Types =============

export type OrganizationStatus = 'active' | 'trial' | 'suspended' | 'cancelled';
export type OrganizationPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface Organization extends BaseEntity {
  name: string;
  domain: string;
  status: OrganizationStatus;
  plan: OrganizationPlan;
  settings: OrganizationSettings;
  subscription?: SubscriptionInfo;
  contactInfo: ContactInfo;
  customization?: OrganizationCustomization;
}

export interface OrganizationSettings {
  allowedDomains: string[];
  maxUsers: number;
  maxAgents: number;
  features: string[];
  integrations: IntegrationSettings;
  security: SecuritySettings;
}

export interface SubscriptionInfo {
  planId: string;
  status: 'active' | 'trial' | 'past_due' | 'cancelled';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  autoRenew: boolean;
  billingCycle: 'monthly' | 'annual';
}

export interface ContactInfo {
  primaryContact: string;
  billingEmail: string;
  supportEmail: string;
  phone?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrganizationCustomization {
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  customCSS?: string;
}

// ============= Integration Settings =============

export interface IntegrationSettings {
  moodle?: MoodleIntegration;
  slack?: SlackIntegration;
  teams?: TeamsIntegration;
  email?: EmailIntegration;
  sms?: SMSIntegration;
  crm?: CRMIntegration;
}

export interface MoodleIntegration {
  enabled: boolean;
  moodleUrl: string;
  apiToken: string;
  autoLogin: boolean;
  syncUsers: boolean;
  requiredFields: {
    studentId: boolean;
    department: boolean;
  };
}

export interface SlackIntegration {
  enabled: boolean;
  workspaceId: string;
  botToken: string;
  channels: string[];
  notifications: boolean;
}

export interface TeamsIntegration {
  enabled: boolean;
  tenantId: string;
  clientId: string;
  notifications: boolean;
}

export interface EmailIntegration {
  enabled: boolean;
  provider: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
  apiKey?: string;
  smtpConfig?: SMTPConfig;
  templates: EmailTemplateConfig;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}

export interface EmailTemplateConfig {
  welcome: string;
  notification: string;
  summary: string;
  followUp: string;
}

export interface SMSIntegration {
  enabled: boolean;
  provider: 'twilio' | 'nexmo' | 'plivo';
  apiKey: string;
  fromNumber: string;
}

export interface CRMIntegration {
  enabled: boolean;
  provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho';
  apiKey: string;
  syncContacts: boolean;
  syncActivities: boolean;
}

// ============= Security Settings =============

export interface SecuritySettings {
  enforceSSO: boolean;
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
  ipWhitelist?: string[];
  auditLogs: boolean;
  encryptionEnabled: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxAge: number;
  preventReuse: number;
}