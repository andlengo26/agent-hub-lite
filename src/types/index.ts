// TypeScript interfaces for Customer Support AI Agent Admin Portal

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

export interface CustomerEngagement {
  id: string;
  customerId: string;
  date: string;
  channel: 'chat' | 'email' | 'phone';
  agentId: string;
  agentName: string;
  aiSummary: string;
  agentNotes: string;
  tags: string[];
  transcript: string;
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
  frequency: string;
  lastScrapedAt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
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
  url: string;
  aiInstructions: string;
  uploadedById: string;
  uploadedAt: string;
  updatedAt: string;
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