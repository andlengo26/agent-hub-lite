/**
 * Enhanced Engagement Service for Multi-Channel Customer Interactions
 * Handles real-time engagement creation and chronological history building
 */

import { CustomerEngagement, Chat, Customer, Note } from '@/types';
import { CustomerDataService } from './customerDataService';

interface CreateEngagementFromChatParams {
  chat: Chat;
  agentId: string;
  agentName: string;
  aiSummary?: string;
  notes?: string[];
}

interface CreateEngagementFromEmailParams {
  customerId?: string;
  customerEmail: string;
  customerName?: string;
  agentId: string;
  agentName: string;
  subject: string;
  content: string;
  aiSummary?: string;
  notes?: string[];
}

interface CreateEngagementFromPhoneParams {
  customerId?: string;
  customerPhone: string;
  customerName?: string;
  agentId: string;
  agentName: string;
  duration: number;
  summary: string;
  aiSummary?: string;
  notes?: string[];
}

export class EngagementService {
  /**
   * Creates a customer engagement from a chat interaction
   */
  static async createEngagementFromChat(params: CreateEngagementFromChatParams): Promise<CustomerEngagement> {
    const { chat, agentId, agentName, aiSummary = '', notes = [] } = params;

    // Ensure customer exists
    await CustomerDataService.upsertCustomer({
      id: chat.customerId,
      email: chat.requesterEmail,
      name: chat.requesterName,
      phone: chat.requesterPhone,
    });

    const engagement: CustomerEngagement = {
      id: `eng_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: chat.customerId,
      customerName: chat.requesterName,
      customerEmail: chat.requesterEmail,
      date: new Date().toISOString(),
      channel: 'chat',
      agentId,
      agentName,
      aiSummary: aiSummary || chat.summary || '',
      agentNotes: '',
      notes: this.createNotesFromStrings(notes, agentId, agentName),
      tags: [],
      transcript: `Chat from ${chat.pageUrl || 'website'}`,
      sourceId: chat.id,
    };

    // Simulate saving to backend
    await this.saveEngagement(engagement);
    return engagement;
  }

  /**
   * Creates a customer engagement from an email interaction
   */
  static async createEngagementFromEmail(params: CreateEngagementFromEmailParams): Promise<CustomerEngagement> {
    const { customerEmail, customerName, agentId, agentName, subject, content, aiSummary = '', notes = [] } = params;

    // Find or create customer
    let customer = await CustomerDataService.getCustomerByEmail(customerEmail);
    if (!customer) {
      customer = await CustomerDataService.upsertCustomer({
        email: customerEmail,
        name: customerName || customerEmail,
      });
    }

    const engagement: CustomerEngagement = {
      id: `eng_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: params.customerId || customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      date: new Date().toISOString(),
      channel: 'email',
      agentId,
      agentName,
      aiSummary,
      agentNotes: '',
      notes: this.createNotesFromStrings(notes, agentId, agentName),
      tags: [],
      transcript: `Email: ${subject}\n\n${content}`,
    };

    await this.saveEngagement(engagement);
    return engagement;
  }

  /**
   * Creates a customer engagement from a phone interaction
   */
  static async createEngagementFromPhone(params: CreateEngagementFromPhoneParams): Promise<CustomerEngagement> {
    const { customerPhone, customerName, agentId, agentName, duration, summary, aiSummary = '', notes = [] } = params;

    // Find or create customer by phone
    let customer: Customer | null = null;
    if (params.customerId) {
      const customers = await CustomerDataService.getCustomersFromChats();
      customer = customers.find(c => c.id === params.customerId) || null;
    }

    if (!customer) {
      customer = await CustomerDataService.upsertCustomer({
        email: customerName ? `${customerName.toLowerCase().replace(/\s+/g, '.')}@phone.contact` : `${customerPhone}@phone.contact`,
        name: customerName || `Phone Contact ${customerPhone}`,
        phone: customerPhone,
      });
    }

    const engagement: CustomerEngagement = {
      id: `eng_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      date: new Date().toISOString(),
      channel: 'phone',
      agentId,
      agentName,
      aiSummary,
      agentNotes: '',
      notes: this.createNotesFromStrings(notes, agentId, agentName),
      tags: [],
      transcript: `Phone call (${duration} minutes): ${summary}`,
    };

    await this.saveEngagement(engagement);
    return engagement;
  }

  /**
   * Adds a note to an existing engagement
   */
  static async addNoteToEngagement(engagementId: string, note: string, authorId: string, authorName: string): Promise<Note> {
    const newNote: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: note,
      authorId,
      authorName,
      createdAt: new Date().toISOString(),
    };

    // In a real implementation, this would update the engagement in the database
    console.log(`Adding note to engagement ${engagementId}:`, newNote);
    
    return newNote;
  }

  /**
   * Helper method to create Note objects from string arrays
   */
  private static createNotesFromStrings(notes: string[], authorId: string, authorName: string): Note[] {
    return notes.map(noteContent => ({
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: noteContent,
      authorId,
      authorName,
      createdAt: new Date().toISOString(),
    }));
  }

  /**
   * Simulates saving an engagement to the backend
   */
  private static async saveEngagement(engagement: CustomerEngagement): Promise<void> {
    // In a real implementation, this would make an API call
    console.log('Saving engagement:', engagement);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Gets engagement count for a customer
   */
  static async getEngagementCountForCustomer(customerId: string): Promise<number> {
    try {
      // This would typically query the database
      // For now, we'll simulate based on mock data
      const response = await fetch('/mocks/customer-engagements.json');
      if (!response.ok) return 0;
      
      const data = await response.json();
      return data.engagements?.filter((eng: any) => eng.customerId === customerId)?.length || 0;
    } catch (error) {
      console.error('Failed to get engagement count:', error);
      return 0;
    }
  }
}