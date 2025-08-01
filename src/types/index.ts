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
  status: 'active' | 'missed' | 'closed';
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