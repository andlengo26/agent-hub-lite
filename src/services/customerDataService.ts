/**
 * Unified Customer Data Service
 * Aggregates customer data from chats and provides consistent interface
 */

import { Customer, Chat } from '@/types';

interface CustomersResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class CustomerDataService {
  /**
   * Aggregates customers from chat data with calculated engagement metrics
   */
  static async getCustomersFromChats(): Promise<Customer[]> {
    try {
      const response = await fetch('/mocks/chats.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch chats: ${response.status} ${response.statusText}`);
      }
      
      const chatData = await response.json();
      const chats: Chat[] = chatData.data || [];

      if (!Array.isArray(chats)) {
        console.warn('Invalid chat data format: expected array');
        return [];
      }

      // Group chats by customer ID and track data consistency
      const customerMap = new Map<string, {
        id: string;
        name: string;
        email: string;
        phone: string;
        chats: Chat[];
        dataSource: string; // Track which chat provided the customer data
      }>();

      chats.forEach(chat => {
        // Validate chat data
        if (!chat.customerId || !chat.requesterName || !chat.requesterEmail) {
          console.warn(`Incomplete chat data for chat ${chat.id}:`, {
            customerId: chat.customerId,
            requesterName: chat.requesterName,
            requesterEmail: chat.requesterEmail
          });
          return;
        }

        if (!customerMap.has(chat.customerId)) {
          // Use first occurrence as canonical customer data
          customerMap.set(chat.customerId, {
            id: chat.customerId,
            name: chat.requesterName,
            email: chat.requesterEmail,
            phone: chat.requesterPhone || '',
            chats: [],
            dataSource: chat.id
          });
        } else {
          // Check for data inconsistencies (for debugging)
          const existing = customerMap.get(chat.customerId)!;
          if (existing.name !== chat.requesterName || 
              existing.email !== chat.requesterEmail || 
              existing.phone !== chat.requesterPhone) {
            console.warn(`Data inconsistency detected for customer ${chat.customerId}:`, {
              existing: { name: existing.name, email: existing.email, phone: existing.phone },
              current: { name: chat.requesterName, email: chat.requesterEmail, phone: chat.requesterPhone },
              sourceChat: existing.dataSource,
              conflictingChat: chat.id
            });
          }
        }
        
        customerMap.get(chat.customerId)!.chats.push(chat);
      });

      // Convert to Customer objects with aggregated data
      const customers: Customer[] = Array.from(customerMap.values()).map(customerData => {
        const sortedChats = customerData.chats.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const firstChat = sortedChats[sortedChats.length - 1];
        const lastChat = sortedChats[0];

        return {
          id: customerData.id,
          name: customerData.name || 'Unknown Customer',
          email: customerData.email || '',
          phone: customerData.phone || '',
          createdAt: firstChat?.createdAt || new Date().toISOString(),
          lastEngagedAt: lastChat?.lastUpdatedAt || lastChat?.createdAt || new Date().toISOString(),
          engagementCount: customerData.chats.length
        };
      });

      // Sort by most recent engagement
      return customers.sort((a, b) => 
        new Date(b.lastEngagedAt).getTime() - new Date(a.lastEngagedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to fetch customers from chats:', error);
      return [];
    }
  }

  /**
   * Gets paginated customers with search filtering
   */
  static async getCustomers(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<CustomersResponse> {
    const customers = await this.getCustomersFromChats();
    let filteredData = customers;

    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredData = filteredData.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
      },
    };
  }

  /**
   * Find customer by email from chat data
   */
  static async getCustomerByEmail(email: string): Promise<Customer | null> {
    const customers = await this.getCustomersFromChats();
    return customers.find(customer => customer.email === email) || null;
  }

  /**
   * Create or update customer record with engagement count calculation
   */
  static async upsertCustomer(customerData: Partial<Customer> & { email: string }): Promise<Customer> {
    // Check if customer already exists
    const existingCustomer = await this.getCustomerByEmail(customerData.email);
    
    if (existingCustomer) {
      // Update existing customer
      const updatedCustomer: Customer = {
        ...existingCustomer,
        ...customerData,
        lastEngagedAt: new Date().toISOString(),
        engagementCount: existingCustomer.engagementCount + 1,
      };
      
      console.log('Updated existing customer:', updatedCustomer);
      return updatedCustomer;
    }

    // Create new customer
    const newCustomer: Customer = {
      id: customerData.id || `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: customerData.name || customerData.email,
      phone: customerData.phone || '',
      createdAt: new Date().toISOString(),
      lastEngagedAt: new Date().toISOString(),
      engagementCount: 1,
      ...customerData,
    };

    console.log('Created new customer:', newCustomer);
    return newCustomer;
  }
}