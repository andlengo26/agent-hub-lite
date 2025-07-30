/**
 * React Query hooks for customer data management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Customer } from '@/types';
import { toast } from '@/hooks/use-toast';

interface CustomersResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Fetch customers with pagination and search
export function useCustomers(params: UseCustomersParams = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async (): Promise<CustomersResponse> => {
      // Simulate API call with mock data
      const response = await fetch('/mocks/customers.json');
      const data: CustomersResponse = await response.json();
      
      let filteredData = data.data;

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
    },
  });
}

// Find customer by email
export function useCustomerByEmail(email: string) {
  return useQuery({
    queryKey: ['customer', 'email', email],
    queryFn: async (): Promise<Customer | null> => {
      const response = await fetch('/mocks/customers.json');
      const data: CustomersResponse = await response.json();
      
      return data.data.find(customer => customer.email === email) || null;
    },
    enabled: !!email,
  });
}

// Create or update customer
export function useUpsertCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData: Partial<Customer> & { email: string }): Promise<Customer> => {
      // Simulate API call - in real implementation this would create/update customer
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer record updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update customer record",
        variant: "destructive",
      });
    },
  });
}