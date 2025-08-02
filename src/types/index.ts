// TypeScript interfaces for Customer Support AI Agent Admin Portal

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  lastEngagedAt: string;
  engagementCount: number;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl: string;
  activeAgents: number;
  createdAt: string;
  status: 'active' | 'inactive';
  plan?: string;
  members?: string[];
}

export interface User {
  id: string;
  avatar?: string;
  avatarUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'agent' | 'manager';
  onlineStatus: 'online' | 'offline' | 'away';
  createdAt: string;
  organizationId?: string;
}

export interface Chat {
  id: string;
  customerId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  ipAddress: string;
  browser: string;
  pageUrl: string;
  status: 'waiting' | 'active' | 'missed' | 'closed';
  assignedAgentId?: string;
  createdAt: string;
  lastUpdatedAt: string;
  geo: string;
  summary: string;
  
  // AI-first routing extensions (backward compatible)
  handledBy?: 'ai' | 'human';
  aiStartedAt?: string;
  humanHandoffAt?: string;
  anonymousUserId?: string; // For anonymous chat support
  aiTimeoutAt?: string; // When AI should timeout and escalate
}

// Legacy status type for backward compatibility
export type LegacyChatStatus = 'waiting' | 'active' | 'missed' | 'closed';

// Extended status type for AI-first routing
export type ChatStatus = LegacyChatStatus | 'ai-handling' | 'ai-timeout' | 'escalated';

// Chat filtering utilities
export interface ChatFilters {
  status?: ChatStatus[];
  handledBy?: ('ai' | 'human')[];
  agentId?: string;
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface Engagement {
  id: string;
  customerName: string;
  customerEmail: string;
  contactNumber: string;
  engagementCount: number;
  lastEngagedAt: string;
  agentsInvolved: string[];
  aiSummary: string;
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerEngagement {
  id: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  date: string;
  channel: 'chat' | 'email' | 'phone' | 'general';
  agentId: string;
  agentName: string;
  aiSummary: string;
  agentNotes: string;
  notes: Note[];
  tags: string[];
  transcript: string;
  sourceId?: string; // Reference to original chat, email, or call ID
}

export interface CustomerEngagementsResponse {
  customerId: string;
  customerName: string;
  customerEmail: string;
  contactNumber: string;
  engagements: CustomerEngagement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Document {
  id: string;
  title: string;
  fileType: string;
  fileSizeKb: number;
  uploadedById: string;
  uploadedAt: string;
  lastModifiedAt: string;
}

export interface ScraperJob {
  id: string;
  url: string;
  linkDepth: number;
  frequency: string | 'none';
  lastScrapedAt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scrapedData?: {
    pages: Array<{
      url: string;
      title: string;
      content: string;
      lastScraped: string;
    }>;
    totalPages: number;
    lastUpdated: string;
  };
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  tags: string[];
  type: 'document' | 'video' | 'link' | 'template';
  url?: string;
  fileContent?: string;
  fileName?: string;
  fileSize?: number;
  aiInstructions: string;
  uploadedById: string;
  uploadedAt: string;
  updatedAt: string;
  contentPreview?: string;
}

export interface Domain {
  id: string;
  domain: string;
  addedById: string;
  addedAt: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  chatId: string;
  sentAt: string;
  sentById: string;
}