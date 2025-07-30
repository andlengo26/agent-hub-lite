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
      console.log('🔍 CustomerDataService: Starting to fetch and aggregate customers from chats');
      
      const response = await fetch('/mocks/chats.json');
      if (!response.ok) {
        console.error('🚨 Failed to fetch chats:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        throw new Error(`Failed to fetch chats: ${response.status} ${response.statusText}`);
      }
      
      const chatData = await response.json();
      const chats: Chat[] = chatData.data || [];

      console.log(`📊 Raw chat data loaded: ${chats.length} chats`);

      if (!Array.isArray(chats)) {
        console.warn('Invalid chat data format: expected array');
        return [];
      }

      // Debug: Log sample of raw chat data
      console.table(chats.slice(0, 3).map(chat => ({
        id: chat.id,
        customerId: chat.customerId,
        requesterName: chat.requesterName,
        requesterEmail: chat.requesterEmail,
        status: chat.status
      })));

      // Track processing statistics
      let processedChats = 0;
      let skippedChats = 0;
      let inconsistentDataCount = 0;

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
        // Step 4: Generate customer ID if missing (defensive checks)
        const customerId = chat.customerId || `unknown_${chat.id || Date.now()}`;
        if (!chat.customerId) {
          if (chat.requesterEmail) {
            chat.customerId = `auto_${chat.requesterEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
            console.log(`🔧 Generated customer ID: ${chat.customerId} for email: ${chat.requesterEmail}`);
          } else {
            chat.customerId = `anon_${chat.id || Date.now()}_${Date.now()}`;
            console.log(`🔧 Generated anonymous customer ID: ${chat.customerId} for chat: ${chat.id}`);
          }
        }

        // Create fallback customer data with guaranteed defaults
        const customerName = chat.requesterName || 
                           (chat.requesterEmail ? chat.requesterEmail.split('@')[0] : null) ||
                           "Unknown Customer";
        
        const customerEmail = chat.requesterEmail || "No email";

        // Always process the chat, even with missing data
        if (!customerMap.has(chat.customerId)) {
          // Use first occurrence as canonical customer data
          customerMap.set(chat.customerId, {
            id: chat.customerId,
            name: customerName,
            email: customerEmail,
            phone: chat.requesterPhone || '',
            chats: [],
            dataSource: chat.id
          });
          console.log(`✨ Created new customer: ${chat.customerId} (${customerName})`);
        } else {
          // Check for data inconsistencies (for debugging)
          const existing = customerMap.get(chat.customerId)!;
          if (existing.name !== customerName || 
              existing.email !== customerEmail || 
              existing.phone !== (chat.requesterPhone || '')) {
            inconsistentDataCount++;
            console.warn(`⚠️ Data inconsistency detected for customer ${chat.customerId}:`, {
              existing: { name: existing.name, email: existing.email, phone: existing.phone },
              current: { name: customerName, email: customerEmail, phone: chat.requesterPhone },
              sourceChat: existing.dataSource,
              conflictingChat: chat.id
            });
          }
        }
        
        customerMap.get(chat.customerId)!.chats.push(chat);
        processedChats++;
      });

      // Log processing statistics
      console.log(`📈 Processing complete:`, {
        totalChats: chats.length,
        processedChats,
        skippedChats,
        uniqueCustomers: customerMap.size,
        inconsistentDataCount
      });

      // Convert to Customer objects with aggregated data
      const customers: Customer[] = Array.from(customerMap.values()).map(customerData => {
        const sortedChats = customerData.chats.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const firstChat = sortedChats[sortedChats.length - 1];
        const lastChat = sortedChats[0];

        const customer = {
          id: customerData.id || `fallback_${Date.now()}`,
          name: customerData.name || 'Unknown Customer',
          email: customerData.email || 'No email',
          phone: customerData.phone || '',
          createdAt: firstChat?.createdAt || new Date().toISOString(),
          lastEngagedAt: lastChat?.lastUpdatedAt || lastChat?.createdAt || new Date().toISOString(),
          engagementCount: customerData.chats.length || 0
        };

        // Step 4: Validate customer data integrity with fallbacks
        if (!customer.id) {
          customer.id = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          console.warn('⚠️ Emergency ID generated for customer:', customer);
        }
        if (!customer.name) {
          customer.name = 'Unknown Customer';
          console.warn('⚠️ Fallback name applied for customer:', customer.id);
        }
        if (!customer.email) {
          customer.email = 'No email';
          console.warn('⚠️ Fallback email applied for customer:', customer.id);
        }

        return customer;
      });

      // Sort by most recent engagement
      const sortedCustomers = customers.sort((a, b) => 
        new Date(b.lastEngagedAt).getTime() - new Date(a.lastEngagedAt).getTime()
      );

      // Debug: Log final customer summary
      console.log(`✅ Customer aggregation complete: ${sortedCustomers.length} customers`);
      console.table(sortedCustomers.slice(0, 5).map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        engagementCount: customer.engagementCount,
        lastEngagedAt: customer.lastEngagedAt
      })));

      return sortedCustomers;
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