/**
 * Simplified customer data service
 */

import { Customer } from '@/types';
import { apiClient } from '@/lib/api-client';

interface CustomersResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class CustomerService {
  /**
   * Get customers with pagination and search
   */
  static async getCustomers(params: { 
    page?: number; 
    limit?: number; 
    search?: string; 
  } = {}): Promise<CustomersResponse> {
    try {
      // For now, aggregate from chats since we don't have a direct customer endpoint
      const chatsResponse = await apiClient.getChats({ page: 1, limit: 1000 });
      const chats = chatsResponse.data || [];
      
      // Group by email to create customers
      const customerMap = new Map<string, Customer>();
      
      chats.forEach(chat => {
        if (!chat.requesterEmail) return;
        
        const existingCustomer = customerMap.get(chat.requesterEmail);
        
        if (existingCustomer) {
          existingCustomer.engagementCount += 1;
          existingCustomer.lastEngagedAt = new Date(Math.max(
            new Date(existingCustomer.lastEngagedAt).getTime(),
            new Date(chat.createdAt).getTime()
          )).toISOString();
        } else {
          customerMap.set(chat.requesterEmail, {
            id: chat.customerId || `cust_${Date.now()}_${Math.random()}`,
            email: chat.requesterEmail,
            name: chat.requesterName || chat.requesterEmail,
            phone: chat.requesterPhone,
            engagementCount: 1,
            lastEngagedAt: chat.createdAt,
            createdAt: chat.createdAt,
          });
        }
      });
      
      let customers = Array.from(customerMap.values());
      
      // Apply search filter
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        customers = customers.filter(customer => 
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm)
        );
      }
      
      // Sort by last engaged
      customers.sort((a, b) => 
        new Date(b.lastEngagedAt).getTime() - new Date(a.lastEngagedAt).getTime()
      );
      
      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const startIndex = (page - 1) * limit;
      const paginatedCustomers = customers.slice(startIndex, startIndex + limit);
      
      return {
        data: paginatedCustomers,
        pagination: {
          page,
          limit,
          total: customers.length,
          totalPages: Math.ceil(customers.length / limit),
        },
      };
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      return {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }
  }

  /**
   * Get customer by email
   */
  static async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      const response = await this.getCustomers({ search: email, limit: 1 });
      const customer = response.data.find(c => c.email === email);
      return customer || null;
    } catch (error) {
      console.error('Failed to fetch customer by email:', error);
      return null;
    }
  }

  /**
   * Create or update customer
   */
  static async upsertCustomer(customerData: Partial<Customer> & { email: string }): Promise<Customer> {
    try {
      const existingCustomer = await this.getCustomerByEmail(customerData.email);
      
      if (existingCustomer) {
        // Update existing customer
        const updatedCustomer: Customer = {
          ...existingCustomer,
          ...customerData,
          engagementCount: existingCustomer.engagementCount + 1,
          lastEngagedAt: new Date().toISOString(),
        };
        return updatedCustomer;
      } else {
        // Create new customer
        const newCustomer: Customer = {
          id: `cust_${Date.now()}_${Math.random()}`,
          name: customerData.name || customerData.email,
          email: customerData.email,
          phone: customerData.phone,
          engagementCount: 1,
          lastEngagedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          ...customerData,
        };
        return newCustomer;
      }
    } catch (error) {
      console.error('Failed to upsert customer:', error);
      throw error;
    }
  }
}