/**
 * React Query hooks for customer data management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Customer } from '@/types';
import { toast } from '@/hooks/use-toast';
import { CustomerDataService } from '@/services/customerDataService';

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
    queryFn: () => CustomerDataService.getCustomers(params),
  });
}

// Find customer by email (from aggregated chat data)
export function useCustomerByEmail(email: string) {
  return useQuery({
    queryKey: ['customer', 'email', email],
    queryFn: () => CustomerDataService.getCustomerByEmail(email),
    enabled: !!email,
  });
}

// Create or update customer (using unified service)
export function useUpsertCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerData: Partial<Customer> & { email: string }) => 
      CustomerDataService.upsertCustomer(customerData),
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