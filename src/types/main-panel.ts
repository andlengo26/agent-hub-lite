/**
 * Type definitions for MainPanel component
 */

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'link' | 'template';
  aiInstructions: string;
  url?: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'agent';
  timestamp: string;
}

export interface ChatHistory {
  id: string;
  status: 'active' | 'ended' | 'idle' | 'idle_timeout';
  timestamp: string;
  messages: ChatMessage[];
}

export interface IdentificationSession {
  id: string;
  userData: {
    name?: string;
    email?: string;
    phone?: string;
  };
  isValid: boolean;
  timestamp: string;
}