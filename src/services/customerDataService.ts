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
      const chatData = await response.json();
      const chats: Chat[] = chatData.data;

      // Group chats by customer ID
      const customerMap = new Map<string, {
        id: string;
        name: string;
        email: string;
        phone: string;
        chats: Chat[];
      }>();

      chats.forEach(chat => {
        if (!customerMap.has(chat.customerId)) {
          customerMap.set(chat.customerId, {
            id: chat.customerId,
            name: chat.requesterName,
            email: chat.requesterEmail,
            phone: chat.requesterPhone,
            chats: []
          });
        }
        customerMap.get(chat.customerId)!.chats.push(chat);
      });

      // Convert to Customer objects with aggregated data
      const customers: Customer[] = Array.from(customerMap.values()).map(customerData => {
        const sortedChats = customerData.chats.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
          id: customerData.id,
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          createdAt: sortedChats[sortedChats.length - 1].createdAt, // First chat
          lastEngagedAt: sortedChats[0].lastUpdatedAt, // Most recent activity
          engagementCount: customerData.chats.length
        };
      });

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
   * Create or update customer record (simulated)
   */
  static async upsertCustomer(customerData: Partial<Customer> & { email: string }): Promise<Customer> {
    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      name: customerData.name || customerData.email,
      phone: customerData.phone || '',
      createdAt: new Date().toISOString(),
      lastEngagedAt: new Date().toISOString(),
      engagementCount: 1,
      ...customerData,
    };

    return newCustomer;
  }
}