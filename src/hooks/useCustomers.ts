/**
 * React Query hooks for customer data management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Customer } from '@/types';
import { toast } from '@/hooks/use-toast';
import { CustomerService } from '@/services/customerService';

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

// Fetch customers with pagination and search (dynamically aggregated from chats)
export function useCustomers(params: UseCustomersParams = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async () => {
      console.log('🔄 useCustomers: Fetching customers with params:', params);
      const result = await CustomerService.getCustomers(params);
      console.log('✅ useCustomers: Successfully fetched customers:', {
        count: result.data.length,
        total: result.pagination.total,
        params
      });
      return result;
    },
    meta: {
      errorMessage: 'Failed to load customer data'
    }
  });
}

// Find customer by email (from aggregated chat data)
export function useCustomerByEmail(email: string) {
  return useQuery({
    queryKey: ['customer', 'email', email],
    queryFn: () => CustomerService.getCustomerByEmail(email),
    enabled: !!email,
  });
}

// Create or update customer (using unified service)
export function useUpsertCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerData: Partial<Customer> & { email: string }) => 
      CustomerService.upsertCustomer(customerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
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