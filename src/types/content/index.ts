/**
 * Content Management Type System
 * Types for documents, FAQs, resources, and content management
 */

import { BaseEntity } from '../core';

// ============= Document Types =============

export type DocumentType = 'pdf' | 'doc' | 'docx' | 'txt' | 'md' | 'html' | 'xlsx' | 'csv';
export type DocumentStatus = 'draft' | 'published' | 'archived' | 'deleted';

export interface Document extends BaseEntity {
  title: string;
  fileType: DocumentType;
  fileSizeKb: number;
  uploadedById: string;
  uploadedBy?: string;
  status: DocumentStatus;
  tags: string[];
  content?: string;
  summary?: string;
  downloadCount: number;
  lastAccessedAt?: Date;
  version: number;
  parentId?: string;
  permissions: DocumentPermissions;
}

export interface DocumentPermissions {
  read: string[];
  write: string[];
  delete: string[];
  public: boolean;
}

// ============= FAQ Types =============

export type FAQStatus = 'draft' | 'published' | 'archived';
export type FAQCategory = 'general' | 'technical' | 'billing' | 'account' | 'product';

export interface FAQ extends BaseEntity {
  question: string;
  answer: string;
  category: FAQCategory;
  status: FAQStatus;
  tags: string[];
  searchTerms: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdatedBy: string;
  priority: number;
  relatedFAQs?: string[];
}

export interface FAQSearchResult {
  faq: FAQ;
  relevanceScore: number;
  matchedTerms: string[];
}

// ============= Resource Types =============

export type ResourceType = 'document' | 'video' | 'link' | 'template' | 'image' | 'audio';
export type ResourceStatus = 'draft' | 'published' | 'archived';

export interface Resource extends BaseEntity {
  title: string;
  description?: string;
  type: ResourceType;
  status: ResourceStatus;
  tags: string[];
  url?: string;
  fileContent?: string;
  thumbnail?: string;
  duration?: number; // for video/audio
  downloadCount: number;
  viewCount: number;
  rating?: ResourceRating;
  metadata: ResourceMetadata;
  permissions: ResourcePermissions;
}

export interface ResourceRating {
  average: number;
  count: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ResourceMetadata {
  author?: string;
  publishedAt?: Date;
  language?: string;
  format?: string;
  size?: number;
  checksum?: string;
}

export interface ResourcePermissions {
  read: string[];
  download: string[];
  public: boolean;
  requiresAuthentication: boolean;
}

// ============= Content Categories =============

export interface ContentCategory extends BaseEntity {
  name: string;
  description?: string;
  parentId?: string;
  path: string;
  order: number;
  isActive: boolean;
  contentCount: number;
  icon?: string;
  color?: string;
}

// ============= Web Scraping Types =============

export type ScraperJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ScraperJobType = 'single-page' | 'multi-page' | 'sitemap' | 'recursive';

export interface ScraperJob extends BaseEntity {
  url: string;
  type: ScraperJobType;
  status: ScraperJobStatus;
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  totalPages?: number;
  scrapedPages: number;
  failedPages: number;
  settings: ScraperSettings;
  results: ScrapedContent[];
  error?: string;
  logs: ScraperLog[];
}

export interface ScraperSettings {
  maxDepth: number;
  maxPages: number;
  delay: number;
  followExternalLinks: boolean;
  includeImages: boolean;
  includeCSS: boolean;
  selector?: string;
  excludePatterns: string[];
  headers?: Record<string, string>;
  userAgent?: string;
  respectRobotsTxt: boolean;
}

export interface ScrapedContent extends BaseEntity {
  jobId: string;
  url: string;
  title: string;
  content: string;
  html?: string;
  metadata: ScrapedMetadata;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
  scrapedAt: Date;
}

export interface ScrapedMetadata {
  contentType: string;
  lastModified?: Date;
  size: number;
  language?: string;
  charset?: string;
  links: string[];
  images: string[];
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
}

export interface ScraperLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  url?: string;
  details?: any;
}

// ============= Content Search =============

export interface ContentSearchQuery {
  query: string;
  types?: (ResourceType | 'faq' | 'document')[];
  categories?: string[];
  tags?: string[];
  status?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'relevance' | 'date' | 'title' | 'views';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ContentSearchResult {
  id: string;
  type: 'faq' | 'document' | 'resource';
  title: string;
  description?: string;
  content?: string;
  url?: string;
  relevanceScore: number;
  matchedTerms: string[];
  highlightedContent?: string;
  metadata: {
    category?: string;
    tags: string[];
    lastUpdated: Date;
    views: number;
  };
}

export interface ContentSearchResponse {
  results: ContentSearchResult[];
  total: number;
  query: string;
  suggestions?: string[];
  facets: {
    types: Record<string, number>;
    categories: Record<string, number>;
    tags: Record<string, number>;
  };
  took: number; // search time in ms
}

// ============= Content Analytics =============

export interface ContentAnalytics {
  totalDocuments: number;
  totalFAQs: number;
  totalResources: number;
  totalViews: number;
  totalDownloads: number;
  popularContent: ContentSearchResult[];
  searchQueries: {
    query: string;
    count: number;
    results: number;
  }[];
  contentGaps: {
    query: string;
    count: number;
    results: number;
  }[];
  contentHealth: {
    outdatedContent: number;
    orphanedContent: number;
    duplicateContent: number;
  };
}