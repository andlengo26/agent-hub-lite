// Mock data interfaces for Customer Support AI Agent Admin Portal
// Static JSON files now serve as the primary data source

export interface Organization {
  id: string;
  name: string;
  logoUrl: string;
  activeAgents: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  avatarUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'agent' | 'manager';
  onlineStatus: 'online' | 'offline' | 'away';
  createdAt: string;
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
  assignedAgentId: string;
  createdAt: string;
  lastUpdatedAt: string;
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

// Minimal fallback data for when API calls fail or during testing
// Primary data now comes from /public/mocks/*.json files
export const fallbackData = {
  organizations: [
    {
      id: "fallback_001",
      name: "Sample Organization",
      logoUrl: "/placeholder.svg",
      activeAgents: 5,
      createdAt: "2025-01-01T00:00:00Z",
      status: "active" as const
    }
  ] as Organization[],
  
  users: [
    {
      id: "fallback_001",
      avatarUrl: "/placeholder.svg",
      firstName: "Sample",
      lastName: "User",
      email: "sample@example.com",
      role: "agent" as const,
      onlineStatus: "offline" as const,
      createdAt: "2025-01-01T00:00:00Z"
    }
  ] as User[],
  
  chats: [
    {
      id: "fallback_001",
      requesterName: "Sample Customer",
      requesterEmail: "customer@example.com",
      requesterPhone: "+1-555-0000",
      ipAddress: "192.168.1.1",
      browser: "Chrome 120.0",
      pageUrl: "https://example.com",
      status: "active" as const,
      assignedAgentId: "fallback_001",
      createdAt: "2025-01-01T00:00:00Z",
      lastUpdatedAt: "2025-01-01T00:00:00Z"
    }
  ] as Chat[],
  
  engagements: [] as Engagement[],
  documents: [] as Document[],
  scraperJobs: [] as ScraperJob[],
  faqs: [] as FAQ[],
  resources: [] as Resource[],
  domains: [] as Domain[]
};

// Legacy exports for backward compatibility - now point to fallback data
export const mockOrganizations = fallbackData.organizations;
export const mockUsers = fallbackData.users;
export const mockChats = fallbackData.chats;
export const mockEngagements = fallbackData.engagements;
export const mockDocuments = fallbackData.documents;
export const mockScraperJobs = fallbackData.scraperJobs;
export const mockFAQs = fallbackData.faqs;
export const mockResources = fallbackData.resources;
export const mockDomains = fallbackData.domains;

// Consolidated export
export const mockData = fallbackData;