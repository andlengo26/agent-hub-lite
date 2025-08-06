/**
 * Chat and Messaging Type System
 * Consolidated types for all chat-related functionality
 */

import { BaseEntity } from '../core';

// ============= Message Types =============

export type MessageType = 'user' | 'ai' | 'identification' | 'system';

export interface BaseMessage extends BaseEntity {
  type: MessageType;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserMessage extends BaseMessage {
  type: 'user';
  attachments?: MessageAttachment[];
}

export interface AIMessage extends BaseMessage {
  type: 'ai';
  feedbackSubmitted?: boolean;
  confidence?: number;
  sources?: string[];
}

export interface IdentificationMessage extends BaseMessage {
  type: 'identification';
  isCompleted: boolean;
  identificationData?: UserIdentificationData;
}

export interface SystemMessage extends BaseMessage {
  type: 'system';
  level: 'info' | 'warning' | 'error';
}

export type Message = UserMessage | AIMessage | IdentificationMessage | SystemMessage;

// ============= Message Attachments =============

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
}

// ============= Chat Session Types =============

export type ChatStatus = 'waiting' | 'active' | 'missed' | 'closed' | 'ai-handling' | 'ai-timeout' | 'escalated';

export interface ChatSession extends BaseEntity {
  customerId: string;
  customerName: string;
  customerEmail?: string;
  status: ChatStatus;
  assignedTo?: string;
  handledBy: 'ai' | 'human';
  startTime: Date;
  endTime?: Date;
  summary?: string;
  tags?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'widget' | 'email' | 'phone' | 'social';
  lastMessage?: Message;
  unreadCount?: number;
  waitTime?: number;
  aiHandoffReason?: string;
  escalationReason?: string;
}

// ============= Chat Filtering =============

export interface ChatFilters {
  status?: ChatStatus[];
  handledBy?: ('ai' | 'human')[];
  assignedTo?: string[];
  priority?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

// ============= Chat Analytics =============

export interface ChatMetrics {
  totalChats: number;
  activeChatscountByStatus: Record<ChatStatus, number>;
  averageWaitTime: number;
  averageResolutionTime: number;
  aiHandleRate: number;
  escalationRate: number;
  customerSatisfaction?: number;
}

// ============= User Identification =============

export type IdentificationType = 'manual_form_submission' | 'moodle_authentication' | 'sso' | 'guest';

export interface UserIdentificationData {
  name?: string;
  email?: string;
  mobile?: string;
  studentId?: string;
  department?: string;
  customFields?: Record<string, string>;
}

export interface IdentificationSession extends BaseEntity {
  type: IdentificationType;
  userData: UserIdentificationData;
  timestamp: Date;
  isValid: boolean;
  sessionToken?: string;
  expiresAt?: Date;
}

export interface IdentificationFormData {
  name: string;
  email: string;
  mobile: string;
}

export interface IdentificationValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

export interface UserIdentificationState {
  isRequired: boolean;
  isCompleted: boolean;
  currentSession?: IdentificationSession;
  formData: IdentificationFormData;
  validationResult?: IdentificationValidationResult;
}

// ============= Conversation Analytics =============

export interface ConversationTransition {
  from: ChatStatus;
  to: ChatStatus;
  timestamp: Date;
  triggeredBy: 'ai' | 'human' | 'system';
  reason?: string;
  duration?: number;
}

export interface ConversationAnalytics {
  chatId: string;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  messageCount: number;
  transitions: ConversationTransition[];
  aiConfidenceAverage?: number;
  escalationPoints?: Date[];
  customerSatisfactionScore?: number;
}

// ============= Chat Widget State =============

export type PanelType = 'main' | 'chat' | 'faq-detail' | 'resource-detail' | 'message-detail';
export type TabType = 'home' | 'messages' | 'resources';

export interface ChatWidgetState {
  isExpanded: boolean;
  isMaximized: boolean;
  currentPanel: PanelType;
  activeTab: TabType;
  selectedResource?: any;
  selectedFAQ?: any;
  selectedChat?: any;
  searchQuery: string;
  showConversationEndModal: boolean;
}

// ============= Quota and Spam Prevention =============

export interface QuotaState {
  dailyMessageCount: number;
  weeklyMessageCount: number;
  monthlyMessageCount: number;
  lastMessageTime?: Date;
  isBlocked: boolean;
  resetDate: Date;
}

export interface SpamPreventionState {
  messageCount: number;
  timeWindow: number;
  lastResetTime: Date;
  isBlocked: boolean;
  blockDuration: number;
}

// ============= Session Management =============

export interface SessionTimerState {
  startTime: Date;
  duration: number;
  isActive: boolean;
  maxDuration?: number;
  warningThreshold?: number;
}

export interface WaitTimeState {
  queuePosition: number;
  estimatedWaitTime: number;
  startTime: Date;
  isWaiting: boolean;
}